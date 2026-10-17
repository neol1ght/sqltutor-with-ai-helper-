'use client'

import { useEffect, useMemo, useState } from 'react'
import {
    Award,
    Edit3,
    Plus,
    Search,
    Trash2,
    Users,
    X,
} from 'lucide-react'

import {
    createAdminAchievement,
    deleteAdminAchievement,
    getAdminAchievements,
    updateAdminAchievement,
    type AdminAchievement,
} from '@/lib/api/admin/achievements'

type AchievementForm = {
    code: string
    title: string
    description: string
    icon: string
}

const EMPTY_FORM: AchievementForm = {
    code: '',
    title: '',
    description: '',
    icon: '',
}

export default function AdminAchievementsPage() {
    const [achievements, setAchievements] = useState<
        AdminAchievement[]
    >([])

    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [search, setSearch] = useState('')

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingAchievement, setEditingAchievement] =
        useState<AdminAchievement | null>(null)

    const [form, setForm] =
        useState<AchievementForm>(EMPTY_FORM)

    const [isSaving, setIsSaving] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(
        null,
    )

    const loadAchievements = async () => {
        const accessToken = localStorage.getItem(
            'sqltutor_access_token',
        )

        if (!accessToken) {
            setError('Необходимо войти в аккаунт администратора')
            setIsLoading(false)
            return
        }

        try {
            setIsLoading(true)
            setError(null)

            const data =
                await getAdminAchievements(accessToken)

            setAchievements(data)
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Не удалось загрузить достижения',
            )
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadAchievements()
    }, [])

    const filteredAchievements = useMemo(() => {
        const query = search
            .trim()
            .toLowerCase()

        if (!query) {
            return achievements
        }

        return achievements.filter(
            (achievement) =>
                achievement.title
                    .toLowerCase()
                    .includes(query) ||
                achievement.code
                    .toLowerCase()
                    .includes(query) ||
                achievement.description
                    .toLowerCase()
                    .includes(query),
        )
    }, [achievements, search])

    const openCreateModal = () => {
        setEditingAchievement(null)
        setForm(EMPTY_FORM)
        setIsModalOpen(true)
    }

    const openEditModal = (
        achievement: AdminAchievement,
    ) => {
        setEditingAchievement(achievement)

        setForm({
            code: achievement.code,
            title: achievement.title,
            description: achievement.description,
            icon: achievement.icon ?? '',
        })

        setIsModalOpen(true)
    }

    const closeModal = () => {
        if (isSaving) {
            return
        }

        setIsModalOpen(false)
        setEditingAchievement(null)
        setForm(EMPTY_FORM)
    }

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault()

        const accessToken = localStorage.getItem(
            'sqltutor_access_token',
        )

        if (!accessToken) {
            setError(
                'Необходимо войти в аккаунт администратора',
            )
            return
        }

        if (
            !form.code.trim() ||
            !form.title.trim() ||
            !form.description.trim()
        ) {
            setError(
                'Заполните обязательные поля',
            )
            return
        }

        try {
            setIsSaving(true)
            setError(null)

            const payload = {
                code: form.code.trim(),
                title: form.title.trim(),
                description: form.description.trim(),
                ...(form.icon.trim()
                    ? { icon: form.icon.trim() }
                    : {}),
            }

            if (editingAchievement) {
                const updated =
                    await updateAdminAchievement(
                        accessToken,
                        editingAchievement.id,
                        payload,
                    )

                setAchievements((current) =>
                    current.map((item) =>
                        item.id === updated.id
                            ? updated
                            : item,
                    ),
                )
            } else {
                const created =
                    await createAdminAchievement(
                        accessToken,
                        payload,
                    )

                setAchievements((current) => [
                    ...current,
                    created,
                ])
            }

            closeModal()
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Не удалось сохранить достижение',
            )
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (
        achievement: AdminAchievement,
    ) => {
        const confirmed = window.confirm(
            `Удалить достижение «${achievement.title}»?`,
        )

        if (!confirmed) {
            return
        }

        const accessToken = localStorage.getItem(
            'sqltutor_access_token',
        )

        if (!accessToken) {
            setError(
                'Необходимо войти в аккаунт администратора',
            )
            return
        }

        try {
            setDeletingId(achievement.id)
            setError(null)

            await deleteAdminAchievement(
                accessToken,
                achievement.id,
            )

            setAchievements((current) =>
                current.filter(
                    (item) =>
                        item.id !== achievement.id,
                ),
            )
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Не удалось удалить достижение',
            )
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <Award className="h-4 w-4" />
                        <span>Администрирование</span>
                        <span>/</span>
                        <span>Достижения</span>
                    </div>

                    <h1 className="text-3xl font-semibold tracking-tight">
                        Достижения
                    </h1>

                    <p className="mt-2 text-sm text-muted-foreground">
                        Управление достижениями пользователей
                        SQLTutor(AI)
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openCreateModal}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                >
                    <Plus className="h-4 w-4" />
                    Создать достижение
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-start justify-between gap-4 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    <span>{error}</span>

                    <button
                        type="button"
                        onClick={() => setError(null)}
                        className="shrink-0 opacity-70 transition hover:opacity-100"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-2xl border bg-card p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Всего достижений
                            </p>

                            <p className="mt-2 text-3xl font-semibold">
                                {achievements.length}
                            </p>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Award className="h-5 w-5" />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border bg-card p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Выдано пользователям
                            </p>

                            <p className="mt-2 text-3xl font-semibold">
                                {achievements.reduce(
                                    (total, achievement) =>
                                        total +
                                        achievement._count
                                            .userAchievements,
                                    0,
                                )}
                            </p>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Users className="h-5 w-5" />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border bg-card p-5 sm:col-span-2 xl:col-span-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Результатов поиска
                            </p>

                            <p className="mt-2 text-3xl font-semibold">
                                {filteredAchievements.length}
                            </p>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Search className="h-5 w-5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border bg-card">
                <div className="flex flex-col gap-4 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="font-semibold">
                            Список достижений
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Все достижения, доступные в системе
                        </p>
                    </div>

                    <div className="relative w-full sm:w-80">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                        <input
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value,
                                )
                            }
                            placeholder="Поиск достижений..."
                            className="h-10 w-full rounded-xl border bg-background pl-9 pr-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="divide-y">
                        {Array.from({ length: 5 }).map(
                            (_, index) => (
                                <div
                                    key={index}
                                    className="flex animate-pulse items-center gap-4 p-5"
                                >
                                    <div className="h-10 w-10 rounded-xl bg-muted" />

                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 w-48 rounded bg-muted" />
                                        <div className="h-3 w-72 rounded bg-muted" />
                                    </div>

                                    <div className="h-8 w-24 rounded bg-muted" />
                                </div>
                            ),
                        )}
                    </div>
                ) : filteredAchievements.length === 0 ? (
                    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                            <Award className="h-6 w-6 text-muted-foreground" />
                        </div>

                        <h3 className="mt-4 font-semibold">
                            Достижения не найдены
                        </h3>

                        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                            {search
                                ? 'Попробуйте изменить поисковый запрос.'
                                : 'Создайте первое достижение для пользователей.'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[850px]">
                            <thead>
                            <tr className="border-b bg-muted/30 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                <th className="px-5 py-4">
                                    Достижение
                                </th>

                                <th className="px-5 py-4">
                                    Код
                                </th>

                                <th className="px-5 py-4">
                                    Выдано
                                </th>

                                <th className="px-5 py-4">
                                    Создано
                                </th>

                                <th className="px-5 py-4 text-right">
                                    Действия
                                </th>
                            </tr>
                            </thead>

                            <tbody className="divide-y">
                            {filteredAchievements.map(
                                (achievement) => (
                                    <tr
                                        key={
                                            achievement.id
                                        }
                                        className="transition hover:bg-muted/20"
                                    >
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg">
                                                    {achievement.icon ||
                                                        '🏆'}
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="truncate font-medium">
                                                        {
                                                            achievement.title
                                                        }
                                                    </p>

                                                    <p className="mt-0.5 max-w-md truncate text-sm text-muted-foreground">
                                                        {
                                                            achievement.description
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-5 py-4">
                                            <code className="rounded-lg bg-muted px-2 py-1 text-xs">
                                                {
                                                    achievement.code
                                                }
                                            </code>
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Users className="h-4 w-4 text-muted-foreground" />

                                                {
                                                    achievement
                                                        ._count
                                                        .userAchievements
                                                }
                                            </div>
                                        </td>

                                        <td className="px-5 py-4 text-sm text-muted-foreground">
                                            {new Date(
                                                achievement.createdAt,
                                            ).toLocaleDateString(
                                                'ru-RU',
                                            )}
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openEditModal(
                                                            achievement,
                                                        )
                                                    }
                                                    className="inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm transition hover:bg-muted"
                                                >
                                                    <Edit3 className="h-4 w-4" />
                                                    Изменить
                                                </button>

                                                <button
                                                    type="button"
                                                    disabled={
                                                        deletingId ===
                                                        achievement.id
                                                    }
                                                    onClick={() =>
                                                        handleDelete(
                                                            achievement,
                                                        )
                                                    }
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-destructive/20 text-destructive transition hover:bg-destructive/10 disabled:pointer-events-none disabled:opacity-50"
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

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-xl rounded-2xl border bg-background shadow-2xl">
                        <div className="flex items-start justify-between border-b p-6">
                            <div>
                                <h2 className="text-xl font-semibold">
                                    {editingAchievement
                                        ? 'Редактировать достижение'
                                        : 'Новое достижение'}
                                </h2>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    {editingAchievement
                                        ? 'Измените данные существующего достижения.'
                                        : 'Создайте новое достижение для пользователей.'}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeModal}
                                className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5 p-6"
                        >
                            <div className="grid gap-5 sm:grid-cols-2">
                                <label className="space-y-2">
                                    <span className="text-sm font-medium">
                                        Код
                                    </span>

                                    <input
                                        value={form.code}
                                        onChange={(event) =>
                                            setForm(
                                                (current) => ({
                                                    ...current,
                                                    code: event
                                                        .target
                                                        .value,
                                                }),
                                            )
                                        }
                                        placeholder="first_solve"
                                        maxLength={100}
                                        required
                                        className="h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-primary"
                                    />
                                </label>

                                <label className="space-y-2">
                                    <span className="text-sm font-medium">
                                        Иконка
                                    </span>

                                    <input
                                        value={form.icon}
                                        onChange={(event) =>
                                            setForm(
                                                (current) => ({
                                                    ...current,
                                                    icon: event
                                                        .target
                                                        .value,
                                                }),
                                            )
                                        }
                                        placeholder="🏆"
                                        maxLength={255}
                                        className="h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-primary"
                                    />
                                </label>
                            </div>

                            <label className="block space-y-2">
                                <span className="text-sm font-medium">
                                    Название
                                </span>

                                <input
                                    value={form.title}
                                    onChange={(event) =>
                                        setForm(
                                            (current) => ({
                                                ...current,
                                                title: event.target
                                                    .value,
                                            }),
                                        )
                                    }
                                    placeholder="Первое решение"
                                    maxLength={255}
                                    required
                                    className="h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-primary"
                                />
                            </label>

                            <label className="block space-y-2">
                                <span className="text-sm font-medium">
                                    Описание
                                </span>

                                <textarea
                                    value={form.description}
                                    onChange={(event) =>
                                        setForm(
                                            (current) => ({
                                                ...current,
                                                description:
                                                event.target
                                                    .value,
                                            }),
                                        )
                                    }
                                    placeholder="Решите своё первое задание"
                                    required
                                    rows={4}
                                    className="w-full resize-none rounded-xl border bg-background px-3 py-3 text-sm outline-none transition focus:border-primary"
                                />
                            </label>

                            <div className="flex justify-end gap-3 border-t pt-5">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={isSaving}
                                    className="h-10 rounded-xl border px-4 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
                                >
                                    Отмена
                                </button>

                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="h-10 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
                                >
                                    {isSaving
                                        ? 'Сохранение...'
                                        : editingAchievement
                                            ? 'Сохранить изменения'
                                            : 'Создать достижение'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}