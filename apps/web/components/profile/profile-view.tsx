
'use client';

import { useEffect, useState } from 'react';

import {
    BadgeCheck,
    Calendar,
    CheckCircle2,
    Flame,
    Lock,
    Target,
    Trophy,
} from 'lucide-react';

import {
    Avatar,
    AvatarFallback,
} from '@/components/ui/avatar';

import { Badge } from '@/components/ui/badge';

import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';

import { Label } from '@/components/ui/label';

import { Switch } from '@/components/ui/switch';

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';

import {
    getProfile,
    updateProfile,
    type ProfileResponse,
} from '@/lib/api/profile';

import { cn } from '@/lib/utils';

type NotificationSettings = {
    streak: boolean;
    weekly: boolean;
    product: boolean;
};

function getInitials(
    firstName: string | null,
    lastName: string | null,
) {
    const first = firstName?.charAt(0) ?? '';
    const last = lastName?.charAt(0) ?? '';

    const initials = `${first}${last}`.trim();

    return initials
        ? initials.toUpperCase()
        : 'U';
}

function getFullName(
    firstName: string | null,
    lastName: string | null,
) {
    const name = [
        firstName,
        lastName,
    ]
        .filter(Boolean)
        .join(' ')
        .trim();

    return name || 'Пользователь';
}

function formatDate(date: string) {
    return new Intl.DateTimeFormat(
        'ru-RU',
        {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        },
    ).format(new Date(date));
}

function formatShortDate(date: string) {
    return new Intl.DateTimeFormat(
        'ru-RU',
        {
            day: 'numeric',
            month: 'short',
        },
    ).format(new Date(date));
}

