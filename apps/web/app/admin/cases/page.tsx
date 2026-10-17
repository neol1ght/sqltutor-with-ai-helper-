
'use client'

import {
    useEffect,
    useMemo,
    useState,
} from 'react'

import {
    AlertCircle,
    BookOpen,
    Check,
    Database,
    Edit3,
    Globe,
    Lock,
    Plus,
    Search,
    Trash2,
    X,
} from 'lucide-react'

import {
    createAdminCase,
    deleteAdminCase,
    getAdminCases,
    updateAdminCase,
    type AdminCase,
    type CaseDifficulty,
} from '@/lib/api/admin/cases'

type CaseForm = {
    slug: string
    title: string
    description: string
    difficulty: CaseDifficulty
    databaseName: string
    published: boolean
}

const EMPTY_FORM: CaseForm = {
    slug: '',
    title: '',
    description: '',
    difficulty: 'EASY',
    databaseName: '',
    published: false,
}

const DIFFICULTY_LABELS: Record<
    CaseDifficulty,
    string
> = {
    EASY: 'Легко',
    MEDIUM: 'Средне',
    HARD: 'Сложно',
}

function getDifficultyClass(
    difficulty: CaseDifficulty,
) {
    switch (difficulty) {
        case 'EASY':
            return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'

        case 'MEDIUM':
            return 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400'

        case 'HARD':
            return 'border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400'
    }
}

