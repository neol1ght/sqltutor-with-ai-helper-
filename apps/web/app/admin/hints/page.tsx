'use client';

import {
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    AlertCircle,
    BookOpen,
    ChevronDown,
    Edit3,
    Filter,
    Lightbulb,
    Loader2,
    MoreHorizontal,
    Plus,
    Search,
    Trash2,
    X,
} from 'lucide-react';

import {
    createAdminHint,
    deleteAdminHint,
    getAdminHints,
    updateAdminHint,
    type AdminHint,
} from '@/lib/api/admin/admin-hints';

import {
    getAdminExercises,
    type AdminExercise,
} from '@/lib/api/admin/exercises';

import { getCurrentUser } from '@/lib/auth/session';

type ModalMode = 'create' | 'edit';

type FormState = {
    exerciseId: string;
    level: string;
    content: string;
};

const EMPTY_FORM: FormState = {
    exerciseId: '',
    level: '1',
    content: '',
};

function formatDate(date: string) {
    return new Intl.DateTimeFormat(
        'ru-RU',
        {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        },
    ).format(new Date(date));
}

function getLevelClass(level: number) {
    switch (level) {
        case 1:
            return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';

        case 2:
            return 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400';

        case 3:
            return 'border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400';

        default:
            return 'border-border bg-muted text-muted-foreground';
    }
}

function getLevelLabel(level: number) {
    return `Уровень ${level}`;
}