export function ProfileView() {
    const [
        profile,
        setProfile,
    ] = useState<ProfileResponse | null>(
        null,
    );

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState<string | null>(null);

    const [
        notifications,
        setNotifications,
    ] = useState<NotificationSettings>({
        streak: true,
        weekly: true,
        product: false,
    });

    const [
        isSavingProfile,
        setIsSavingProfile,
    ] = useState(false);

    const [
        profileError,
        setProfileError,
    ] = useState<string | null>(null);

    const [
        profileSaved,
        setProfileSaved,
    ] = useState(false);

    const [
        editFirstName,
        setEditFirstName,
    ] = useState('');

    const [
        editLastName,
        setEditLastName,
    ] = useState('');

    const [
        editEmail,
        setEditEmail,
    ] = useState('');


    useEffect(() => {
        let mounted = true;
        let requestInProgress = false;
        let initialLoad = true;

        async function loadProfile(showLoader = false) {
            if (requestInProgress) {
                return;
            }

            requestInProgress = true;

            if (showLoader) {
                setLoading(true);
            }

            try {
                const accessToken = localStorage.getItem(
                    'sqltutor_access_token',
                );

                if (!accessToken) {
                    throw new Error('Пользователь не авторизован');
                }

                const data = await getProfile(accessToken);

                if (!mounted) {
                    return;
                }

                setProfile(data);
                setError(null);

                // Заполняем форму только при первой успешной загрузке.
                // Фоновые обновления не сотрут несохранённые изменения.
                if (initialLoad) {
                    setEditFirstName(data.user.firstName ?? '');
                    setEditLastName(data.user.lastName ?? '');
                    setEditEmail(data.user.email);

                    initialLoad = false;
                }
            } catch (err) {
                if (mounted && initialLoad) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : 'Не удалось загрузить профиль',
                    );
                }
            } finally {
                requestInProgress = false;

                if (mounted && showLoader) {
                    setLoading(false);
                }
            }
        }

        // Первоначальная загрузка.
        void loadProfile(true);

        // Обновление при возвращении к вкладке браузера.
        function handleFocus() {
            void loadProfile();
        }

        function handleVisibilityChange() {
            if (document.visibilityState === 'visible') {
                void loadProfile();
            }
        }

        window.addEventListener('focus', handleFocus);

        document.addEventListener(
            'visibilitychange',
            handleVisibilityChange,
        );

        // Резервное обновление, пока профиль открыт.
        const intervalId = window.setInterval(() => {
            if (document.visibilityState === 'visible') {
                void loadProfile();
            }
        }, 30_000);

        return () => {
            mounted = false;

            window.clearInterval(intervalId);

            window.removeEventListener('focus', handleFocus);

            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange,
            );
        };
    }, []);


    async function handleSaveProfile() {
        try {
            setIsSavingProfile(true);
            setProfileError(null);
            setProfileSaved(false);

            const accessToken =
                localStorage.getItem(
                    'sqltutor_access_token',
                );

            if (!accessToken) {
                throw new Error(
                    'Пользователь не авторизован',
                );
            }

            const firstName =
                editFirstName.trim();

            const lastName =
                editLastName.trim();

            const email =
                editEmail.trim();

            if (!email) {
                throw new Error(
                    'Введите адрес электронной почты',
                );
            }

            const updatedUser =
                await updateProfile(
                    accessToken,
                    {
                        firstName,
                        lastName,
                        email,
                    },
                );

            setProfile(
                (current) =>
                    current
                        ? {
                            ...current,
                            user: updatedUser,
                        }
                        : current,
            );

            setEditFirstName(
                updatedUser.firstName ?? '',
            );

            setEditLastName(
                updatedUser.lastName ?? '',
            );

            setEditEmail(
                updatedUser.email,
            );

            setProfileSaved(true);
        } catch (err) {
            setProfileError(
                err instanceof Error
                    ? err.message
                    : 'Не удалось сохранить профиль',
            );
        } finally {
            setIsSavingProfile(false);
        }
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-20 animate-pulse rounded-2xl bg-muted" />

                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {Array.from({
                        length: 4,
                    }).map((_, index) => (
                        <div
                            key={index}
                            className="h-32 animate-pulse rounded-xl bg-muted"
                        />
                    ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="h-72 animate-pulse rounded-2xl bg-muted" />

                    <div className="h-72 animate-pulse rounded-2xl bg-muted" />
                </div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="rounded-2xl border border-destructive/25 bg-destructive/5 p-6">
                <h1 className="font-semibold text-destructive">
                    Не удалось загрузить профиль
                </h1>

                <p className="mt-2 text-sm text-muted-foreground">
                    {error ??
                        'Произошла неизвестная ошибка.'}
                </p>

                <Button
                    className="mt-4"
                    onClick={() =>
                        window.location.reload()
                    }
                >
                    Повторить
                </Button>
            </div>
        );
    }

    const {
        user,
        stats,
        courses,
        achievements,
        recentSubmissions,
    } = profile;

    const fullName = getFullName(
        user.firstName,
        user.lastName,
    );

    return (
        <div>
            {/* ========================= */}
            {/* PROFILE HEADER */}
            {/* ========================= */}

            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <Avatar
                        size="lg"
                        className="size-16 bg-ai/15"
                    >
                        <AvatarFallback className="bg-transparent text-lg font-semibold text-ai">
                            {getInitials(
                                user.firstName,
                                user.lastName,
                            )}
                        </AvatarFallback>
                    </Avatar>

                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-2xl font-semibold tracking-tight">
                                {fullName}
                            </h1>

                            <Badge
                                variant="outline"
                                className="border-primary/25 text-primary"
                            >
                                {user.role ===
                                'ADMIN'
                                    ? 'Администратор'
                                    : 'Студент'}
                            </Badge>
                        </div>

                        <p className="mt-1 text-sm text-muted-foreground">
                            {user.email}
                        </p>

                        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Calendar
                                className="size-3"
                                aria-hidden="true"
                            />

                            На платформе с{' '}
                            {formatDate(
                                user.createdAt,
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* ========================= */}
            {/* TABS */}
            {/* ========================= */}

            <Tabs
                defaultValue="overview"
                className="mt-8"
            >
                <TabsList>
                    <TabsTrigger value="overview">
                        Обзор
                    </TabsTrigger>

                    <TabsTrigger value="achievements">
                        Достижения
                    </TabsTrigger>

                    <TabsTrigger value="activity">
                        История решений
                    </TabsTrigger>

                    <TabsTrigger value="settings">
                        Настройки
                    </TabsTrigger>
                </TabsList>

                {/* ========================= */}
                {/* OVERVIEW */}
                {/* ========================= */}

                <TabsContent
                    value="overview"
                    className="mt-6 space-y-6"
                >
                    <ProfileStats
                        stats={stats}
                    />

                    <div className="grid gap-6 lg:grid-cols-2">
                        <ProfileProgress
                            courses={courses}
                        />

                        <ProfileActivity
                            submissions={
                                recentSubmissions
                            }
                        />
                    </div>
                </TabsContent>

                {/* ========================= */}
                {/* ACHIEVEMENTS */}
                {/* ========================= */}

                <TabsContent
                    value="achievements"
                    className="mt-6"
                >
                    <ProfileAchievements
                        achievements={
                            achievements
                        }
                    />
                </TabsContent>

                {/* ========================= */}
                {/* ACTIVITY */}
                {/* ========================= */}

                <TabsContent
                    value="activity"
                    className="mt-6"
                >
                    <ProfileActivity
                        submissions={
                            recentSubmissions
                        }
                        full
                    />
                </TabsContent>

                {/* ========================= */}
                {/* SETTINGS */}
                {/* ========================= */}

                <TabsContent
                    value="settings"
                    className="mt-6 max-w-2xl space-y-6"
                >
                    {/* ACCOUNT */}

                    <section
                        aria-labelledby="account-heading"
                        className="rounded-2xl border border-border bg-card p-6"
                    >
                        <div>
                            <h2
                                id="account-heading"
                                className="font-semibold"
                            >
                                Данные аккаунта
                            </h2>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Измените основные данные
                                своего профиля.
                            </p>
                        </div>

                        <div className="mt-6 space-y-5">
                            <div className="grid gap-5 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="settings-first-name">
                                        Имя
                                    </Label>

                                    <Input
                                        id="settings-first-name"
                                        value={
                                            editFirstName
                                        }
                                        onChange={(
                                            event,
                                        ) => {
                                            setEditFirstName(
                                                event
                                                    .target
                                                    .value,
                                            );

                                            setProfileSaved(
                                                false,
                                            );

                                            setProfileError(
                                                null,
                                            );
                                        }}
                                        placeholder="Введите имя"
                                        className="h-10"
                                        maxLength={50}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="settings-last-name">
                                        Фамилия
                                    </Label>

                                    <Input
                                        id="settings-last-name"
                                        value={
                                            editLastName
                                        }
                                        onChange={(
                                            event,
                                        ) => {
                                            setEditLastName(
                                                event
                                                    .target
                                                    .value,
                                            );

                                            setProfileSaved(
                                                false,
                                            );

                                            setProfileError(
                                                null,
                                            );
                                        }}
                                        placeholder="Введите фамилию"
                                        className="h-10"
                                        maxLength={50}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="settings-email">
                                    Эл. почта
                                </Label>

                                <Input
                                    id="settings-email"
                                    type="email"
                                    value={
                                        editEmail
                                    }
                                    onChange={(
                                        event,
                                    ) => {
                                        setEditEmail(
                                            event
                                                .target
                                                .value,
                                        );

                                        setProfileSaved(
                                            false,
                                        );

                                        setProfileError(
                                            null,
                                        );
                                    }}
                                    placeholder="example@mail.com"
                                    className="h-10"
                                    maxLength={255}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="settings-role">
                                    Роль
                                </Label>

                                <Input
                                    id="settings-role"
                                    value={
                                        user.role ===
                                        'ADMIN'
                                            ? 'Администратор'
                                            : 'Студент'
                                    }
                                    readOnly
                                    className="h-10 bg-muted/40"
                                />
                            </div>
                        </div>

                        {profileError && (
                            <div className="mt-5 rounded-lg border border-destructive/25 bg-destructive/5 px-4 py-3">
                                <p className="text-sm text-destructive">
                                    {profileError}
                                </p>
                            </div>
                        )}

                        {profileSaved && (
                            <div className="mt-5 rounded-lg border border-primary/25 bg-primary/5 px-4 py-3">
                                <p className="text-sm text-primary">
                                    Данные профиля успешно
                                    сохранены.
                                </p>
                            </div>
                        )}

                        <div className="mt-6 flex justify-end">
                            <Button
                                onClick={
                                    handleSaveProfile
                                }
                                disabled={
                                    isSavingProfile ||
                                    !editEmail.trim()
                                }
                            >
                                {isSavingProfile
                                    ? 'Сохранение...'
                                    : 'Сохранить изменения'}
                            </Button>
                        </div>
                    </section>

                    {/* NOTIFICATIONS */}

                    <section
                        aria-labelledby="notifications-heading"
                        className="rounded-2xl border border-border bg-card p-6"
                    >
                        <h2
                            id="notifications-heading"
                            className="font-semibold"
                        >
                            Уведомления
                        </h2>

                        <ul className="mt-5 space-y-4">
                            <li className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-medium">
                                        Напоминания о серии
                                    </p>

                                    <p className="text-sm text-muted-foreground">
                                        Сообщать, если вы рискуете
                                        прервать серию занятий.
                                    </p>
                                </div>

                                <Switch
                                    checked={
                                        notifications.streak
                                    }
                                    onCheckedChange={(
                                        value,
                                    ) =>
                                        setNotifications(
                                            (
                                                current,
                                            ) => ({
                                                ...current,
                                                streak: value,
                                            }),
                                        )
                                    }
                                    aria-label="Напоминания о серии"
                                />
                            </li>

                            <li className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-medium">
                                        Еженедельный отчёт
                                    </p>

                                    <p className="text-sm text-muted-foreground">
                                        Итоги недели и рекомендации
                                        AI-помощника.
                                    </p>
                                </div>

                                <Switch
                                    checked={
                                        notifications.weekly
                                    }
                                    onCheckedChange={(
                                        value,
                                    ) =>
                                        setNotifications(
                                            (
                                                current,
                                            ) => ({
                                                ...current,
                                                weekly: value,
                                            }),
                                        )
                                    }
                                    aria-label="Еженедельный отчёт"
                                />
                            </li>

                            <li className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-medium">
                                        Новости продукта
                                    </p>

                                    <p className="text-sm text-muted-foreground">
                                        Новые курсы, задачи и обновления
                                        платформы.
                                    </p>
                                </div>

                                <Switch
                                    checked={
                                        notifications.product
                                    }
                                    onCheckedChange={(
                                        value,
                                    ) =>
                                        setNotifications(
                                            (
                                                current,
                                            ) => ({
                                                ...current,
                                                product: value,
                                            }),
                                        )
                                    }
                                    aria-label="Новости продукта"
                                />
                            </li>
                        </ul>
                    </section>

                    {/* DANGER ZONE */}

                    <section
                        aria-labelledby="danger-heading"
                        className="rounded-2xl border border-destructive/25 bg-destructive/5 p-6"
                    >
                        <h2
                            id="danger-heading"
                            className="font-semibold text-destructive"
                        >
                            Опасная зона
                        </h2>

                        <p className="mt-2 text-sm text-muted-foreground">
                            Удаление аккаунта необратимо.
                            Функция будет подключена позже,
                            после добавления соответствующего
                            endpoint в API.
                        </p>

                        <Button
                            variant="outline"
                            disabled
                            className="mt-4 border-destructive/40 text-destructive"
                        >
                            Удалить аккаунт
                        </Button>
                    </section>
                </TabsContent>
            </Tabs>
        </div>
    );
}

/* ================================================= */
/* STATS */
/* ================================================= */

function ProfileStats({
    stats,
}: {
    stats: ProfileResponse['stats'];
}) {
    const items = [
        {
            label: 'Дней подряд',
            value: stats.streakDays,
            icon: Flame,
            tone: 'text-warn bg-warn/10',
        },
        {
            label: 'Решено заданий',
            value: stats.solvedExercises,
            icon: CheckCircle2,
            tone: 'text-primary bg-primary/10',
        },
        {
            label: 'Всего попыток',
            value: stats.totalAttempts,
            icon: Trophy,
            tone: 'text-primary bg-primary/10',
        },
        {
            label: 'Точность',
            value: `${stats.accuracy}%`,
            icon: Target,
            tone: 'text-ai bg-ai/10',
        },
    ];

    return (
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {items.map(
                ({
                    label,
                    value,
                    icon: Icon,
                    tone,
                }) => (
                    <li
                        key={label}
                        className="rounded-xl border border-border bg-card p-4"
                    >
                        <span
                            className={cn(
                                'flex size-8 items-center justify-center rounded-lg',
                                tone,
                            )}
                        >
                            <Icon
                                className="size-4"
                                aria-hidden="true"
                            />
                        </span>

                        <p className="mt-4 text-2xl font-semibold tracking-tight">
                            {value}
                        </p>

                        <p className="text-sm text-muted-foreground">
                            {label}
                        </p>
                    </li>
                ),
            )}
        </ul>
    );
}

/* ================================================= */
/* COURSE PROGRESS */
/* ================================================= */

function ProfileProgress({
    courses,
}: {
    courses: ProfileResponse['courses'];
}) {
    return (
        <section
            aria-labelledby="courses-heading"
            className="rounded-2xl border border-border bg-card p-6"
        >
            <h2
                id="courses-heading"
                className="font-semibold"
            >
                Прогресс по курсам
            </h2>

            {courses.length === 0 ? (
                <p className="mt-5 text-sm text-muted-foreground">
                    Пока нет доступных учебных кейсов.
                </p>
            ) : (
                <ul className="mt-5 divide-y divide-border">
                    {courses.map((course) => (
                        <li
                            key={course.id}
                            className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                        >
                            <span
                                className={cn(
                                    'flex size-10 shrink-0 items-center justify-center rounded-lg font-mono text-xs',
                                    course.percent ===
                                        100
                                        ? 'bg-primary/10 text-primary'
                                        : 'bg-muted text-muted-foreground',
                                )}
                            >
                                {course.percent ===
                                100 ? (
                                    <CheckCircle2
                                        className="size-4"
                                        aria-label="Пройден"
                                    />
                                ) : (
                                    `${course.percent}%`
                                )}
                            </span>

                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="truncate font-medium">
                                        {course.title}
                                    </p>

                                    <span className="shrink-0 text-xs text-muted-foreground">
                                        {
                                            course.solvedExercises
                                        }
                                        /
                                        {
                                            course.totalExercises
                                        }
                                    </span>
                                </div>

                                <div
                                    className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"
                                    role="progressbar"
                                    aria-valuenow={
                                        course.percent
                                    }
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                    aria-label={`Прогресс курса ${course.title}`}
                                >
                                    <div
                                        className="h-full rounded-full bg-primary transition-all"
                                        style={{
                                            width: `${course.percent}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

/* ================================================= */
/* ACHIEVEMENTS */
/* ================================================= */

function ProfileAchievements({
    achievements,
}: {
    achievements: ProfileResponse['achievements'];
}) {
    if (achievements.length === 0) {
        return (
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
                <Trophy className="mx-auto size-8 text-muted-foreground" />

                <h2 className="mt-4 font-semibold">
                    Пока нет достижений
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                    Решайте задания и открывайте новые
                    достижения.
                </p>
            </div>
        );
    }

    return (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {achievements.map(
                (achievement) => (
                    <li
                        key={achievement.id}
                        className="flex flex-col gap-3 rounded-xl border border-primary/25 bg-card p-5"
                    >
                        <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <BadgeCheck
                                className="size-5"
                                aria-hidden="true"
                            />
                        </span>

                        <div>
                            <p className="font-medium">
                                {
                                    achievement.title
                                }
                            </p>

                            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                                {
                                    achievement.description
                                }
                            </p>
                        </div>

                        <p className="mt-auto text-xs text-muted-foreground">
                            Получено{' '}
                            {formatShortDate(
                                achievement.unlockedAt,
                            )}
                        </p>
                    </li>
                ),
            )}
        </ul>
    );
}

/* ================================================= */
/* ACTIVITY */
/* ================================================= */

function ProfileActivity({
    submissions,
    full = false,
}: {
    submissions: ProfileResponse['recentSubmissions'];
    full?: boolean;
}) {
    const items = full
        ? submissions
        : submissions.slice(0, 5);

    return (
        <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-semibold">
                {full
                    ? 'История решений'
                    : 'Последние решения'}
            </h2>

            {items.length === 0 ? (
                <div className="mt-6 rounded-xl bg-muted/40 p-6 text-center">
                    <p className="text-sm text-muted-foreground">
                        Здесь появятся ваши решения
                        заданий.
                    </p>
                </div>
            ) : (
                <ul className="mt-5 divide-y divide-border">
                    {items.map((submission) => (
                        <li
                            key={submission.id}
                            className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                        >
                            {submission.isCorrect ? (
                                <CheckCircle2
                                    className="size-4 shrink-0 text-primary"
                                    aria-label="Верно"
                                />
                            ) : (
                                <Lock
                                    className="size-4 shrink-0 text-destructive"
                                    aria-label="Ошибка"
                                />
                            )}

                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">
                                    {
                                        submission.exerciseTitle
                                    }
                                </p>

                                <p className="truncate text-xs text-muted-foreground">
                                    {
                                        submission.caseTitle
                                    }
                                </p>
                            </div>

                            <div className="shrink-0 text-right">
                                <p className="text-xs text-muted-foreground">
                                    {formatShortDate(
                                        submission.createdAt,
                                    )}
                                </p>

                                {submission.executionTimeMs !==
                                    null && (
                                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                                        {
                                            submission.executionTimeMs
                                        }{' '}
                                        мс
                                    </p>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