export default function AdminCasesPage() {
    const [cases, setCases] = useState<AdminCase[]>(
        [],
    )

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [search, setSearch] = useState('')

    const [isModalOpen, setIsModalOpen] =
        useState(false)

    const [editingCase, setEditingCase] =
        useState<AdminCase | null>(null)

    const [form, setForm] =
        useState<CaseForm>(EMPTY_FORM)

    const [saving, setSaving] = useState(false)

    const [deletingId, setDeletingId] =
        useState<string | null>(null)

    const [publishingId, setPublishingId] =
        useState<string | null>(null)

    async function loadCases() {
        try {
            setLoading(true)
            setError('')

            const accessToken =
                localStorage.getItem(
                    'sqltutor_access_token',
                )

            if (!accessToken) {
                throw new Error(
                    'Сессия пользователя не найдена',
                )
            }

            const data =
                await getAdminCases(accessToken)

            setCases(data)
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Не удалось загрузить курсы',
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        void loadCases()
    }, [])

    const filteredCases = useMemo(() => {
        const normalizedSearch =
            search.trim().toLowerCase()

        if (!normalizedSearch) {
            return cases
        }

        return cases.filter((learningCase) => {
            return (
                learningCase.title
                    .toLowerCase()
                    .includes(normalizedSearch) ||
                learningCase.slug
                    .toLowerCase()
                    .includes(normalizedSearch) ||
                learningCase.databaseName
                    .toLowerCase()
                    .includes(normalizedSearch) ||
                learningCase.description
                    ?.toLowerCase()
                    .includes(normalizedSearch)
            )
        })
    }, [cases, search])

    const stats = useMemo(() => {
        const published = cases.filter(
            (item) => item.isPublished,
        ).length

        return {
            total: cases.length,
            published,
            drafts: cases.length - published,
        }
    }, [cases])

    function openCreateModal() {
        setEditingCase(null)
        setForm(EMPTY_FORM)
        setError('')
        setIsModalOpen(true)
    }

    function openEditModal(
        learningCase: AdminCase,
    ) {
        setEditingCase(learningCase)

        setForm({
            slug: learningCase.slug,
            title: learningCase.title,
            description:
                learningCase.description ?? '',
            difficulty: learningCase.difficulty,
            databaseName:
                learningCase.databaseName,
            published: learningCase.isPublished,
        })

        setError('')
        setIsModalOpen(true)
    }

    function closeModal() {
        if (saving) {
            return
        }

        setIsModalOpen(false)
        setEditingCase(null)
        setForm(EMPTY_FORM)
    }

    async function handleSave() {
        if (
            !form.slug.trim() ||
            !form.title.trim() ||
            !form.databaseName.trim()
        ) {
            setError(
                'Заполни все обязательные поля',
            )
            return
        }

        try {
            setSaving(true)
            setError('')

            const accessToken =
                localStorage.getItem(
                    'sqltutor_access_token',
                )

            if (!accessToken) {
                throw new Error(
                    'Сессия пользователя не найдена',
                )
            }

            const payload = {
                slug: form.slug.trim(),
                title: form.title.trim(),
                description:
                    form.description.trim() ||
                    undefined,
                difficulty: form.difficulty,
                databaseName:
                    form.databaseName.trim(),
                published: form.published,
            }

            if (editingCase) {
                await updateAdminCase(
                    accessToken,
                    editingCase.id,
                    payload,
                )
            } else {
                await createAdminCase(
                    accessToken,
                    payload,
                )
            }

            closeModal()
            await loadCases()
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Не удалось сохранить курс',
            )
        } finally {
            setSaving(false)
        }
    }

    async function handleDelete(
        learningCase: AdminCase,
    ) {
        const confirmed = window.confirm(
            `Удалить курс «${learningCase.title}»?`,
        )

        if (!confirmed) {
            return
        }

        try {
            setDeletingId(learningCase.id)
            setError('')

            const accessToken =
                localStorage.getItem(
                    'sqltutor_access_token',
                )

            if (!accessToken) {
                throw new Error(
                    'Сессия пользователя не найдена',
                )
            }

            await deleteAdminCase(
                accessToken,
                learningCase.id,
            )

            await loadCases()
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Не удалось удалить курс',
            )
        } finally {
            setDeletingId(null)
        }
    }

    async function handleTogglePublished(
        learningCase: AdminCase,
    ) {
        try {
            setPublishingId(learningCase.id)
            setError('')

            const accessToken =
                localStorage.getItem(
                    'sqltutor_access_token',
                )

            if (!accessToken) {
                throw new Error(
                    'Сессия пользователя не найдена',
                )
            }

            await updateAdminCase(
                accessToken,
                learningCase.id,
                {
                    published:
                        !learningCase.isPublished,
                },
            )

            await loadCases()
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Не удалось изменить статус курса',
            )
        } finally {
            setPublishingId(null)
        }
    }

    return (
        <div className="min-h-full bg-background">
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
                            Курсы
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                            Управляй учебными кейсами,
                            базами данных и публикацией
                            курсов для студентов.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
                    >
                        <Plus className="h-4 w-4" />
                        Новый курс
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

                <div className="mb-6 grid gap-3 sm:grid-cols-3">
                    <StatCard
                        label="Всего курсов"
                        value={stats.total}
                        icon={
                            <BookOpen className="h-4 w-4" />
                        }
                    />

                    <StatCard
                        label="Опубликовано"
                        value={stats.published}
                        icon={
                            <Globe className="h-4 w-4" />
                        }
                    />

                    <StatCard
                        label="Черновики"
                        value={stats.drafts}
                        icon={
                            <Lock className="h-4 w-4" />
                        }
                    />
                </div>

                {/* FILTERS */}

                <div className="mb-5 rounded-2xl border border-border/70 bg-card p-3 shadow-sm">
                    <div className="flex flex-col gap-3 lg:flex-row">
                        <div className="relative min-w-0 flex-1">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <input
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value,
                                    )
                                }
                                placeholder="Поиск по курсам..."
                                className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
                            />
                        </div>
                    </div>
                </div>

                {/* TABLE */}

                <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
                    {loading ? (
                        <LoadingTable />
                    ) : filteredCases.length ===
                      0 ? (
                        <EmptyState
                            hasSearch={!!search}
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
                                            Курс
                                        </th>

                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                            Slug
                                        </th>

                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                            Сложность
                                        </th>

                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                            База данных
                                        </th>

                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                            Статус
                                        </th>

                                        <th className="w-36 px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                            Действия
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredCases.map(
                                        (
                                            learningCase,
                                        ) => (
                                            <tr
                                                key={
                                                    learningCase.id
                                                }
                                                className="group border-b border-border/60 last:border-b-0 hover:bg-muted/20"
                                            >
                                                <td className="max-w-[350px] px-4 py-4 align-middle">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                            <BookOpen className="h-4 w-4" />
                                                        </div>

                                                        <div className="min-w-0">
                                                            <div className="truncate text-sm font-medium">
                                                                {
                                                                    learningCase.title
                                                                }
                                                            </div>

                                                            {learningCase.description && (
                                                                <div className="mt-1 truncate text-xs text-muted-foreground">
                                                                    {
                                                                        learningCase.description
                                                                    }
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-4 align-middle">
                                                    <code className="inline-flex max-w-[180px] truncate rounded-lg bg-muted px-2 py-1 text-xs">
                                                        {
                                                            learningCase.slug
                                                        }
                                                    </code>
                                                </td>

                                                <td className="px-4 py-4 align-middle">
                                                    <span
                                                        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${getDifficultyClass(
    learningCase.difficulty,
)}`}
                                                    >
                                                        {
                                                            DIFFICULTY_LABELS[
                                                                learningCase
                                                                    .difficulty
                                                            ]
                                                        }
                                                    </span>
                                                </td>

                                                <td className="px-4 py-4 align-middle">
                                                    <div className="flex items-center gap-2">
                                                        <Database className="h-4 w-4 shrink-0 text-muted-foreground" />

                                                        <code className="max-w-[200px] truncate text-xs">
                                                            {
                                                                learningCase.databaseName
                                                            }
                                                        </code>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-4 align-middle">
                                                    <button
                                                        type="button"
                                                        disabled={
                                                            publishingId ===
                                                            learningCase.id
                                                        }
                                                        onClick={() =>
                                                            void handleTogglePublished(
                                                                learningCase,
                                                            )
                                                        }
                                                        className="inline-flex items-center gap-2 text-sm transition hover:opacity-80 disabled:opacity-50"
                                                    >
                                                        <span
                                                            className={`h-2 w-2 rounded-full ${
    learningCase.isPublished
        ? 'bg-emerald-500'
        : 'bg-muted-foreground/40'
}`}
                                                        />

                                                        <span className="text-muted-foreground">
                                                            {learningCase.isPublished
                                                                ? 'Опубликовано'
                                                                : 'Черновик'}
                                                        </span>
                                                    </button>
                                                </td>

                                                <td className="px-4 py-4 align-middle">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openEditModal(
                                                                    learningCase,
                                                                )
                                                            }
                                                            className="inline-flex h-8 items-center gap-2 rounded-lg border border-border px-3 text-sm transition hover:bg-muted"
                                                        >
                                                            <Edit3 className="h-4 w-4" />

                                                            <span className="hidden xl:inline">
                                                                Изменить
                                                            </span>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            disabled={
                                                                deletingId ===
                                                                learningCase.id
                                                            }
                                                            onClick={() =>
                                                                void handleDelete(
                                                                    learningCase,
                                                                )
                                                            }
                                                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-red-500/10 hover:text-red-600 disabled:pointer-events-none disabled:opacity-50 dark:hover:text-red-400"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
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
                    filteredCases.length >
                        0 && (
                        <div className="mt-4 text-xs text-muted-foreground">
                            Показано{' '}
                            <span className="font-medium text-foreground">
                                {
                                    filteredCases.length
                                }
                            </span>{' '}
                            из{' '}
                            <span className="font-medium text-foreground">
                                {cases.length}
                            </span>{' '}
                            курсов
                        </div>
                    )}
            </div>

            {/* MODAL */}

            {isModalOpen && (
                <ModalOverlay
                    onClose={closeModal}
                >
                    <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
                        <div className="flex items-center justify-between border-b border-border px-6 py-4">
                            <div>
                                <h2 className="text-lg font-semibold">
                                    {editingCase
                                        ? 'Редактировать курс'
                                        : 'Новый курс'}
                                </h2>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Основные параметры
                                    учебного курса
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
                                <div className="grid gap-4 sm:grid-cols-2">
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
                                            placeholder="Online Store"
                                            maxLength={
                                                255
                                            }
                                            className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium">
                                            Slug
                                        </label>

                                        <input
                                            value={
                                                form.slug
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                setForm(
                                                    (
                                                        current,
                                                    ) => ({
                                                        ...current,
                                                        slug: event
                                                            .target
                                                            .value,
                                                    }),
                                                )
                                            }
                                            placeholder="online-store"
                                            maxLength={
                                                100
                                            }
                                            className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Описание
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
                                        placeholder="Опишите учебный кейс..."
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
                                                                .value as CaseDifficulty,
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
                                            База данных
                                        </label>

                                        <input
                                            value={
                                                form.databaseName
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                setForm(
                                                    (
                                                        current,
                                                    ) => ({
                                                        ...current,
                                                        databaseName:
                                                            event
                                                                .target
                                                                .value,
                                                    }),
                                                )
                                            }
                                            placeholder="online_store"
                                            maxLength={
                                                255
                                            }
                                            className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
                                        />
                                    </div>
                                </div>

                                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={
                                            form.published
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            setForm(
                                                (
                                                    current,
                                                ) => ({
                                                    ...current,
                                                    published:
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
                                            Курс будет
                                            доступен
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
                                    void handleSave()
                                }
                                disabled={saving}
                                className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving && (
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                                )}

                                {editingCase
                                    ? 'Сохранить'
                                    : 'Создать'}
                            </button>
                        </div>
                    </div>
                </ModalOverlay>
            )}
        </div>
    )
}

function StatCard({
    label,
    value,
    icon,
}: {
    label: string
    value: number
    icon: React.ReactNode
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
    )
}

function ModalOverlay({
    children,
    onClose,
}: {
    children: React.ReactNode
    onClose: () => void
}) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
                if (
                    event.target ===
                    event.currentTarget
                ) {
                    onClose()
                }
            }}
        >
            {children}
        </div>
    )
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
                    <div className="h-8 w-8 rounded-lg bg-muted" />

                    <div className="flex-1 space-y-2">
                        <div className="h-4 w-56 rounded bg-muted" />

                        <div className="h-3 w-72 rounded bg-muted" />
                    </div>

                    <div className="h-7 w-24 rounded-full bg-muted" />

                    <div className="h-7 w-28 rounded-full bg-muted" />

                    <div className="h-8 w-24 rounded-lg bg-muted" />
                </div>
            ))}
        </div>
    )
}

function EmptyState({
    hasSearch,
    onCreate,
}: {
    hasSearch: boolean
    onCreate: () => void
}) {
    return (
        <div className="flex min-h-[380px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <BookOpen className="h-5 w-5" />
            </div>

            <h3 className="mt-4 text-base font-semibold">
                {hasSearch
                    ? 'Курсы не найдены'
                    : 'Курсов пока нет'}
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                {hasSearch
                    ? 'Попробуй изменить поисковый запрос.'
                    : 'Создай первый учебный курс, чтобы начать наполнять платформу.'}
            </p>

            {!hasSearch && (
                <button
                    type="button"
                    onClick={onCreate}
                    className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                >
                    <Plus className="h-4 w-4" />
                    Создать курс
                </button>
            )}
        </div>
    )
}

