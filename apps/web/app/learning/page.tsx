'use client';

import {
    ArrowRight,
    BookOpen,
    CheckCircle2,
    ChevronRight,
    Database,
    Layers3,
    Loader2,
    RefreshCw,
    Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { StudentSidebar } from '@/components/student/student-sidebar';
import {
    getCasesWithExercises,
    type LearningCase,
} from '@/lib/api/cases';
import {
    getMe,
    getStoredUser,
    type User as AuthUser,
} from '@/lib/api/auth';

type LearningCaseWithExercises =
    LearningCase & {
    exercisesCount: number;
};

const caseImages: Record<string, string> = {
    'online-store':
        '/images/cases/online-store.jpg',
    university:
        '/images/cases/university.jpg',
};

function getInitials(user: AuthUser | null) {
    if (!user) {
        return '?';
    }

    const firstName =
        user.firstName?.trim();
    const lastName =
        user.lastName?.trim();

    if (firstName && lastName) {
        return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }

    if (firstName) {
        return firstName
            .slice(0, 2)
            .toUpperCase();
    }

    return user.email
        .slice(0, 2)
        .toUpperCase();
}

function getDifficulty(
    difficulty: string,
) {
    const normalized =
        difficulty
            .trim()
            .toUpperCase();

    if (
        normalized === 'BEGINNER' ||
        normalized === 'EASY' ||
        normalized === 'STARTER' ||
        normalized === 'НАЧАЛЬНЫЙ' ||
        normalized === 'ЛЕГКИЙ'
    ) {
        return {
            label: 'Начальный',
            className:
                'bg-emerald-50 text-emerald-600 border-emerald-100',
            dotClassName:
                'bg-emerald-500',
        };
    }

    if (
        normalized === 'INTERMEDIATE' ||
        normalized === 'MEDIUM' ||
        normalized === 'СРЕДНИЙ'
    ) {
        return {
            label: 'Средний',
            className:
                'bg-amber-50 text-amber-600 border-amber-100',
            dotClassName:
                'bg-amber-500',
        };
    }

    if (
        normalized === 'ADVANCED' ||
        normalized === 'HARD' ||
        normalized === 'ПРОДВИНУТЫЙ' ||
        normalized === 'СЛОЖНЫЙ'
    ) {
        return {
            label: 'Продвинутый',
            className:
                'bg-red-50 text-red-600 border-red-100',
            dotClassName:
                'bg-red-500',
        };
    }

    return {
        label: difficulty || 'Не указан',
        className:
            'bg-slate-50 text-slate-500 border-slate-200',
        dotClassName:
            'bg-slate-400',
    };
}

function getCaseImage(slug: string) {
    return (
        caseImages[slug] ??
        '/images/cases/default.jpg'
    );
}

function getCaseNumber(
    index: number,
) {
    return String(index + 1).padStart(
        2,
        '0',
    );
}

function getCaseDescription(
    learningCase: LearningCase,
) {
    if (learningCase.description?.trim()) {
        return learningCase.description;
    }

    return 'Практический кейс для изучения SQL на реальных данных.';
}

export default function LearningPage() {
    const router = useRouter();

    const [user, setUser] =
        useState<AuthUser | null>(
            () => getStoredUser(),
        );

    const [
        cases,
        setCases,
    ] = useState<
        LearningCaseWithExercises[]
    >([]);

    const [
        isLoading,
        setIsLoading,
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState<string | null>(null);

    const [
        failedImages,
        setFailedImages,
    ] = useState<
        Record<string, boolean>
    >({});

    const loadData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const [
                currentUser,
                loadedCases,
            ] = await Promise.all([
                getMe(),
                getCasesWithExercises(),
            ]);

            if (!currentUser) {
                router.replace('/login');
                return;
            }

            setUser(currentUser);
            setCases(loadedCases);
        } catch (loadError) {
            setError(
                loadError instanceof Error
                    ? loadError.message
                    : 'Не удалось загрузить обучение.',
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const totalExercises =
        useMemo(() => {
            return cases.reduce(
                (total, learningCase) =>
                    total +
                    learningCase.exercisesCount,
                0,
            );
        }, [cases]);

    return (
        <main className="min-h-screen bg-slate-50">
            <StudentSidebar user={user} />

            <div className="lg:pl-[270px]">
                <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
                    {/* HEADER */}
                    <header className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_10px_40px_rgba(15,23,42,0.04)]">
                        <div className="pointer-events-none absolute right-[-120px] top-[-180px] h-[400px] w-[400px] rounded-full bg-blue-50 blur-3xl" />

                        <div className="relative px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
                            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                                <div className="max-w-3xl">
                                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3.5 py-2 text-xs font-bold text-[#0b63ce]">
                                        <Sparkles
                                            size={14}
                                        />
                                        Практическое обучение
                                    </div>

                                    <h1 className="text-4xl font-bold tracking-[-0.045em] text-slate-950 sm:text-5xl lg:text-[56px] lg:leading-[1.04]">
                                        Изучай SQL
                                        <span className="block text-[#0b63ce]">
                                            через практику.
                                        </span>
                                    </h1>

                                    <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
                                        Выбирай учебный
                                        кейс, решай
                                        реальные задачи
                                        с базами данных
                                        и постепенно
                                        переходи от
                                        основ SQL к
                                        более сложным
                                        запросам.
                                    </p>
                                </div>

                                <div className="grid shrink-0 grid-cols-2 gap-3 sm:flex">
                                    <LearningHeaderStat
                                        icon={Layers3}
                                        value={
                                            isLoading
                                                ? '—'
                                                : String(
                                                    cases.length,
                                                )
                                        }
                                        label="кейса"
                                    />

                                    <LearningHeaderStat
                                        icon={BookOpen}
                                        value={
                                            isLoading
                                                ? '—'
                                                : String(
                                                    totalExercises,
                                                )
                                        }
                                        label="заданий"
                                    />
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* PROGRESS */}
                    <section className="mt-5 overflow-hidden rounded-[26px] border border-blue-100 bg-blue-50/70">
                        <div className="flex flex-col gap-5 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                            <div className="flex items-start gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#0b63ce] shadow-sm">
                                    <BookOpen
                                        size={20}
                                    />
                                </div>

                                <div>
                                    <p className="text-sm font-bold text-slate-950">
                                        {user?.firstName
                                            ? `${user.firstName}, начни своё обучение`
                                            : 'Начни своё обучение'}
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                                        Решай задания
                                        последовательно
                                        и постепенно
                                        повышай свой
                                        уровень SQL.
                                    </p>
                                </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-3">
                                <div className="hidden text-right sm:block">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                                        Прогресс
                                    </p>

                                    <p className="mt-0.5 text-sm font-bold text-slate-900">
                                        0%
                                    </p>
                                </div>

                                <div className="h-2 w-full overflow-hidden rounded-full bg-white sm:w-28">
                                    <div className="h-full w-0 rounded-full bg-[#0b63ce]" />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* SECTION TITLE */}
                    <div className="mt-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-sm font-semibold text-[#0b63ce]">
                                Учебные кейсы
                            </p>

                            <h2 className="mt-1 text-2xl font-bold tracking-[-0.035em] text-slate-950 sm:text-3xl">
                                Выбери, с чего начать
                            </h2>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                                Каждый кейс — это
                                отдельная база данных
                                и набор практических
                                SQL-задач.
                            </p>
                        </div>

                        {!isLoading &&
                            cases.length > 0 && (
                                <div className="hidden items-center gap-2 text-xs font-medium text-slate-400 sm:flex">
                                    <CheckCircle2
                                        size={15}
                                        className="text-[#0b63ce]"
                                    />
                                    Доступно сейчас
                                </div>
                            )}
                    </div>

                    {/* ERROR */}
                    {error && (
                        <section className="mt-6 rounded-[24px] border border-red-100 bg-red-50 p-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm font-bold text-red-700">
                                        Не удалось загрузить
                                        обучение
                                    </p>

                                    <p className="mt-1 text-sm text-red-600/80">
                                        {error}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={loadData}
                                    className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-red-600 shadow-sm transition hover:bg-red-100"
                                >
                                    <RefreshCw
                                        size={16}
                                    />
                                    Повторить
                                </button>
                            </div>
                        </section>
                    )}

                    {/* LOADING */}
                    {isLoading && (
                        <section className="mt-6 grid gap-5 md:grid-cols-2">
                            {[1, 2].map(
                                (item) => (
                                    <CaseSkeleton
                                        key={item}
                                    />
                                ),
                            )}
                        </section>
                    )}

                    {/* EMPTY */}
                    {!isLoading &&
                        !error &&
                        cases.length === 0 && (
                            <section className="mt-6 rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#0b63ce]">
                                    <Database
                                        size={24}
                                    />
                                </div>

                                <h3 className="mt-5 text-lg font-bold text-slate-950">
                                    Пока нет доступных
                                    кейсов
                                </h3>

                                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                    Опубликованные учебные
                                    кейсы появятся здесь,
                                    когда будут добавлены
                                    в систему.
                                </p>
                            </section>
                        )}

                    {/* CASES */}
                    {!isLoading &&
                        !error &&
                        cases.length > 0 && (
                            <section className="mt-6 grid gap-5 md:grid-cols-2">
                                {cases.map(
                                    (
                                        learningCase,
                                        index,
                                    ) => (
                                        <CaseCard
                                            key={
                                                learningCase.id
                                            }
                                            learningCase={
                                                learningCase
                                            }
                                            index={
                                                index
                                            }
                                            imageFailed={
                                                Boolean(
                                                    failedImages[
                                                        learningCase.slug
                                                        ],
                                                )
                                            }
                                            onImageError={() =>
                                                setFailedImages(
                                                    (
                                                        current,
                                                    ) => ({
                                                        ...current,
                                                        [learningCase.slug]:
                                                            true,
                                                    }),
                                                )
                                            }
                                        />
                                    ),
                                )}
                            </section>
                        )}

                    {/* BOTTOM INFO */}
                    {!isLoading &&
                        !error &&
                        cases.length > 0 && (
                            <section className="mt-6 rounded-[26px] border border-slate-200 bg-white p-6 shadow-[0_6px_25px_rgba(15,23,42,0.03)] sm:p-7">
                                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0b63ce]">
                                            <Database
                                                size={20}
                                            />
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-bold text-slate-950">
                                                Реальные базы данных,
                                                реальные задачи
                                            </h3>

                                            <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500 sm:text-sm">
                                                Задания построены
                                                вокруг конкретных
                                                учебных кейсов,
                                                поэтому SQL сразу
                                                применяется к данным,
                                                а не изучается
                                                в отрыве от практики.
                                            </p>
                                        </div>
                                    </div>

                                    <Link
                                        href="/cases"
                                        className="group inline-flex shrink-0 items-center gap-2 text-sm font-bold text-[#0b63ce] transition hover:text-[#0957b7]"
                                    >
                                        Все кейсы
                                        <ArrowRight
                                            size={16}
                                            className="transition-transform group-hover:translate-x-1"
                                        />
                                    </Link>
                                </div>
                            </section>
                        )}
                </div>
            </div>
        </main>
    );
}

