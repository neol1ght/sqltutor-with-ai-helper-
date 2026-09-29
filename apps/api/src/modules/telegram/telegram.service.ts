import {
    Injectable,
    OnModuleDestroy,
    OnModuleInit,
} from '@nestjs/common';

import {
    Context,
    Markup,
    Telegraf,
} from 'telegraf';

import { TelegramLinkService } from './telegram-link.service.js';
import { CasesService } from '../cases/cases.service.js';
import { ExercisesService } from '../exercises/exercises.service.js';
import { TelegramSessionService } from './telegram-session.service.js';
import { SqlService } from '../sql/sql.service.js';
import { ProgressService } from '../progress/progress.service.js';
import { AchievementsService } from '../achievements/achievements.service.js';
import { HintsService } from '../hints/hints.service.js';
import { AiService } from '../ai/ai.service.js';

@Injectable()
export class TelegramService
    implements OnModuleInit, OnModuleDestroy
{
    private readonly bot: Telegraf;

    constructor(
        private readonly telegramLinkService: TelegramLinkService,
        private readonly casesService: CasesService,
        private readonly exercisesService: ExercisesService,
        private readonly telegramSessionService: TelegramSessionService,
        private readonly sqlService: SqlService,
        private readonly progressService: ProgressService,
        private readonly achievementsService: AchievementsService,
        private readonly hintsService: HintsService,
        private readonly aiService: AiService,
    ) {
        const token = process.env.TELEGRAM_BOT_TOKEN;

        if (!token) {
            throw new Error(
                'TELEGRAM_BOT_TOKEN is not configured',
            );
        }

        this.bot = new Telegraf(token);

        // Глобальная защита от ошибок внутри Telegram handlers.
        this.bot.catch((error, ctx) => {
            console.error(
                'Telegram update failed:',
                error,
            );

            console.error(
                'Telegram update:',
                ctx.update,
            );
        });

        this.registerHandlers();
    }

    private registerHandlers() {
        // =========================================================
        // /start
        // =========================================================

        this.bot.start(async (ctx: Context) => {
            try {
                const message = ctx.message;

                if (!message || !('text' in message)) {
                    return;
                }

                if (!ctx.from) {
                    return;
                }

                const parts = message.text
                    .trim()
                    .split(/\s+/);

                const token = parts[1];

                const telegramUserId =
                    BigInt(ctx.from.id);

                const username =
                    ctx.from.username;

                // -------------------------------------------------
                // /start TOKEN
                // -------------------------------------------------

                if (token) {
                    try {
                        await this.telegramLinkService.linkTelegramAccount(
                            token,
                            telegramUserId,
                            username,
                        );

                        await ctx.reply(
                            [
                                '✅ Telegram успешно привязан!',
                                '',
                                'Теперь этот Telegram-аккаунт связан с твоим аккаунтом SQLTutor.',
                            ].join('\n'),
                        );

                        await this.showMainMenu(ctx);

                        return;
                    } catch (error) {
                        console.error(
                            'Telegram account linking failed:',
                            error,
                        );

                        await ctx.reply(
                            [
                                '❌ Не удалось привязать Telegram.',
                                '',
                                'Возможно, ссылка устарела или уже была использована.',
                                '',
                                'Создай новую ссылку в SQLTutor и попробуй ещё раз.',
                            ].join('\n'),
                        );

                        return;
                    }
                }

                // -------------------------------------------------
                // Обычный /start
                // -------------------------------------------------

                const telegramAccount =
                    await this.telegramLinkService.findUserByTelegramId(
                        telegramUserId,
                    );

                if (telegramAccount) {
                    await this.showMainMenu(ctx);
                    return;
                }

                await ctx.reply(
                    [
                        '👋 Привет! Я SQLTutor Bot.',
                        '',
                        'Я помогу тебе изучать SQL прямо из Telegram.',
                        '',
                        'Для начала привяжи свой аккаунт SQLTutor.',
                    ].join('\n'),
                    Markup.inlineKeyboard([
                        [
                            Markup.button.callback(
                                '🔗 Привязать аккаунт',
                                'link_account',
                            ),
                        ],
                    ]),
                );
            } catch (error) {
                console.error(
                    'Telegram /start handler failed:',
                    error,
                );
            }
        });

        // =========================================================
        // 📚 Обучение
        // =========================================================

        this.bot.action(
            'menu_learning',
            async (ctx) => {
                try {
                    await ctx.answerCbQuery();

                    const cases =
                        await this.casesService.findAll();

                    if (!cases.length) {
                        await ctx.reply(
                            [
                                '📚 Обучение',
                                '',
                                'Пока нет доступных учебных кейсов.',
                            ].join('\n'),
                        );

                        return;
                    }

                    await ctx.reply(
                        [
                            '📚 Обучение',
                            '',
                            'Выбери учебный кейс:',
                        ].join('\n'),
                        Markup.inlineKeyboard(
                            cases.map((learningCase) => [
                                Markup.button.callback(
                                    `📖 ${learningCase.title}`,
                                    `case:${learningCase.slug}`,
                                ),
                            ]),
                        ),
                    );
                } catch (error) {
                    console.error(
                        'Failed to load learning cases:',
                        error,
                    );

                    await ctx.reply(
                        '❌ Не удалось загрузить учебные кейсы.',
                    );
                }
            },
        );

        // =========================================================
        // 📖 Выбор кейса
        // =========================================================

        this.bot.action(
            /^case:(.+)$/,
            async (ctx) => {
                try {
                    await ctx.answerCbQuery();

                    const slug = ctx.match[1];

                    const learningCase =
                        await this.casesService.findBySlug(
                            slug,
                        );

                    const exercises =
                        await this.exercisesService.findByCaseSlug(
                            slug,
                        );

                    if (!exercises.length) {
                        await ctx.reply(
                            [
                                `📖 ${learningCase.title}`,
                                '',
                                'В этом кейсе пока нет доступных упражнений.',
                            ].join('\n'),
                        );

                        return;
                    }

                    await ctx.reply(
                        [
                            `📖 ${learningCase.title}`,
                            '',
                            learningCase.description ?? '',
                            '',
                            'Выбери упражнение:',
                        ].join('\n'),
                        Markup.inlineKeyboard(
                            exercises.map((exercise) => [
                                Markup.button.callback(
                                    `${this.getDifficultyEmoji(exercise.difficulty)} ${exercise.title}`,
                                    `exercise:${exercise.id}`,
                                ),
                            ]),
                        ),
                    );
                } catch (error) {
                    console.error(
                        'Failed to load case exercises:',
                        error,
                    );

                    await ctx.reply(
                        '❌ Не удалось загрузить упражнения.',
                    );
                }
            },
        );

        // =========================================================
        // 📝 Выбор упражнения
        // =========================================================

        this.bot.action(
            /^exercise:(.+)$/,
            async (ctx) => {
                try {
                    await ctx.answerCbQuery();

                    const exerciseId =
                        ctx.match[1];

                    const exercise =
                        await this.exercisesService.findById(
                            exerciseId,
                        );

                    const telegramUser =
                        await this.telegramLinkService.findUserByTelegramId(
                            BigInt(ctx.from.id),
                        );

                    if (!telegramUser) {
                        await ctx.reply(
                            '❌ Telegram-аккаунт не привязан к пользователю SQLTutor.',
                        );

                        return;
                    }

                    // Создаём/обновляем сессию уже при открытии упражнения.
                    //
                    // setExercise также сбрасывает старый SQL,
                    // результат выполнения и AI-контекст.
                    this.telegramSessionService.setExercise(
                        BigInt(ctx.from.id),
                        telegramUser.userId,
                        exercise.id,
                    );

                    await ctx.reply(
                        [
                            `${this.getDifficultyEmoji(exercise.difficulty)} ${exercise.title}`,
                            '',
                            exercise.description,
                            '',
                            'Выбери действие:',
                        ].join('\n'),
                        Markup.inlineKeyboard([
                            [
                                Markup.button.callback(
                                    '▶️ Решить',
                                    `solve:${exercise.id}`,
                                ),
                            ],
                            [
                                Markup.button.callback(
                                    '💡 Подсказки',
                                    `hints:${exercise.id}`,
                                ),
                            ],
                            [
                                Markup.button.callback(
                                    '🤖 Спросить AI',
                                    'ask_ai',
                                ),
                            ],
                            [
                                Markup.button.callback(
                                    '⬅️ Назад к упражнениям',
                                    `case:${exercise.learningCase.slug}`,
                                ),
                            ],
                        ]),
                    );
                } catch (error) {
                    console.error(
                        'Failed to load exercise:',
                        error,
                    );

                    await ctx.reply(
                        '❌ Не удалось загрузить упражнение.',
                    );
                }
            },
        );

        // =========================================================
        // ▶️ Начать решение упражнения
        // =========================================================

        this.bot.action(
            /^solve:(.+)$/,
            async (ctx) => {
                try {
                    await ctx.answerCbQuery();

                    if (!ctx.from) {
                        return;
                    }

                    const exerciseId =
                        ctx.match[1];

                    const exercise =
                        await this.exercisesService.findById(
                            exerciseId,
                        );

                    const telegramUser =
                        await this.telegramLinkService.findUserByTelegramId(
                            BigInt(ctx.from.id),
                        );

                    if (!telegramUser) {
                        await ctx.reply(
                            '❌ Telegram-аккаунт не привязан к пользователю SQLTutor.',
                        );

                        return;
                    }

                    // Начинаем новую SQL-сессию.
                    //
                    // Это также выключает AI-режим и очищает
                    // старый AI/SQL-контекст.
                    this.telegramSessionService.setExercise(
                        BigInt(ctx.from.id),
                        telegramUser.userId,
                        exercise.id,
                    );

                    await ctx.reply(
                        [
                            `▶️ ${exercise.title}`,
                            '',
                            'Теперь отправь свой SQL-запрос одним сообщением.',
                            '',
                            'Например:',
                            'SELECT * FROM products;',
                            '',
                            'Я выполню его в учебной базе и покажу результат.',
                        ].join('\n'),
                    );
                } catch (error) {
                    console.error(
                        'Failed to start exercise:',
                        error,
                    );

                    await ctx.reply(
                        '❌ Не удалось открыть упражнение.',
                    );
                }
            },
        );

        // =========================================================
        // 📊 Прогресс
        // =========================================================

        this.bot.action(
            'menu_progress',
            async (ctx) => {
                try {
                    await ctx.answerCbQuery();

                    if (!ctx.from) {
                        return;
                    }

                    const telegramUserId =
                        BigInt(ctx.from.id);

                    const telegramUser =
                        await this.telegramLinkService.findUserByTelegramId(
                            telegramUserId,
                        );

                    if (!telegramUser) {
                        await ctx.reply(
                            [
                                '❌ Telegram-аккаунт не привязан.',
                                '',
                                'Сначала привяжи Telegram к аккаунту SQLTutor.',
                            ].join('\n'),
                        );

                        return;
                    }

                    const progress =
                        await this.progressService.getUserSummary(
                            telegramUser.userId,
                        );

                    await ctx.reply(
                        [
                            '📊 Мой прогресс',
                            '',
                            '📚 Обучение',
                            '━━━━━━━━━━━━━━',
                            `Решено: ${progress.solved} / ${progress.total}`,
                            `Прогресс: ${progress.progressPercent}%`,
                            '',
                            '🎯 Результаты',
                            `Попыток: ${progress.totalAttempts}`,
                            `В процессе: ${progress.inProgress}`,
                            `Не начато: ${progress.notStarted}`,
                            '',
                            '📖 По кейсам',
                            ...progress.cases.map(
                                (learningCase) =>
                                    `${learningCase.title}: ${learningCase.solved} / ${learningCase.total} (${learningCase.progressPercent}%)`,
                            ),
                        ].join('\n'),
                        Markup.inlineKeyboard([
                            [
                                Markup.button.callback(
                                    '📚 Продолжить обучение',
                                    'menu_learning',
                                ),
                            ],
                            [
                                Markup.button.callback(
                                    '⬅️ Главное меню',
                                    'main_menu',
                                ),
                            ],
                        ]),
                    );
                } catch (error) {
                    console.error(
                        'Telegram progress handler failed:',
                        error,
                    );

                    await ctx.reply(
                        '❌ Не удалось загрузить прогресс.',
                    );
                }
            },
        );

        // =========================================================
        // 🏠 Главное меню
        // =========================================================

        this.bot.action(
            'main_menu',
            async (ctx) => {
                try {
                    await ctx.answerCbQuery();

                    await this.showMainMenu(ctx);
                } catch (error) {
                    console.error(
                        'Telegram main menu handler failed:',
                        error,
                    );
                }
            },
        );

        // =========================================================
        // 🏆 Достижения
        // =========================================================

        this.bot.action(
            'menu_achievements',
            async (ctx) => {
                try {
                    await ctx.answerCbQuery();

                    if (!ctx.from) {
                        return;
                    }

                    const telegramUserId =
                        BigInt(ctx.from.id);

                    const telegramUser =
                        await this.telegramLinkService.findUserByTelegramId(
                            telegramUserId,
                        );

                    if (!telegramUser) {
                        await ctx.reply(
                            [
                                '❌ Telegram-аккаунт не привязан.',
                                '',
                                'Сначала привяжи Telegram к аккаунту SQLTutor.',
                            ].join('\n'),
                        );

                        return;
                    }

                    const achievements =
                        await this.achievementsService.getUserAchievements(
                            telegramUser.userId,
                        );

                    const unlockedCount =
                        achievements.filter(
                            (achievement) => achievement.unlocked,
                        ).length;

                    const totalCount =
                        achievements.length;

                    const lines = [
                        '🏆 Достижения',
                        '',
                        `${unlockedCount} / ${totalCount} получено`,
                        '',
                    ];

                    for (const achievement of achievements) {
                        const icon = achievement.unlocked
                            ? '✅'
                            : '🔒';

                        lines.push(
                            `${icon} ${achievement.title}`,
                        );

                        lines.push(
                            achievement.description,
                        );

                        lines.push('');
                    }

                    await ctx.reply(
                        lines.join('\n'),
                        Markup.inlineKeyboard([
                            [
                                Markup.button.callback(
                                    '📚 Обучение',
                                    'menu_learning',
                                ),
                            ],
                            [
                                Markup.button.callback(
                                    '📊 Мой прогресс',
                                    'menu_progress',
                                ),
                            ],
                            [
                                Markup.button.callback(
                                    '⬅️ Главное меню',
                                    'main_menu',
                                ),
                            ],
                        ]),
                    );
                } catch (error) {
                    console.error(
                        'Telegram achievements handler failed:',
                        error,
                    );

                    await ctx.reply(
                        '❌ Не удалось загрузить достижения.',
                    );
                }
            },
        );

        // =========================================================
        // 💡 HINTS
        // =========================================================

        this.bot.action(
            /^hints:(.+)$/,
            async (ctx) => {
                try {
                    await ctx.answerCbQuery();

                    if (!ctx.from) {
                        return;
                    }

                    const exerciseId =
                        ctx.match[1];

                    const hints =
                        await this.hintsService.getExerciseHints(
                            exerciseId,
                        );

                    if (!hints.length) {
                        await ctx.reply(
                            '💡 Для этого задания пока нет подсказок.',
                        );

                        return;
                    }

                    const session =
                        this.telegramSessionService.getSession(
                            BigInt(ctx.from.id),
                        );

                    if (!session) {
                        await ctx.reply(
                            '❌ Сессия упражнения не найдена.',
                        );

                        return;
                    }

                    const hint = hints[0];

                    const keyboard =
                        hints.length > 1
                            ? Markup.inlineKeyboard([
                                [
                                    Markup.button.callback(
                                        '💡 Следующая подсказка',
                                        `hint_next:${exerciseId}:1`,
                                    ),
                                ],
                                [
                                    Markup.button.callback(
                                        '🤖 Спросить AI',
                                        'ask_ai',
                                    ),
                                ],
                                [
                                    Markup.button.callback(
                                        '⬅️ К заданию',
                                        `exercise:${exerciseId}`,
                                    ),
                                ],
                            ])
                            : Markup.inlineKeyboard([
                                [
                                    Markup.button.callback(
                                        '🤖 Спросить AI',
                                        'ask_ai',
                                    ),
                                ],
                                [
                                    Markup.button.callback(
                                        '⬅️ К заданию',
                                        `exercise:${exerciseId}`,
                                    ),
                                ],
                            ]);

                    await ctx.reply(
                        [
                            `💡 Подсказка 1 из ${hints.length}`,
                            '',
                            hint.content,
                        ].join('\n'),
                        keyboard,
                    );
                } catch (error) {
                    console.error(
                        'Telegram hints failed:',
                        error,
                    );

                    await ctx.reply(
                        '❌ Не удалось получить подсказки.',
                    );
                }
            },
        );

        // =========================================================
        // 💡 Следующая подсказка
        // =========================================================

        this.bot.action(
            /^hint_next:(.+):(\d+)$/,
            async (ctx) => {
                try {
                    await ctx.answerCbQuery();

                    if (!ctx.from) {
                        return;
                    }

                    const exerciseId =
                        ctx.match[1];

                    const nextHintIndex =
                        Number(ctx.match[2]);

                    const hints =
                        await this.hintsService.getExerciseHints(
                            exerciseId,
                        );

                    if (!hints.length) {
                        await ctx.reply(
                            '💡 Для этого задания пока нет подсказок.',
                        );

                        return;
                    }

                    const session =
                        this.telegramSessionService.getSession(
                            BigInt(ctx.from.id),
                        );

                    if (!session?.exerciseId) {
                        await ctx.reply(
                            '❌ Сессия упражнения не найдена.',
                        );

                        return;
                    }

                    if (
                        session.exerciseId !==
                        exerciseId
                    ) {
                        await ctx.reply(
                            '❌ Эта подсказка относится к другому упражнению.',
                        );

                        return;
                    }

                    if (
                        !Number.isInteger(nextHintIndex) ||
                        nextHintIndex < 1
                    ) {
                        await ctx.reply(
                            '❌ Некорректный номер подсказки.',
                        );

                        return;
                    }

                    const hint =
                        hints[nextHintIndex];

                    if (!hint) {
                        await ctx.reply(
                            [
                                '💡 Это была последняя подсказка.',
                                '',
                                'Попробуй решить задание самостоятельно.',
                            ].join('\n'),
                            Markup.inlineKeyboard([
                                [
                                    Markup.button.callback(
                                        '🤖 Спросить AI',
                                        'ask_ai',
                                    ),
                                ],
                                [
                                    Markup.button.callback(
                                        '⬅️ К заданию',
                                        `exercise:${exerciseId}`,
                                    ),
                                ],
                            ]),
                        );

                        return;
                    }

                    const displayedHintNumber =
                        nextHintIndex + 1;

                    const hasNextHint =
                        nextHintIndex + 1 <
                        hints.length;

                    const keyboard =
                        hasNextHint
                            ? Markup.inlineKeyboard([
                                [
                                    Markup.button.callback(
                                        '💡 Следующая подсказка',
                                        `hint_next:${exerciseId}:${nextHintIndex + 1}`,
                                    ),
                                ],
                                [
                                    Markup.button.callback(
                                        '🤖 Спросить AI',
                                        'ask_ai',
                                    ),
                                ],
                                [
                                    Markup.button.callback(
                                        '⬅️ К заданию',
                                        `exercise:${exerciseId}`,
                                    ),
                                ],
                            ])
                            : Markup.inlineKeyboard([
                                [
                                    Markup.button.callback(
                                        '🤖 Спросить AI',
                                        'ask_ai',
                                    ),
                                ],
                                [
                                    Markup.button.callback(
                                        '⬅️ К заданию',
                                        `exercise:${exerciseId}`,
                                    ),
                                ],
                            ]);

                    await ctx.reply(
                        [
                            `💡 Подсказка ${displayedHintNumber} из ${hints.length}`,
                            '',
                            hint.content,
                        ].join('\n'),
                        keyboard,
                    );
                } catch (error) {
                    console.error(
                        'Telegram next hint failed:',
                        error,
                    );

                    await ctx.reply(
                        '❌ Не удалось получить следующую подсказку.',
                    );
                }
            },
        );

        // =========================================================
        // 🤖 AI Tutor — из конкретного упражнения
        // =========================================================

        this.bot.action(
            'ask_ai',
            async (ctx) => {
                try {
                    await ctx.answerCbQuery();

                    if (!ctx.from) {
                        return;
                    }

                    const telegramUserId =
                        BigInt(ctx.from.id);

                    const session =
                        this.telegramSessionService.getSession(
                            telegramUserId,
                        );

                    if (!session?.exerciseId) {
                        await ctx.reply(
                            [
                                '❌ Сначала выбери упражнение.',
                                '',
                                'AI Tutor работает в контексте конкретного SQL-задания.',
                            ].join('\n'),
                        );

                        return;
                    }

                    this.telegramSessionService.setAiMode(
                        telegramUserId,
                        true,
                    );

                    await ctx.reply(
                        [
                            '🤖 AI Tutor',
                            '',
                            'Задай вопрос по текущему упражнению.',
                            '',
                            'Например:',
                            'Почему мой JOIN возвращает слишком мало строк?',
                            '',
                            'AI увидит:',
                            '• текущее упражнение;',
                            '• структуру учебной базы;',
                            '• твой последний SQL;',
                            '• результат его выполнения;',
                            '• предыдущий диалог с AI.',
                            '',
                            'Теперь просто напиши свой вопрос.',
                        ].join('\n'),
                        Markup.inlineKeyboard([
                            [
                                Markup.button.callback(
                                    '▶️ Вернуться к SQL',
                                    `solve:${session.exerciseId}`,
                                ),
                            ],
                            [
                                Markup.button.callback(
                                    '⬅️ К заданию',
                                    `exercise:${session.exerciseId}`,
                                ),
                            ],
                        ]),
                    );
                } catch (error) {
                    console.error(
                        'Telegram ask AI failed:',
                        error,
                    );

                    await ctx.reply(
                        '❌ Не удалось открыть AI Tutor.',
                    );
                }
            },
        );

        // =========================================================
        // 🤖 AI Tutor — главное меню
        // =========================================================

        this.bot.action(
            'menu_ai',
            async (ctx) => {
                try {
                    await ctx.answerCbQuery();

                    if (!ctx.from) {
                        return;
                    }

                    const telegramUserId =
                        BigInt(ctx.from.id);

                    const session =
                        this.telegramSessionService.getSession(
                            telegramUserId,
                        );

                    if (session?.exerciseId) {
                        this.telegramSessionService.setAiMode(
                            telegramUserId,
                            true,
                        );

                        await ctx.reply(
                            [
                                '🤖 AI Tutor',
                                '',
                                'AI Tutor работает в контексте выбранного упражнения.',
                                '',
                                'Задай свой вопрос по SQL.',
                            ].join('\n'),
                            Markup.inlineKeyboard([
                                [
                                    Markup.button.callback(
                                        '⬅️ К текущему заданию',
                                        `exercise:${session.exerciseId}`,
                                    ),
                                ],
                            ]),
                        );

                        return;
                    }

                    await ctx.reply(
                        [
                            '🤖 AI Tutor',
                            '',
                            'Чтобы AI мог помогать именно с SQL-заданием,',
                            'сначала выбери упражнение в разделе «Обучение».',
                            '',
                            'После этого AI сможет видеть:',
                            '• условие задания;',
                            '• схему базы данных;',
                            '• твой SQL-запрос;',
                            '• результат выполнения запроса;',
                            '• историю диалога.',
                        ].join('\n'),
                        Markup.inlineKeyboard([
                            [
                                Markup.button.callback(
                                    '📚 Выбрать упражнение',
                                    'menu_learning',
                                ),
                            ],
                            [
                                Markup.button.callback(
                                    '⬅️ Главное меню',
                                    'main_menu',
                                ),
                            ],
                        ]),
                    );
                } catch (error) {
                    console.error(
                        'Telegram AI menu handler failed:',
                        error,
                    );
                }
            },
        );

        // =========================================================
        // ⚙️ Настройки
        // =========================================================

        this.bot.action(
            'menu_settings',
            async (ctx) => {
                try {
                    await ctx.answerCbQuery();

                    await ctx.reply(
                        [
                            '⚙️ Настройки',
                            '',
                            'Здесь будут настройки SQLTutor.',
                        ].join('\n'),
                    );
                } catch (error) {
                    console.error(
                        'Telegram settings handler failed:',
                        error,
                    );
                }
            },
        );

        // =========================================================
        // 🔗 Привязка аккаунта
        // =========================================================

        this.bot.action(
            'link_account',
            async (ctx) => {
                try {
                    await ctx.answerCbQuery();

                    await ctx.reply(
                        [
                            '🔗 Привязка аккаунта',
                            '',
                            'Сейчас мы подключим твой Telegram к аккаунту SQLTutor.',
                        ].join('\n'),
                    );
                } catch (error) {
                    console.error(
                        'Telegram link account handler failed:',
                        error,
                    );
                }
            },
        );

        // =========================================================
        // ✅ Проверка решения
        // =========================================================

        this.bot.action(
            'submit_sql',
            async (ctx) => {
                try {
                    await ctx.answerCbQuery();

                    if (!ctx.from) {
                        return;
                    }

                    const telegramUserId =
                        BigInt(ctx.from.id);

                    const session =
                        this.telegramSessionService.getSession(
                            telegramUserId,
                        );

                    if (!session?.exerciseId) {
                        await ctx.reply(
                            '❌ Упражнение не выбрано.',
                        );

                        return;
                    }

                    if (!session.lastQuery) {
                        await ctx.reply(
                            '❌ Сначала отправь SQL-запрос.',
                        );

                        return;
                    }

                    await ctx.reply(
                        '⏳ Проверяю решение...',
                    );

                    const result =
                        await this.sqlService.submit(
                            session.userId,
                            session.exerciseId,
                            session.lastQuery,
                        );

                    if (!result.success) {
                        await ctx.reply(
                            [
                                '❌ Не удалось проверить решение.',
                                '',
                                result.error?.message ??
                                'Неизвестная ошибка',
                            ].join('\n'),
                        );

                        return;
                    }

                    if (result.isCorrect) {
                        const message = [
                            '🎉 Решение верное!',
                            '',
                            'Упражнение засчитано.',
                        ];

                        if (
                            result.unlockedAchievements?.length
                        ) {
                            message.push(
                                '',
                                '🏆 НОВОЕ ДОСТИЖЕНИЕ!',
                            );

                            for (
                                const achievement
                                of result.unlockedAchievements
                                ) {
                                message.push(
                                    '',
                                    `${achievement.icon ?? '🏆'} ${achievement.title}`,
                                    achievement.description,
                                );
                            }
                        }

                        await ctx.reply(
                            message.join('\n'),
                        );

                        return;
                    }

                    await ctx.reply(
                        [
                            '❌ Решение пока неверное.',
                            '',
                            'Запрос выполнился, но результат не совпал с ожидаемым.',
                            '',
                            'Попробуй изменить запрос и отправить его снова.',
                        ].join('\n'),
                        Markup.inlineKeyboard([
                            [
                                Markup.button.callback(
                                    '🤖 Спросить AI',
                                    'ask_ai',
                                ),
                            ],
                            [
                                Markup.button.callback(
                                    '🔄 Изменить запрос',
                                    'change_sql',
                                ),
                            ],
                        ]),
                    );
                } catch (error) {
                    console.error(
                        'Telegram SQL submit failed:',
                        error,
                    );

                    await ctx.reply(
                        '❌ Не удалось проверить решение.',
                    );
                }
            },
        );

        // =========================================================
        // 🔄 Изменить SQL
        // =========================================================

        this.bot.action(
            'change_sql',
            async (ctx) => {
                try {
                    await ctx.answerCbQuery();

                    if (!ctx.from) {
                        return;
                    }

                    const telegramUserId =
                        BigInt(ctx.from.id);

                    const session =
                        this.telegramSessionService.getSession(
                            telegramUserId,
                        );

                    if (!session?.exerciseId) {
                        await ctx.reply(
                            '❌ Упражнение не выбрано.',
                        );

                        return;
                    }

                    // Создаём новую SQL-сессию.
                    //
                    // Это также выключает AI-режим,
                    // очищает старый SQL и AI-контекст.
                    this.telegramSessionService.setExercise(
                        telegramUserId,
                        session.userId,
                        session.exerciseId,
                    );

                    await ctx.reply(
                        [
                            '🔄 Изменение SQL-запроса',
                            '',
                            'Отправь новый SQL-запрос одним сообщением.',
                        ].join('\n'),
                    );
                } catch (error) {
                    console.error(
                        'Telegram change SQL handler failed:',
                        error,
                    );
                }
            },
        );

        // =========================================================
        // 💬 Текстовые сообщения
        // =========================================================

        this.bot.on(
            'text',
            async (ctx) => {
                try {
                    if (!ctx.from) {
                        return;
                    }

                    const telegramUserId =
                        BigInt(ctx.from.id);

                    const session =
                        this.telegramSessionService.getSession(
                            telegramUserId,
                        );

                    // Пользователь сейчас не работает
                    // с выбранным упражнением.
                    if (!session?.exerciseId) {
                        return;
                    }

                    const message =
                        ctx.message.text.trim();

                    if (!message) {
                        await ctx.reply(
                            '❌ Сообщение не может быть пустым.',
                        );

                        return;
                    }

                    // =================================================
                    // 🤖 AI MODE
                    // =================================================

                    if (session.awaitingAi) {
                        await ctx.reply(
                            '🤖 Думаю над вопросом...',
                        );

                        try {
                            const result =
                                await this.aiService.chat(
                                    session.userId,
                                    message,
                                    session.exerciseId,
                                    session.aiConversationId,
                                    session.lastQuery,
                                    session.lastExecutionResult,
                                );

                            this.telegramSessionService.setAiConversationId(
                                telegramUserId,
                                result.conversationId,
                            );

                            await ctx.reply(
                                [
                                    '🤖 AI Tutor',
                                    '',
                                    result.message,
                                ].join('\n'),
                                Markup.inlineKeyboard([
                                    [
                                        Markup.button.callback(
                                            '💬 Задать ещё вопрос',
                                            'ask_ai',
                                        ),
                                    ],
                                    [
                                        Markup.button.callback(
                                            '▶️ Вернуться к SQL',
                                            `solve:${session.exerciseId}`,
                                        ),
                                    ],
                                    [
                                        Markup.button.callback(
                                            '⬅️ К заданию',
                                            `exercise:${session.exerciseId}`,
                                        ),
                                    ],
                                ]),
                            );
                        } catch (error) {
                            console.error(
                                'Telegram AI request failed:',
                                error,
                            );

                            await ctx.reply(
                                [
                                    '❌ AI временно недоступен.',
                                    '',
                                    'Попробуй ещё раз через несколько секунд.',
                                ].join('\n'),
                                Markup.inlineKeyboard([
                                    [
                                        Markup.button.callback(
                                            '🔄 Попробовать снова',
                                            'ask_ai',
                                        ),
                                    ],
                                    [
                                        Markup.button.callback(
                                            '▶️ Вернуться к SQL',
                                            `solve:${session.exerciseId}`,
                                        ),
                                    ],
                                ]),
                            );
                        }

                        return;
                    }

                    // =================================================
                    // 📝 SQL MODE
                    // =================================================

                    const query = message;

                    await ctx.reply(
                        '⏳ Выполняю SQL-запрос...',
                    );

                    const result = await this.sqlService.execute(
                        session.exerciseId,
                        message,
                    );
                    // -------------------------------------------------
                    // Сохраняем последний SQL и результат.
                    //
                    // Теперь AI сможет увидеть даже запрос,
                    // который завершился ошибкой PostgreSQL.
                    // -------------------------------------------------

                    this.telegramSessionService.setLastQuery(
                        telegramUserId,
                        message,
                    );

                    this.telegramSessionService.setLastExecutionResult(
                        telegramUserId,
                        JSON.stringify(result, null, 2),
                    );

                    // -------------------------------------------------
                    // SQL / validation / database error.
                    // -------------------------------------------------

                    if (!result.success) {
                        await ctx.reply(
                            [
                                '❌ Ошибка выполнения SQL.',
                                '',
                                `Ошибка: ${result.error?.message ?? 'Неизвестная ошибка'}`,
                                '',
                                'Если не понимаешь ошибку, можешь спросить AI.',
                            ].join('\n'),
                            Markup.inlineKeyboard([
                                [
                                    Markup.button.callback(
                                        '🤖 Спросить AI',
                                        'ask_ai',
                                    ),
                                ],
                                [
                                    Markup.button.callback(
                                        '🔄 Изменить запрос',
                                        'change_sql',
                                    ),
                                ],
                            ]),
                        );

                        return;
                    }

                    const rows =
                        result.rows ?? [];

                    // -------------------------------------------------
                    // Запрос успешно выполнен, но строк нет.
                    // -------------------------------------------------

                    if (!rows.length) {
                        await ctx.reply(
                            [
                                '✅ Запрос выполнен успешно.',
                                '',
                                'Запрос не вернул строк.',
                            ].join('\n'),
                            Markup.inlineKeyboard([
                                [
                                    Markup.button.callback(
                                        '✅ Проверить решение',
                                        'submit_sql',
                                    ),
                                ],
                                [
                                    Markup.button.callback(
                                        '🤖 Спросить AI',
                                        'ask_ai',
                                    ),
                                ],
                                [
                                    Markup.button.callback(
                                        '🔄 Изменить запрос',
                                        'change_sql',
                                    ),
                                ],
                            ]),
                        );

                        return;
                    }

                    // -------------------------------------------------
                    // Запрос успешно выполнен, есть строки.
                    // -------------------------------------------------

                    const formattedRows =
                        this.formatSqlRows(rows);

                    const moreRows =
                        rows.length > 10
                            ? `\n\n... и ещё ${rows.length - 10} строк.`
                            : '';

                    await ctx.reply(
                        [
                            '✅ Запрос выполнен успешно.',
                            '',
                            `Получено строк: ${result.rowCount ?? 0}`,
                            '',
                            formattedRows,
                            moreRows,
                        ].join('\n'),
                        Markup.inlineKeyboard([
                            [
                                Markup.button.callback(
                                    '✅ Проверить решение',
                                    'submit_sql',
                                ),
                            ],
                            [
                                Markup.button.callback(
                                    '🤖 Спросить AI',
                                    'ask_ai',
                                ),
                            ],
                            [
                                Markup.button.callback(
                                    '🔄 Изменить запрос',
                                    'change_sql',
                                ),
                            ],
                        ]),
                    );
                } catch (error: any) {
                    console.error(
                        'Telegram SQL/AI message handler failed:',
                        error,
                    );

                    try {
                        await ctx.reply(
                            [
                                '❌ Не удалось обработать сообщение.',
                                '',
                                error?.message ??
                                'Попробуй ещё раз.',
                            ].join('\n'),
                        );
                    } catch (replyError) {
                        console.error(
                            'Telegram error reply failed:',
                            replyError,
                        );
                    }
                }
            },
        );
    }

    // =========================================================
    // Lifecycle
    // =========================================================

    async onModuleInit() {
        this.bot
            .launch()
            .then(() => {
                console.log(
                    'Telegram bot started successfully',
                );
            })
            .catch((error) => {
                console.error(
                    'Telegram bot failed to start:',
                    error,
                );
            });
    }

    async onModuleDestroy() {
        this.bot.stop(
            'NestJS application shutdown',
        );
    }

    // =========================================================
    // Main menu
    // =========================================================

    private async showMainMenu(ctx: Context) {
        await ctx.reply(
            [
                '👋 Добро пожаловать в SQLTutor!',
                '',
                'Выбери действие:',
            ].join('\n'),
            Markup.inlineKeyboard([
                [
                    Markup.button.callback(
                        '📚 Обучение',
                        'menu_learning',
                    ),
                    Markup.button.callback(
                        '📊 Мой прогресс',
                        'menu_progress',
                    ),
                ],
                [
                    Markup.button.callback(
                        '🏆 Достижения',
                        'menu_achievements',
                    ),
                    Markup.button.callback(
                        '🤖 AI Tutor',
                        'menu_ai',
                    ),
                ],
                [
                    Markup.button.callback(
                        '⚙️ Настройки',
                        'menu_settings',
                    ),
                ],
            ]),
        );
    }

    // =========================================================
    // SQL result formatter
    // =========================================================

    private formatSqlRows(
        rows: Record<string, unknown>[],
    ) {
        const displayedRows =
            rows.slice(0, 10);

        return displayedRows
            .map((row, index) => {
                const values =
                    Object.entries(row)
                        .map(
                            ([key, value]) =>
                                `${key}: ${String(value)}`,
                        )
                        .join('\n');

                return `#${index + 1}\n${values}`;
            })
            .join('\n\n');
    }

    // =========================================================
    // Difficulty
    // =========================================================

    private getDifficultyEmoji(
        difficulty: string,
    ) {
        switch (difficulty) {
            case 'EASY':
                return '🟢';

            case 'MEDIUM':
                return '🟡';

            case 'HARD':
                return '🔴';

            default:
                return '⚪';
        }
    }
}