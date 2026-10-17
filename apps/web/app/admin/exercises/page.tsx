'use client';

import {
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    AlertCircle,
    BookOpen,
    Check,
    ChevronDown,
    Circle,
    Edit3,
    FileQuestion,
    Loader2,
    MoreHorizontal,
    Plus,
    Search,
    Trash2,
    X,
} from 'lucide-react';

import Editor from '@monaco-editor/react';

import {
    createAdminExercise,
    deleteAdminExercise,
    getAdminExercises,
    updateAdminExercise,
    type AdminExercise,
    type ExerciseDifficulty,
} from '@/lib/api/admin/exercises';

import {
    createAdminExerciseSolution,
    deleteAdminExerciseSolution,
    getAdminExerciseSolution,
    updateAdminExerciseSolution,
} from '@/lib/api/admin/exercise-solutions';

import {
    getAdminCases,
    type AdminCase,
} from '@/lib/api/admin/cases';

import { getCurrentUser } from '@/lib/auth/session';

type ModalMode = 'create' | 'edit';

type FormState = {
    caseId: string;
    title: string;
    description: string;
    difficulty: ExerciseDifficulty;
    sortOrder: string;
    isPublished: boolean;
};

type SolutionModalMode = 'create' | 'edit';

const EMPTY_FORM: FormState = {
    caseId: '',
    title: '',
    description: '',
    difficulty: 'EASY',
    sortOrder: '1',
    isPublished: false,
};

const DIFFICULTY_LABELS: Record<
    ExerciseDifficulty,
    string
> = {
    EASY: 'Легко',
    MEDIUM: 'Средне',
    HARD: 'Сложно',
};

function getDifficultyClass(
    difficulty: ExerciseDifficulty,
) {
    switch (difficulty) {
        case 'EASY':
            return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';

        case 'MEDIUM':
            return 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400';

        case 'HARD':
            return 'border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400';
    }
}

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