type LearningHeaderStatProps = {
    icon: typeof Layers3;
    value: string;
    label: string;
};

function LearningHeaderStat({
                                icon: Icon,
                                value,
                                label,
                            }: LearningHeaderStatProps) {
    return (
        <div className="min-w-[100px] rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2 text-[#0b63ce]">
                <Icon size={16} />

                <span className="text-xl font-bold tracking-tight text-slate-950">
                    {value}
                </span>
            </div>

            <p className="mt-1 text-[11px] font-medium text-slate-400">
                {label}
            </p>
        </div>
    );
}

type CaseCardProps = {
    learningCase: LearningCaseWithExercises;
    index: number;
    imageFailed: boolean;
    onImageError: () => void;
};

function CaseCard({
                      learningCase,
                      index,
                      imageFailed,
                      onImageError,
                  }: CaseCardProps) {
    const difficulty =
        getDifficulty(
            learningCase.difficulty,
        );

    return (
        <article className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_20px_50px_rgba(15,23,42,0.09)]">
            {/* IMAGE */}
            <div className="relative h-[245px] overflow-hidden bg-slate-100 sm:h-[270px]">
                {!imageFailed ? (
                    <img
                        src={getCaseImage(
                            learningCase.slug,
                        )}
                        alt={
                            learningCase.title
                        }
                        className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]"
                        onError={
                            onImageError
                        }
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-blue-50">
                        <div className="text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[#0b63ce] shadow-sm">
                                <Database
                                    size={28}
                                />
                            </div>

                            <p className="mt-4 text-sm font-bold text-slate-700">
                                SQLTutor
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                Практический кейс
                            </p>
                        </div>
                    </div>
                )}

                <div className="pointer-events-none absolute inset-0 bg-slate-950/10" />

                <div className="absolute left-5 top-5 flex items-center gap-2">
                    <span className="rounded-xl bg-white/95 px-3 py-1.5 text-[10px] font-bold tracking-[0.12em] text-slate-500 shadow-sm backdrop-blur">
                        {getCaseNumber(index)}
                    </span>

                    <span
                        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[10px] font-bold shadow-sm backdrop-blur ${difficulty.className}`}
                    >
                        <span
                            className={`h-1.5 w-1.5 rounded-full ${difficulty.dotClassName}`}
                        />
                        {difficulty.label}
                    </span>
                </div>

                <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 rounded-xl bg-slate-950/75 px-3 py-2 text-[11px] font-semibold text-white backdrop-blur-md">
                        <Database
                            size={14}
                        />
                        {learningCase.databaseName}
                    </span>

                    <span className="rounded-xl bg-white/95 px-3 py-2 text-[11px] font-bold text-slate-700 shadow-sm backdrop-blur">
                        {learningCase.exercisesCount}{' '}
                        {getExerciseWord(
                            learningCase.exercisesCount,
                        )}
                    </span>
                </div>
            </div>

            {/* CONTENT */}
            <div className="p-6 sm:p-7">
                <div className="flex items-start justify-between gap-5">
                    <div className="min-w-0">
                        <h3 className="text-2xl font-bold tracking-[-0.035em] text-slate-950">
                            {learningCase.title}
                        </h3>

                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
                            {getCaseDescription(
                                learningCase,
                            )}
                        </p>
                    </div>

                    <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0b63ce] sm:flex">
                        <BookOpen
                            size={18}
                        />
                    </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <CheckCircle2
                            size={15}
                            className="text-[#0b63ce]"
                        />

                        <span>
                            {learningCase.exercisesCount > 0
                                ? 'Практические задания доступны'
                                : 'Задания скоро появятся'}
                        </span>
                    </div>

                    <Link
                        href={`/cases/${encodeURIComponent(
                            learningCase.slug,
                        )}`}
                        className="group/button inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0b63ce] px-5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(11,99,206,0.16)] transition hover:bg-[#0957b7] hover:shadow-[0_10px_24px_rgba(11,99,206,0.22)]"
                    >
                        {learningCase.exercisesCount >
                        0
                            ? 'Начать обучение'
                            : 'Подробнее'}

                        <ChevronRight
                            size={17}
                            className="transition-transform group-hover/button:translate-x-0.5"
                        />
                    </Link>
                </div>
            </div>
        </article>
    );
}

function getExerciseWord(
    count: number,
) {
    const lastTwo = count % 100;
    const last = count % 10;

    if (
        lastTwo >= 11 &&
        lastTwo <= 19
    ) {
        return 'заданий';
    }

    if (last === 1) {
        return 'задание';
    }

    if (
        last >= 2 &&
        last <= 4
    ) {
        return 'задания';
    }

    return 'заданий';
}

function CaseSkeleton() {
    return (
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white">
            <div className="h-[245px] animate-pulse bg-slate-100 sm:h-[270px]" />

            <div className="p-6 sm:p-7">
                <div className="h-7 w-2/3 animate-pulse rounded-lg bg-slate-100" />

                <div className="mt-4 space-y-2">
                    <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                    <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
                    <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
                    <div className="h-4 w-40 animate-pulse rounded bg-slate-100" />

                    <div className="h-11 w-36 animate-pulse rounded-xl bg-slate-100" />
                </div>
            </div>
        </div>
    );
}