export default function AdminHintsPage() {
    const [hints, setHints] = useState<
        AdminHint[]
    >([]);

    const [exercises, setExercises] = useState<
        AdminExercise[]
    >([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState('');

    const [search, setSearch] =
        useState('');

    const [levelFilter, setLevelFilter] =
        useState('all');

    const [exerciseFilter, setExerciseFilter] =
        useState('all');

    const [openMenuId, setOpenMenuId] =
        useState<string | null>(null);

    const [modalMode, setModalMode] =
        useState<ModalMode | null>(null);

    const [editingHint, setEditingHint] =
        useState<AdminHint | null>(null);

    const [form, setForm] =
        useState<FormState>(EMPTY_FORM);

    const [saving, setSaving] =
        useState(false);

    const [deleteTarget, setDeleteTarget] =
        useState<AdminHint | null>(null);

    const [deleting, setDeleting] =
        useState(false);

    async function loadData() {
        try {
            setLoading(true);
            setError('');

            const user =
                await getCurrentUser();

            if (!user) {
                throw new Error(
                    'Не удалось получить текущего пользователя',
                );
            }

            const accessToken =
                localStorage.getItem(
                    'sqltutor_access_token',
                );

            if (!accessToken) {
                throw new Error(
                    'Сессия пользователя не найдена',
                );
            }

            const [
                hintsData,
                exercisesData,
            ] = await Promise.all([
                getAdminHints(accessToken),
                getAdminExercises(accessToken),
            ]);

            setHints(hintsData);
            setExercises(exercisesData);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Не удалось загрузить подсказки',
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void loadData();
    }, []);

    const exerciseMap = useMemo(() => {
        return new Map(
            exercises.map((exercise) => [
                exercise.id,
                exercise,
            ]),
        );
    }, [exercises]);

    const filteredHints = useMemo(() => {
        const normalizedSearch =
            search.trim().toLowerCase();

        return hints.filter((hint) => {
            const exercise =
                exerciseMap.get(
                    hint.exerciseId,
                );

            const matchesSearch =
                !normalizedSearch ||
                hint.content
                    .toLowerCase()
                    .includes(
                        normalizedSearch,
                    ) ||
                hint.exercise?.title
                    ?.toLowerCase()
                    .includes(
                        normalizedSearch,
                    ) ||
                exercise?.title
                    .toLowerCase()
                    .includes(
                        normalizedSearch,
                    );

            const matchesLevel =
                levelFilter === 'all' ||
                String(hint.level) ===
                levelFilter;

            const matchesExercise =
                exerciseFilter === 'all' ||
                hint.exerciseId ===
                exerciseFilter;

            return (
                matchesSearch &&
                matchesLevel &&
                matchesExercise
            );
        });
    }, [
        hints,
        exercises,
        exerciseMap,
        search,
        levelFilter,
        exerciseFilter,
    ]);

    const stats = useMemo(() => {
        const exercisesWithHints =
            new Set(
                hints.map(
                    (hint) =>
                        hint.exerciseId,
                ),
            );

        const level1 = hints.filter(
            (hint) => hint.level === 1,
        ).length;

        const level2 = hints.filter(
            (hint) => hint.level === 2,
        ).length;

        const level3 = hints.filter(
            (hint) => hint.level === 3,
        ).length;

        return {
            total: hints.length,
            exercises:
            exercisesWithHints.size,
            level1,
            level2,
            level3,
        };
    }, [hints]);

    function openCreateModal() {
        setEditingHint(null);

        setForm({
            ...EMPTY_FORM,
            exerciseId:
                exercises[0]?.id ?? '',
        });

        setOpenMenuId(null);
        setModalMode('create');
        setError('');
    }

    function openEditModal(
        hint: AdminHint,
    ) {
        setEditingHint(hint);

        setForm({
            exerciseId: hint.exerciseId,
            level: String(hint.level),
            content: hint.content,
        });

        setOpenMenuId(null);
        setModalMode('edit');
        setError('');
    }

    function closeModal() {
        if (saving) {
            return;
        }

        setModalMode(null);
        setEditingHint(null);
        setForm(EMPTY_FORM);
    }

    async function handleSaveHint() {
        if (!form.exerciseId) {
            setError(
                'Выберите задание',
            );
            return;
        }

        if (!form.content.trim()) {
            setError(
                'Введите текст подсказки',
            );
            return;
        }

        const level =
            Number(form.level);

        if (
            !Number.isInteger(level) ||
            level < 1
        ) {
            setError(
                'Уровень должен быть целым числом больше 0',
            );
            return;
        }

        try {
            setSaving(true);
            setError('');

            const accessToken =
                localStorage.getItem(
                    'sqltutor_access_token',
                );

            if (!accessToken) {
                throw new Error(
                    'Сессия пользователя не найдена',
                );
            }

            if (
                modalMode === 'edit' &&
                editingHint
            ) {
                await updateAdminHint(
                    accessToken,
                    editingHint.id,
                    {
                        exerciseId:
                        form.exerciseId,
                        level,
                        content:
                            form.content.trim(),
                    },
                );
            } else {
                await createAdminHint(
                    accessToken,
                    {
                        exerciseId:
                        form.exerciseId,
                        level,
                        content:
                            form.content.trim(),
                    },
                );
            }

            closeModal();

            await loadData();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Не удалось сохранить подсказку',
            );
        } finally {
            setSaving(false);
        }
    }

    async function handleDeleteHint() {
        if (!deleteTarget) {
            return;
        }

        try {
            setDeleting(true);
            setError('');

            const accessToken =
                localStorage.getItem(
                    'sqltutor_access_token',
                );

            if (!accessToken) {
                throw new Error(
                    'Сессия пользователя не найдена',
                );
            }

            await deleteAdminHint(
                accessToken,
                deleteTarget.id,
            );

            setDeleteTarget(null);

            await loadData();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Не удалось удалить подсказку',
            );
        } finally {
            setDeleting(false);
        }
    }

    return (
        <div
            className="min-h-full bg-background"
            onClick={() =>
                setOpenMenuId(null)
            }
        >
            <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
                {/* HEADER */}

                <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                            <Lightbulb className="h-4 w-4" />

                            <span>
                                Управление обучением
                            </span>
                        </div>

                        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                            Подсказки
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                            Создавай подсказки для
                            заданий и управляй
                            уровнями помощи студентам.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={
                            openCreateModal
                        }
                        disabled={
                            loading ||
                            exercises.length ===
                            0
                        }
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Plus className="h-4 w-4" />

                        Новая подсказка
                    </button>
                </div>

                {/* ERROR */}

                {error && (
                    <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                        <div className="flex-1">
                            {error}
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                setError('')
                            }
                            className="opacity-70 transition hover:opacity-100"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {/* STATS */}

                <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        label="Всего подсказок"
                        value={stats.total}
                        icon={
                            <Lightbulb className="h-4 w-4" />
                        }
                    />

                    <StatCard
                        label="Заданий с подсказками"
                        value={
                            stats.exercises
                        }
                        icon={
                            <BookOpen className="h-4 w-4" />
                        }
                    />

                    <StatCard
                        label="Подсказок 1 уровня"
                        value={stats.level1}
                        icon={
                            <span className="text-xs font-bold">
                                1
                            </span>
                        }
                    />

                    <StatCard
                        label="Подсказок 2–3 уровня"
                        value={
                            stats.level2 +
                            stats.level3
                        }
                        icon={
                            <Filter className="h-4 w-4" />
                        }
                    />
                </div>

                {/* FILTERS */}

                <div className="mb-5 rounded-2xl border border-border/70 bg-card p-3 shadow-sm">
                    <div className="flex flex-col gap-3 xl:flex-row">
                        <div className="relative min-w-0 flex-1">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <input
                                value={search}
                                onChange={(
                                    event,
                                ) =>
                                    setSearch(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                placeholder="Поиск по подсказкам и заданиям..."
                                className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
                            />
                        </div>

                        <Select
                            value={
                                exerciseFilter
                            }
                            onChange={
                                setExerciseFilter
                            }
                        >
                            <option value="all">
                                Все задания
                            </option>

                            {exercises.map(
                                (exercise) => (
                                    <option
                                        key={
                                            exercise.id
                                        }
                                        value={
                                            exercise.id
                                        }
                                    >
                                        {
                                            exercise.title
                                        }
                                    </option>
                                ),
                            )}
                        </Select>

                        <Select
                            value={
                                levelFilter
                            }
                            onChange={
                                setLevelFilter
                            }
                        >
                            <option value="all">
                                Все уровни
                            </option>

                            <option value="1">
                                Уровень 1
                            </option>

                            <option value="2">
                                Уровень 2
                            </option>

                            <option value="3">
                                Уровень 3
                            </option>
                        </Select>
                    </div>
                </div>

                {/* TABLE */}

                <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
                    {loading ? (
                        <LoadingTable />
                    ) : filteredHints.length ===
                    0 ? (
                        <EmptyState
                            hasFilters={
                                !!search ||
                                levelFilter !==
                                'all' ||
                                exerciseFilter !==
                                'all'
                            }
                            onCreate={
                                openCreateModal
                            }
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1050px] border-collapse">
                                <thead>
                                <tr className="border-b border-border/70 bg-muted/20">
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Уровень
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Задание
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Подсказка
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Создана
                                    </th>

                                    <th className="w-14 px-4 py-3" />
                                </tr>
                                </thead>

                                <tbody>
                                {filteredHints.map(
                                    (
                                        hint,
                                    ) => {
                                        const exercise =
                                            exerciseMap.get(
                                                hint.exerciseId,
                                            );

                                        return (
                                            <tr
                                                key={
                                                    hint.id
                                                }
                                                className="group border-b border-border/60 last:border-b-0 hover:bg-muted/20"
                                            >
                                                <td className="px-4 py-4 align-middle">
                                                        <span
                                                            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${getLevelClass(
                                                                hint.level,
                                                            )}`}
                                                        >
                                                            {getLevelLabel(
                                                                hint.level,
                                                            )}
                                                        </span>
                                                </td>

                                                <td className="max-w-[280px] px-4 py-4 align-middle">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                            <BookOpen className="h-4 w-4" />
                                                        </div>

                                                        <div className="min-w-0">
                                                            <div className="truncate text-sm font-medium">
                                                                {hint
                                                                        .exercise
                                                                        ?.title ??
                                                                    exercise?.title ??
                                                                    'Задание не найдено'}
                                                            </div>

                                                            {exercise
                                                                ?.learningCase
                                                                ?.title && (
                                                                <div className="mt-1 truncate text-xs text-muted-foreground">
                                                                    {
                                                                        exercise
                                                                            .learningCase
                                                                            .title
                                                                    }
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="max-w-[500px] px-4 py-4 align-middle">
                                                    <div className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                                                        {
                                                            hint.content
                                                        }
                                                    </div>
                                                </td>

                                                <td className="px-4 py-4 align-middle">
                                                        <span className="text-xs text-muted-foreground">
                                                            {formatDate(
                                                                hint.createdAt,
                                                            )}
                                                        </span>
                                                </td>

                                                <td className="relative px-4 py-4 align-middle">
                                                    <button
                                                        type="button"
                                                        onClick={(
                                                            event,
                                                        ) => {
                                                            event.stopPropagation();

                                                            setOpenMenuId(
                                                                (
                                                                    current,
                                                                ) =>
                                                                    current ===
                                                                    hint.id
                                                                        ? null
                                                                        : hint.id,
                                                            );
                                                        }}
                                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground opacity-70 transition hover:bg-muted hover:text-foreground group-hover:opacity-100"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </button>

                                                    {openMenuId ===
                                                        hint.id && (
                                                            <div
                                                                onClick={(
                                                                    event,
                                                                ) =>
                                                                    event.stopPropagation()
                                                                }
                                                                className="absolute right-4 top-12 z-30 w-48 overflow-hidden rounded-xl border border-border bg-popover p-1.5 shadow-xl"
                                                            >
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        openEditModal(
                                                                            hint,
                                                                        )
                                                                    }
                                                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-muted"
                                                                >
                                                                    <Edit3 className="h-4 w-4 text-muted-foreground" />

                                                                    Редактировать
                                                                </button>

                                                                <div className="my-1 border-t border-border" />

                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setOpenMenuId(
                                                                            null,
                                                                        );

                                                                        setDeleteTarget(
                                                                            hint,
                                                                        );
                                                                    }}
                                                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 transition hover:bg-red-500/10 dark:text-red-400"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />

                                                                    Удалить
                                                                </button>
                                                            </div>
                                                        )}
                                                </td>
                                            </tr>
                                        );
                                    },
                                )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* RESULT COUNT */}

                {!loading &&
                    filteredHints.length >
                    0 && (
                        <div className="mt-4 text-xs text-muted-foreground">
                            Показано{' '}
                            <span className="font-medium text-foreground">
                                {
                                    filteredHints.length
                                }
                            </span>{' '}
                            из{' '}
                            <span className="font-medium text-foreground">
                                {hints.length}
                            </span>{' '}
                            подсказок
                        </div>
                    )}
            </div>

            {/* HINT MODAL */}

            {modalMode && (
                <ModalOverlay
                    onClose={closeModal}
                >
                    <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
                        <div className="flex items-center justify-between border-b border-border px-6 py-4">
                            <div>
                                <h2 className="text-lg font-semibold">
                                    {modalMode ===
                                    'create'
                                        ? 'Новая подсказка'
                                        : 'Редактировать подсказку'}
                                </h2>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    {modalMode ===
                                    'create'
                                        ? 'Добавь подсказку к заданию.'
                                        : 'Измени параметры существующей подсказки.'}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    closeModal
                                }
                                disabled={saving}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="max-h-[75vh] overflow-y-auto p-6">
                            <div className="space-y-5">
                                {/* EXERCISE */}

                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Задание
                                    </label>

                                    <div className="relative">
                                        <select
                                            value={
                                                form.exerciseId
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                setForm(
                                                    (
                                                        current,
                                                    ) => ({
                                                        ...current,
                                                        exerciseId:
                                                        event
                                                            .target
                                                            .value,
                                                    }),
                                                )
                                            }
                                            disabled={
                                                saving
                                            }
                                            className="h-10 w-full appearance-none rounded-xl border border-border bg-background px-3 pr-9 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <option value="">
                                                Выберите задание
                                            </option>

                                            {exercises.map(
                                                (
                                                    exercise,
                                                ) => (
                                                    <option
                                                        key={
                                                            exercise.id
                                                        }
                                                        value={
                                                            exercise.id
                                                        }
                                                    >
                                                        {
                                                            exercise.title
                                                        }
                                                    </option>
                                                ),
                                            )}
                                        </select>

                                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    </div>
                                </div>

                                {/* LEVEL */}

                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Уровень подсказки
                                    </label>

                                    <div className="grid grid-cols-3 gap-3">
                                        {[1, 2, 3].map(
                                            (
                                                level,
                                            ) => (
                                                <button
                                                    key={
                                                        level
                                                    }
                                                    type="button"
                                                    disabled={
                                                        saving
                                                    }
                                                    onClick={() =>
                                                        setForm(
                                                            (
                                                                current,
                                                            ) => ({
                                                                ...current,
                                                                level: String(
                                                                    level,
                                                                ),
                                                            }),
                                                        )
                                                    }
                                                    className={`h-10 rounded-xl border text-sm font-medium transition ${
                                                        Number(
                                                            form.level,
                                                        ) ===
                                                        level
                                                            ? 'border-primary bg-primary/10 text-primary'
                                                            : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                                                    }`}
                                                >
                                                    Уровень{' '}
                                                    {
                                                        level
                                                    }
                                                </button>
                                            ),
                                        )}
                                    </div>

                                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                                        Уровень 1 —
                                        небольшое
                                        направление,
                                        уровень 3 —
                                        более подробная
                                        помощь.
                                    </p>
                                </div>

                                {/* CONTENT */}

                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Текст подсказки
                                    </label>

                                    <textarea
                                        value={
                                            form.content
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            setForm(
                                                (
                                                    current,
                                                ) => ({
                                                    ...current,
                                                    content:
                                                    event
                                                        .target
                                                        .value,
                                                }),
                                            )
                                        }
                                        disabled={saving}
                                        rows={8}
                                        placeholder="Например: попробуйте сгруппировать товары по категории и вычислить среднее значение цены..."
                                        className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm leading-6 outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
                                    />

                                    <div className="mt-2 flex justify-end text-xs text-muted-foreground">
                                        {
                                            form
                                                .content
                                                .length
                                        }{' '}
                                        символов
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
                            <button
                                type="button"
                                onClick={
                                    closeModal
                                }
                                disabled={saving}
                                className="h-10 rounded-xl border border-border px-4 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
                            >
                                Отмена
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    void handleSaveHint()
                                }
                                disabled={
                                    saving ||
                                    !form.exerciseId ||
                                    !form.content.trim()
                                }
                                className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving && (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                )}

                                {modalMode ===
                                'create'
                                    ? 'Создать'
                                    : 'Сохранить'}
                            </button>
                        </div>
                    </div>
                </ModalOverlay>
            )}

            {/* DELETE MODAL */}

            {deleteTarget && (
                <ModalOverlay
                    onClose={() => {
                        if (!deleting) {
                            setDeleteTarget(
                                null,
                            );
                        }
                    }}
                >
                    <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
                        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
                            <Trash2 className="h-5 w-5" />
                        </div>

                        <h2 className="text-lg font-semibold">
                            Удалить подсказку?
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            Подсказка для задания
                            «
                            {deleteTarget
                                    .exercise
                                    ?.title ??
                                exerciseMap.get(
                                    deleteTarget.exerciseId,
                                )?.title ??
                                'Задание'}
                            » будет удалена без
                            возможности
                            восстановления.
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() =>
                                    setDeleteTarget(
                                        null,
                                    )
                                }
                                disabled={
                                    deleting
                                }
                                className="h-10 rounded-xl border border-border px-4 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
                            >
                                Отмена
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    void handleDeleteHint()
                                }
                                disabled={
                                    deleting
                                }
                                className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {deleting && (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                )}

                                Удалить
                            </button>
                        </div>
                    </div>
                </ModalOverlay>
            )}
        </div>
    );
}

function StatCard({
                      label,
                      value,
                      icon,
                  }: {
    label: string;
    value: number;
    icon: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {icon}
                </div>

                <span className="text-2xl font-semibold tracking-tight">
                    {value}
                </span>
            </div>

            <p className="mt-3 text-sm text-muted-foreground">
                {label}
            </p>
        </div>
    );
}

function Select({
                    value,
                    onChange,
                    children,
                }: {
    value: string;
    onChange: (value: string) => void;
    children: React.ReactNode;
}) {
    return (
        <div className="relative min-w-[200px]">
            <select
                value={value}
                onChange={(event) =>
                    onChange(
                        event.target.value,
                    )
                }
                className="h-10 w-full appearance-none rounded-xl border border-border bg-background px-3 pr-9 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
            >
                {children}
            </select>

            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
    );
}

function ModalOverlay({
                          children,
                          onClose,
                      }: {
    children: React.ReactNode;
    onClose: () => void;
}) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
                if (
                    event.target ===
                    event.currentTarget
                ) {
                    onClose();
                }
            }}
        >
            {children}
        </div>
    );
}

function LoadingTable() {
    return (
        <div className="animate-pulse">
            <div className="border-b border-border/70 bg-muted/20 px-4 py-4">
                <div className="h-3 w-24 rounded bg-muted" />
            </div>

            {Array.from({
                length: 6,
            }).map((_, index) => (
                <div
                    key={index}
                    className="flex items-center gap-6 border-b border-border/60 px-4 py-5 last:border-b-0"
                >
                    <div className="h-7 w-20 rounded-full bg-muted" />

                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-muted" />

                        <div className="space-y-2">
                            <div className="h-4 w-40 rounded bg-muted" />
                            <div className="h-3 w-24 rounded bg-muted" />
                        </div>
                    </div>

                    <div className="flex-1 space-y-2">
                        <div className="h-3 w-72 rounded bg-muted" />
                        <div className="h-3 w-52 rounded bg-muted" />
                    </div>

                    <div className="h-3 w-20 rounded bg-muted" />

                    <div className="h-8 w-8 rounded-lg bg-muted" />
                </div>
            ))}
        </div>
    );
}

function EmptyState({
                        hasFilters,
                        onCreate,
                    }: {
    hasFilters: boolean;
    onCreate: () => void;
}) {
    return (
        <div className="flex min-h-[380px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Lightbulb className="h-5 w-5" />
            </div>

            <h3 className="mt-4 text-base font-semibold">
                {hasFilters
                    ? 'Подсказки не найдены'
                    : 'Подсказок пока нет'}
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                {hasFilters
                    ? 'Попробуй изменить параметры поиска или фильтров.'
                    : 'Создай первую подсказку, чтобы добавить помощь к заданию.'}
            </p>

            {!hasFilters && (
                <button
                    type="button"
                    onClick={onCreate}
                    className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                >
                    <Plus className="h-4 w-4" />

                    Создать подсказку
                </button>
            )}
        </div>
    );
}