export default function AdminExercisesPage() {
    const [exercises, setExercises] = useState<
        AdminExercise[]
    >([]);

    const [cases, setCases] = useState<AdminCase[]>(
        [],
    );

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [search, setSearch] = useState('');
    const [caseFilter, setCaseFilter] =
        useState('all');

    const [difficultyFilter, setDifficultyFilter] =
        useState<'all' | ExerciseDifficulty>('all');

    const [statusFilter, setStatusFilter] =
        useState<'all' | 'published' | 'draft'>(
            'all',
        );

    const [openMenuId, setOpenMenuId] =
        useState<string | null>(null);

    const [modalMode, setModalMode] =
        useState<ModalMode | null>(null);

    const [editingExercise, setEditingExercise] =
        useState<AdminExercise | null>(null);

    const [form, setForm] =
        useState<FormState>(EMPTY_FORM);

    const [saving, setSaving] = useState(false);

    const [deleteTarget, setDeleteTarget] =
        useState<AdminExercise | null>(null);

    const [deleting, setDeleting] = useState(false);

    const [solutionModalMode, setSolutionModalMode] =
        useState<SolutionModalMode | null>(null);

    const [
        solutionExercise,
        setSolutionExercise,
    ] = useState<AdminExercise | null>(null);

    const [solutionQuery, setSolutionQuery] =
        useState('');

    const [
        solutionLoading,
        setSolutionLoading,
    ] = useState(false);

    const [
        solutionSaving,
        setSolutionSaving,
    ] = useState(false);

    const [
        solutionDeleteOpen,
        setSolutionDeleteOpen,
    ] = useState(false);

    const [
        solutionDeleting,
        setSolutionDeleting,
    ] = useState(false);

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
                exercisesData,
                casesData,
            ] = await Promise.all([
                getAdminExercises(accessToken),
                getAdminCases(accessToken),
            ]);

            setExercises(exercisesData);
            setCases(casesData);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Не удалось загрузить задания',
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void loadData();
    }, []);

    const filteredExercises = useMemo(() => {
        const normalizedSearch =
            search.trim().toLowerCase();

        return exercises.filter((exercise) => {
            const matchesSearch =
                !normalizedSearch ||
                exercise.title
                    .toLowerCase()
                    .includes(normalizedSearch) ||
                exercise.description
                    .toLowerCase()
                    .includes(normalizedSearch) ||
                exercise.learningCase?.title
                    ?.toLowerCase()
                    .includes(normalizedSearch);

            const matchesCase =
                caseFilter === 'all' ||
                exercise.caseId === caseFilter;

            const matchesDifficulty =
                difficultyFilter === 'all' ||
                exercise.difficulty ===
                difficultyFilter;

            const matchesStatus =
                statusFilter === 'all' ||
                (statusFilter === 'published'
                    ? exercise.isPublished
                    : !exercise.isPublished);

            return (
                matchesSearch &&
                matchesCase &&
                matchesDifficulty &&
                matchesStatus
            );
        });
    }, [
        exercises,
        search,
        caseFilter,
        difficultyFilter,
        statusFilter,
    ]);

    const stats = useMemo(() => {
        const published =
            exercises.filter(
                (exercise) =>
                    exercise.isPublished,
            ).length;

        const solutions =
            exercises.filter(
                (exercise) =>
                    !!exercise.exerciseSolution,
            ).length;

        return {
            total: exercises.length,
            published,
            drafts:
                exercises.length - published,
            solutions,
        };
    }, [exercises]);

    function openCreateModal() {
        setEditingExercise(null);

        setForm({
            ...EMPTY_FORM,
            caseId: cases[0]?.id ?? '',
        });

        setModalMode('create');
    }

    function openEditModal(
        exercise: AdminExercise,
    ) {
        setEditingExercise(exercise);

        setForm({
            caseId: exercise.caseId,
            title: exercise.title,
            description: exercise.description,
            difficulty: exercise.difficulty,
            sortOrder:
                String(exercise.sortOrder),
            isPublished:
            exercise.isPublished,
        });

        setOpenMenuId(null);
        setModalMode('edit');
    }

    function closeModal() {
        if (saving) return;

        setModalMode(null);
        setEditingExercise(null);
        setForm(EMPTY_FORM);
    }

    async function handleSaveExercise() {
        if (
            !form.caseId ||
            !form.title.trim() ||
            !form.description.trim()
        ) {
            setError(
                'Заполни все обязательные поля',
            );
            return;
        }

        const sortOrder =
            Number(form.sortOrder);

        if (
            !Number.isInteger(sortOrder) ||
            sortOrder < 1
        ) {
            setError(
                'Порядок должен быть целым числом больше 0',
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
                editingExercise
            ) {
                await updateAdminExercise(
                    accessToken,
                    editingExercise.id,
                    {
                        caseId: form.caseId,
                        title: form.title.trim(),
                        description:
                            form.description.trim(),
                        difficulty:
                        form.difficulty,
                        sortOrder,
                        isPublished:
                        form.isPublished,
                    },
                );
            } else {
                await createAdminExercise(
                    accessToken,
                    {
                        caseId: form.caseId,
                        title: form.title.trim(),
                        description:
                            form.description.trim(),
                        difficulty:
                        form.difficulty,
                        sortOrder,
                        isPublished:
                        form.isPublished,
                    },
                );
            }

            closeModal();
            await loadData();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Не удалось сохранить задание',
            );
        } finally {
            setSaving(false);
        }
    }

    async function handleTogglePublished(
        exercise: AdminExercise,
    ) {
        try {
            const accessToken =
                localStorage.getItem(
                    'sqltutor_access_token',
                );

            if (!accessToken) {
                throw new Error(
                    'Сессия пользователя не найдена',
                );
            }

            await updateAdminExercise(
                accessToken,
                exercise.id,
                {
                    isPublished:
                        !exercise.isPublished,
                },
            );

            await loadData();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Не удалось изменить статус задания',
            );
        }
    }

    async function handleDeleteExercise() {
        if (!deleteTarget) return;

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

            await deleteAdminExercise(
                accessToken,
                deleteTarget.id,
            );

            setDeleteTarget(null);
            await loadData();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Не удалось удалить задание',
            );
        } finally {
            setDeleting(false);
        }
    }

    async function openSolutionModal(
        exercise: AdminExercise,
    ) {
        setOpenMenuId(null);
        setSolutionExercise(exercise);
        setSolutionQuery('');
        setSolutionDeleteOpen(false);

        const mode: SolutionModalMode =
            exercise.exerciseSolution
                ? 'edit'
                : 'create';

        setSolutionModalMode(mode);

        if (!exercise.exerciseSolution) {
            return;
        }

        try {
            setSolutionLoading(true);
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

            const solution =
                await getAdminExerciseSolution(
                    accessToken,
                    exercise.id,
                );

            setSolutionQuery(
                solution?.query ?? '',
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Не удалось загрузить решение',
            );

            setSolutionModalMode(null);
            setSolutionExercise(null);
        } finally {
            setSolutionLoading(false);
        }
    }

    function closeSolutionModal() {
        if (
            solutionSaving ||
            solutionDeleting
        ) {
            return;
        }

        setSolutionModalMode(null);
        setSolutionExercise(null);
        setSolutionQuery('');
        setSolutionDeleteOpen(false);
    }

    async function handleSaveSolution() {
        if (!solutionExercise) return;

        if (!solutionQuery.trim()) {
            setError(
                'Введите эталонный SQL-запрос',
            );
            return;
        }

        try {
            setSolutionSaving(true);
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
                solutionExercise.exerciseSolution
            ) {
                await updateAdminExerciseSolution(
                    accessToken,
                    solutionExercise.id,
                    solutionQuery.trim(),
                );
            } else {
                await createAdminExerciseSolution(
                    accessToken,
                    solutionExercise.id,
                    solutionQuery.trim(),
                );
            }

            closeSolutionModal();
            await loadData();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Не удалось сохранить решение',
            );
        } finally {
            setSolutionSaving(false);
        }
    }

    async function handleDeleteSolution() {
        if (!solutionExercise) return;

        try {
            setSolutionDeleting(true);
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

            await deleteAdminExerciseSolution(
                accessToken,
                solutionExercise.id,
            );

            closeSolutionModal();
            await loadData();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Не удалось удалить решение',
            );
        } finally {
            setSolutionDeleting(false);
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
                            <BookOpen className="h-4 w-4" />
                            <span>
                                Управление обучением
                            </span>
                        </div>

                        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                            Задания
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                            Создавай упражнения, управляй
                            их публикацией и добавляй
                            эталонные SQL-решения.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
                    >
                        <Plus className="h-4 w-4" />
                        Новое задание
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
                        label="Всего заданий"
                        value={stats.total}
                        icon={
                            <FileQuestion className="h-4 w-4" />
                        }
                    />

                    <StatCard
                        label="Опубликовано"
                        value={stats.published}
                        icon={
                            <Check className="h-4 w-4" />
                        }
                    />

                    <StatCard
                        label="Черновики"
                        value={stats.drafts}
                        icon={
                            <Circle className="h-4 w-4" />
                        }
                    />

                    <StatCard
                        label="С решениями"
                        value={stats.solutions}
                        icon={
                            <BookOpen className="h-4 w-4" />
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
                                onChange={(event) =>
                                    setSearch(
                                        event.target
                                            .value,
                                    )
                                }
                                placeholder="Поиск по заданиям..."
                                className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
                            />
                        </div>

                        <Select
                            value={caseFilter}
                            onChange={setCaseFilter}
                        >
                            <option value="all">
                                Все курсы
                            </option>

                            {cases.map((item) => (
                                <option
                                    key={item.id}
                                    value={item.id}
                                >
                                    {item.title}
                                </option>
                            ))}
                        </Select>

                        <Select
                            value={difficultyFilter}
                            onChange={(value) =>
                                setDifficultyFilter(
                                    value as
                                        | 'all'
                                        | ExerciseDifficulty,
                                )
                            }
                        >
                            <option value="all">
                                Любая сложность
                            </option>

                            <option value="EASY">
                                Легко
                            </option>

                            <option value="MEDIUM">
                                Средне
                            </option>

                            <option value="HARD">
                                Сложно
                            </option>
                        </Select>

                        <Select
                            value={statusFilter}
                            onChange={(value) =>
                                setStatusFilter(
                                    value as
                                        | 'all'
                                        | 'published'
                                        | 'draft',
                                )
                            }
                        >
                            <option value="all">
                                Любой статус
                            </option>

                            <option value="published">
                                Опубликовано
                            </option>

                            <option value="draft">
                                Черновик
                            </option>
                        </Select>
                    </div>
                </div>

                {/* TABLE */}

                <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
                    {loading ? (
                        <LoadingTable />
                    ) : filteredExercises.length ===
                    0 ? (
                        <EmptyState
                            hasFilters={
                                !!search ||
                                caseFilter !==
                                'all' ||
                                difficultyFilter !==
                                'all' ||
                                statusFilter !==
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
                                    <th className="w-16 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        №
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Задание
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Курс
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Сложность
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Статус
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Решение
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Обновлено
                                    </th>

                                    <th className="w-14 px-4 py-3" />
                                </tr>
                                </thead>

                                <tbody>
                                {filteredExercises.map(
                                    (
                                        exercise,
                                    ) => (
                                        <tr
                                            key={
                                                exercise.id
                                            }
                                            className="group border-b border-border/60 last:border-b-0 hover:bg-muted/20"
                                        >
                                            <td className="px-4 py-4 align-middle">
                                                    <span className="font-mono text-xs text-muted-foreground">
                                                        {String(
                                                            exercise.sortOrder,
                                                        ).padStart(
                                                            2,
                                                            '0',
                                                        )}
                                                    </span>
                                            </td>

                                            <td className="max-w-[350px] px-4 py-4 align-middle">
                                                <div>
                                                    <div className="truncate text-sm font-medium">
                                                        {
                                                            exercise.title
                                                        }
                                                    </div>

                                                    <div className="mt-1 truncate text-xs text-muted-foreground">
                                                        {
                                                            exercise.description
                                                        }
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-4 py-4 align-middle">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                        <BookOpen className="h-4 w-4" />
                                                    </div>

                                                    <span className="max-w-[180px] truncate text-sm">
                                                            {
                                                                exercise
                                                                    .learningCase
                                                                    ?.title
                                                            }
                                                        </span>
                                                </div>
                                            </td>

                                            <td className="px-4 py-4 align-middle">
                                                    <span
                                                        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${getDifficultyClass(
                                                            exercise.difficulty,
                                                        )}`}
                                                    >
                                                        {
                                                            DIFFICULTY_LABELS[
                                                                exercise
                                                                    .difficulty
                                                                ]
                                                        }
                                                    </span>
                                            </td>

                                            <td className="px-4 py-4 align-middle">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleTogglePublished(
                                                            exercise,
                                                        )
                                                    }
                                                    className="inline-flex items-center gap-2 text-sm transition hover:opacity-80"
                                                >
                                                        <span
                                                            className={`h-2 w-2 rounded-full ${
                                                                exercise.isPublished
                                                                    ? 'bg-emerald-500'
                                                                    : 'bg-muted-foreground/40'
                                                            }`}
                                                        />

                                                    <span className="text-muted-foreground">
                                                            {exercise.isPublished
                                                                ? 'Опубликовано'
                                                                : 'Черновик'}
                                                        </span>
                                                </button>
                                            </td>

                                            <td className="px-4 py-4 align-middle">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        void openSolutionModal(
                                                            exercise,
                                                        )
                                                    }
                                                    className={`inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                                                        exercise.exerciseSolution
                                                            ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/15 dark:text-emerald-400'
                                                            : 'border-primary/20 bg-primary/5 text-primary hover:bg-primary/10'
                                                    }`}
                                                >
                                                    {exercise.exerciseSolution ? (
                                                        <>
                                                            <Check className="h-3.5 w-3.5" />
                                                            Есть
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Plus className="h-3.5 w-3.5" />
                                                            Добавить
                                                        </>
                                                    )}
                                                </button>
                                            </td>

                                            <td className="px-4 py-4 align-middle">
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatDate(
                                                            exercise.updatedAt,
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
                                                                exercise.id
                                                                    ? null
                                                                    : exercise.id,
                                                        );
                                                    }}
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground opacity-70 transition hover:bg-muted hover:text-foreground group-hover:opacity-100"
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </button>

                                                {openMenuId ===
                                                    exercise.id && (
                                                        <div
                                                            onClick={(
                                                                event,
                                                            ) =>
                                                                event.stopPropagation()
                                                            }
                                                            className="absolute right-4 top-12 z-30 w-52 overflow-hidden rounded-xl border border-border bg-popover p-1.5 shadow-xl"
                                                        >
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    openEditModal(
                                                                        exercise,
                                                                    )
                                                                }
                                                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-muted"
                                                            >
                                                                <Edit3 className="h-4 w-4 text-muted-foreground" />
                                                                Редактировать
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    void openSolutionModal(
                                                                        exercise,
                                                                    )
                                                                }
                                                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-muted"
                                                            >
                                                                {exercise.exerciseSolution ? (
                                                                    <Edit3 className="h-4 w-4 text-muted-foreground" />
                                                                ) : (
                                                                    <Plus className="h-4 w-4 text-muted-foreground" />
                                                                )}

                                                                {exercise.exerciseSolution
                                                                    ? 'Изменить решение'
                                                                    : 'Добавить решение'}
                                                            </button>

                                                            <div className="my-1 border-t border-border" />

                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setOpenMenuId(
                                                                        null,
                                                                    );
                                                                    setDeleteTarget(
                                                                        exercise,
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
                                    ),
                                )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* RESULT COUNT */}

                {!loading &&
                    filteredExercises.length >
                    0 && (
                        <div className="mt-4 text-xs text-muted-foreground">
                            Показано{' '}
                            <span className="font-medium text-foreground">
                                {
                                    filteredExercises.length
                                }
                            </span>{' '}
                            из{' '}
                            <span className="font-medium text-foreground">
                                {exercises.length}
                            </span>{' '}
                            заданий
                        </div>
                    )}
            </div>

            {/* EXERCISE MODAL */}

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
                                        ? 'Новое задание'
                                        : 'Редактировать задание'}
                                </h2>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Основные параметры
                                    упражнения
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    closeModal
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="max-h-[75vh] overflow-y-auto p-6">
                            <div className="space-y-5">
                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Курс
                                    </label>

                                    <select
                                        value={
                                            form.caseId
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            setForm(
                                                (
                                                    current,
                                                ) => ({
                                                    ...current,
                                                    caseId: event
                                                        .target
                                                        .value,
                                                }),
                                            )
                                        }
                                        className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
                                    >
                                        <option value="">
                                            Выберите курс
                                        </option>

                                        {cases.map(
                                            (
                                                item,
                                            ) => (
                                                <option
                                                    key={
                                                        item.id
                                                    }
                                                    value={
                                                        item.id
                                                    }
                                                >
                                                    {
                                                        item.title
                                                    }
                                                </option>
                                            ),
                                        )}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Название
                                    </label>

                                    <input
                                        value={
                                            form.title
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            setForm(
                                                (
                                                    current,
                                                ) => ({
                                                    ...current,
                                                    title: event
                                                        .target
                                                        .value,
                                                }),
                                            )
                                        }
                                        placeholder="Например: Найдите среднюю цену товаров"
                                        className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Условие
                                    </label>

                                    <textarea
                                        value={
                                            form.description
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            setForm(
                                                (
                                                    current,
                                                ) => ({
                                                    ...current,
                                                    description:
                                                    event
                                                        .target
                                                        .value,
                                                }),
                                            )
                                        }
                                        placeholder="Опишите задачу, которую должен решить студент..."
                                        rows={5}
                                        className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm leading-6 outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
                                    />
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium">
                                            Сложность
                                        </label>

                                        <select
                                            value={
                                                form.difficulty
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                setForm(
                                                    (
                                                        current,
                                                    ) => ({
                                                        ...current,
                                                        difficulty:
                                                            event
                                                                .target
                                                                .value as ExerciseDifficulty,
                                                    }),
                                                )
                                            }
                                            className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
                                        >
                                            <option value="EASY">
                                                Легко
                                            </option>

                                            <option value="MEDIUM">
                                                Средне
                                            </option>

                                            <option value="HARD">
                                                Сложно
                                            </option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium">
                                            Порядок
                                        </label>

                                        <input
                                            type="number"
                                            min={1}
                                            value={
                                                form.sortOrder
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                setForm(
                                                    (
                                                        current,
                                                    ) => ({
                                                        ...current,
                                                        sortOrder:
                                                        event
                                                            .target
                                                            .value,
                                                    }),
                                                )
                                            }
                                            className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
                                        />
                                    </div>
                                </div>

                                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={
                                            form.isPublished
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            setForm(
                                                (
                                                    current,
                                                ) => ({
                                                    ...current,
                                                    isPublished:
                                                    event
                                                        .target
                                                        .checked,
                                                }),
                                            )
                                        }
                                        className="h-4 w-4 rounded border-border accent-primary"
                                    />

                                    <div>
                                        <div className="text-sm font-medium">
                                            Опубликовать
                                        </div>

                                        <div className="text-xs text-muted-foreground">
                                            Задание будет
                                            доступно
                                            студентам
                                        </div>
                                    </div>
                                </label>
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
                                    void handleSaveExercise()
                                }
                                disabled={saving}
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

            {/* SOLUTION MODAL */}

            {solutionModalMode &&
                solutionExercise && (
                    <ModalOverlay
                        onClose={
                            closeSolutionModal
                        }
                    >
                        <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
                            <div className="flex items-center justify-between border-b border-border px-6 py-4">
                                <div className="min-w-0">
                                    <div className="mb-1 flex items-center gap-2">
                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <BookOpen className="h-3.5 w-3.5" />
                                        </div>

                                        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                            Эталонное решение
                                        </span>
                                    </div>

                                    <h2 className="truncate text-lg font-semibold">
                                        {
                                            solutionExercise.title
                                        }
                                    </h2>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        SQL-запрос,
                                        который считается
                                        эталонным решением
                                        задания.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        closeSolutionModal
                                    }
                                    className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="p-6">
                                {solutionLoading ? (
                                    <div className="flex h-[380px] items-center justify-center rounded-xl border border-border bg-[#1e1e1e]">
                                        <div className="flex items-center gap-2 text-sm text-white/70">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Загрузка решения...
                                        </div>
                                    </div>
                                ) : (
                                    <div className="overflow-hidden rounded-xl border border-border">
                                        <Editor
                                            height="380px"
                                            language="sql"
                                            theme="vs-dark"
                                            value={
                                                solutionQuery
                                            }
                                            onChange={(
                                                value,
                                            ) =>
                                                setSolutionQuery(
                                                    value ??
                                                    '',
                                                )
                                            }
                                            options={{
                                                minimap: {
                                                    enabled: false,
                                                },
                                                fontSize: 14,
                                                lineNumbers:
                                                    'on',
                                                scrollBeyondLastLine:
                                                    false,
                                                automaticLayout:
                                                    true,
                                                tabSize: 4,
                                                padding: {
                                                    top: 16,
                                                    bottom: 16,
                                                },
                                                wordWrap:
                                                    'on',
                                                suggestOnTriggerCharacters:
                                                    false,
                                            }}
                                        />
                                    </div>
                                )}

                                <div className="mt-4 rounded-xl border border-border bg-muted/20 px-4 py-3">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                                        <p className="text-xs leading-5 text-muted-foreground">
                                            Это решение
                                            используется
                                            платформой как
                                            эталонный SQL для
                                            проверки результата
                                            выполнения запроса
                                            студента.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col-reverse gap-3 border-t border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    {solutionExercise.exerciseSolution && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setSolutionDeleteOpen(
                                                    true,
                                                )
                                            }
                                            disabled={
                                                solutionSaving ||
                                                solutionDeleting
                                            }
                                            className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-red-600 transition hover:bg-red-500/10 disabled:opacity-50 dark:text-red-400"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Удалить решение
                                        </button>
                                    )}
                                </div>

                                <div className="flex items-center justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={
                                            closeSolutionModal
                                        }
                                        disabled={
                                            solutionSaving ||
                                            solutionDeleting
                                        }
                                        className="h-10 rounded-xl border border-border px-4 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
                                    >
                                        Отмена
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            void handleSaveSolution()
                                        }
                                        disabled={
                                            solutionLoading ||
                                            solutionSaving ||
                                            solutionDeleting
                                        }
                                        className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {solutionSaving && (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        )}

                                        {solutionModalMode ===
                                        'create'
                                            ? 'Добавить решение'
                                            : 'Сохранить изменения'}
                                    </button>
                                </div>
                            </div>

                            {solutionDeleteOpen && (
                                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
                                    <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
                                        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
                                            <Trash2 className="h-5 w-5" />
                                        </div>

                                        <h3 className="text-base font-semibold">
                                            Удалить эталонное
                                            решение?
                                        </h3>

                                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                            SQL-решение для
                                            задания «
                                            {
                                                solutionExercise.title
                                            }» будет удалено.
                                            Само задание
                                            останется.
                                        </p>

                                        <div className="mt-6 flex justify-end gap-3">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setSolutionDeleteOpen(
                                                        false,
                                                    )
                                                }
                                                disabled={
                                                    solutionDeleting
                                                }
                                                className="h-10 rounded-xl border border-border px-4 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
                                            >
                                                Отмена
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    void handleDeleteSolution()
                                                }
                                                disabled={
                                                    solutionDeleting
                                                }
                                                className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
                                            >
                                                {solutionDeleting && (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                )}

                                                Удалить
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ModalOverlay>
                )}

            {/* EXERCISE DELETE MODAL */}

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
                            Удалить задание?
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            Задание «
                            {deleteTarget.title}»
                            будет удалено. Связанное
                            эталонное решение,
                            подсказки и другие данные,
                            зависящие от задания,
                            также могут быть удалены
                            согласно настройкам базы
                            данных.
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() =>
                                    setDeleteTarget(
                                        null,
                                    )
                                }
                                disabled={deleting}
                                className="h-10 rounded-xl border border-border px-4 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
                            >
                                Отмена
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    void handleDeleteExercise()
                                }
                                disabled={deleting}
                                className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
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
        <div className="relative min-w-[180px]">
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
                <div className="h-3 w-20 rounded bg-muted" />
            </div>

            {Array.from({
                length: 6,
            }).map((_, index) => (
                <div
                    key={index}
                    className="flex items-center gap-6 border-b border-border/60 px-4 py-5 last:border-b-0"
                >
                    <div className="h-3 w-5 rounded bg-muted" />

                    <div className="flex-1 space-y-2">
                        <div className="h-4 w-56 rounded bg-muted" />
                        <div className="h-3 w-72 rounded bg-muted" />
                    </div>

                    <div className="h-7 w-24 rounded-full bg-muted" />

                    <div className="h-7 w-24 rounded-full bg-muted" />

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
                <FileQuestion className="h-5 w-5" />
            </div>

            <h3 className="mt-4 text-base font-semibold">
                {hasFilters
                    ? 'Задания не найдены'
                    : 'Заданий пока нет'}
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                {hasFilters
                    ? 'Попробуй изменить параметры поиска или фильтров.'
                    : 'Создай первое задание, чтобы начать наполнять учебный курс.'}
            </p>

            {!hasFilters && (
                <button
                    type="button"
                    onClick={onCreate}
                    className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                >
                    <Plus className="h-4 w-4" />
                    Создать задание
                </button>
            )}
        </div>
    );
}