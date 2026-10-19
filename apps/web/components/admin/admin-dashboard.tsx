
'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Activity,
  AlertCircle,
  BookOpen,
  CheckCircle2,
  CircleDollarSign,
  Database,
  RefreshCw,
  Search,
  Target,
  Trophy,
  UserCheck,
  Users,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts'

import { Badge } from '@/components/ui/badge'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3500/api'
).replace(/\/+$/, '')

const numberFormatter = new Intl.NumberFormat('ru-RU')

type DashboardData = {
  users: {
    total: number
    students: number
    admins: number
    activeLast7Days: number
  }
  cases: {
    total: number
    published: number
  }
  exercises: {
    total: number
    published: number
  }
  submissions: {
    total: number
    correct: number
    incorrect: number
    successRate: number
  }
  progress: {
    notStarted: number
    inProgress: number
    solved: number
  }
  achievements: {
    total: number
    unlocked: number
  }
  activity: {
    submissionsByDay: {
      date: string
      total: number
      correct: number
      incorrect: number
    }[]
  }
  exercisesStats: {
    mostAttempted: ExerciseStat[]
    mostFailed: ExerciseStat[]
  }
}

type ExerciseStat = {
  exerciseId: string
  title: string
  difficulty: string | null
  caseTitle: string | null
  submissions: number
}

type AdminUser = {
  id: string
  firstName?: string | null
  lastName?: string | null
  name?: string | null
  email: string
  role?: string | null
  createdAt?: string | null
}

type UserApiResponse =
  | AdminUser[]
  | {
      users?: AdminUser[]
      data?: AdminUser[] | { users?: AdminUser[] }
      items?: AdminUser[]
    }

const activityConfig: ChartConfig = {
  total: {
    label: 'Все попытки',
    color: 'var(--chart-1)',
  },
  correct: {
    label: 'Верные решения',
    color: 'var(--chart-2)',
  },
  incorrect: {
    label: 'Ошибки',
    color: 'var(--chart-3)',
  },
}

const exerciseConfig: ChartConfig = {
  submissions: {
    label: 'Попытки',
    color: 'var(--chart-1)',
  },
}

const planDistribution = [
  { plan: 'Free', value: 62, fill: 'var(--chart-4)' },
  { plan: 'Pro', value: 31, fill: 'var(--chart-1)' },
  { plan: 'Team', value: 7, fill: 'var(--chart-2)' },
]

const planConfig: ChartConfig = {
  Free: {
    label: 'Free',
    color: 'var(--chart-4)',
  },
  Pro: {
    label: 'Pro',
    color: 'var(--chart-1)',
  },
  Team: {
    label: 'Team',
    color: 'var(--chart-2)',
  },
}

function formatNumber(value: number | undefined) {
  return numberFormatter.format(value ?? 0)
}

function formatDate(date: string | null | undefined) {
  if (!date) return '—'

  const parsed = new Date(date)

  if (Number.isNaN(parsed.getTime())) return '—'

  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsed)
}

function formatDay(date: string) {
  const parsed = new Date(`${date}T12:00:00`)

  if (Number.isNaN(parsed.getTime())) return date

  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
  }).format(parsed)
}

function getUserName(user: AdminUser) {
  const fullName = [user.firstName, user.lastName]
    .filter(Boolean)
    .join(' ')
    .trim()

  return fullName || user.name || user.email
}

function normalizeUsers(payload: UserApiResponse): AdminUser[] {
  if (Array.isArray(payload)) return payload

  if (Array.isArray(payload.users)) return payload.users
  if (Array.isArray(payload.items)) return payload.items
  if (Array.isArray(payload.data)) return payload.data

  if (
    payload.data &&
    !Array.isArray(payload.data) &&
    Array.isArray(payload.data.users)
  ) {
    return payload.data.users
  }

  return []
}

function getRoleLabel(role: string | null | undefined) {
  switch (role) {
    case 'ADMIN':
      return 'Администратор'
    case 'STUDENT':
      return 'Студент'
    default:
      return role || 'Не указана'
  }
}

function getRoleBadgeClass(role: string | null | undefined) {
  if (role === 'ADMIN') {
    return 'border-primary/30 bg-primary/5 text-primary'
  }

  return 'text-muted-foreground'
}

function getApiError(payload: unknown, fallback: string) {
  if (
    typeof payload === 'object' &&
    payload !== null &&
    'message' in payload
  ) {
    const message = (payload as { message?: unknown }).message

    if (typeof message === 'string') return message
    if (Array.isArray(message)) return message.join(', ')
  }

  return fallback
}

export function AdminDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usersError, setUsersError] = useState<string | null>(null)

  const loadDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    setError(null)
    setUsersError(null)

    try {
      const accessToken =
        typeof window !== 'undefined'
          ? localStorage.getItem('sqltutor_access_token')
          : null

      if (!accessToken) {
        throw new Error(
          'Не найден токен авторизации. Войди в аккаунт администратора и обнови страницу.',
        )
      }

      const headers = {
        Authorization: `Bearer ${accessToken}`,
      }

      const dashboardResponse = await fetch(
        `${API_URL}/admin/dashboard`,
        {
          method: 'GET',
          headers,
          cache: 'no-store',
        },
      )

      const dashboardPayload = await dashboardResponse
        .json()
        .catch(() => null)

      if (!dashboardResponse.ok) {
        throw new Error(
          getApiError(
            dashboardPayload,
            `Не удалось загрузить статистику (${dashboardResponse.status}).`,
          ),
        )
      }

      setDashboard(dashboardPayload as DashboardData)

      // Список пользователей загружается отдельно:
      // ошибка этого запроса не блокирует статистику дашборда.
      try {
        const usersResponse = await fetch(`${API_URL}/admin/users`, {
          method: 'GET',
          headers,
          cache: 'no-store',
        })

        const usersPayload = await usersResponse.json().catch(() => null)

        if (!usersResponse.ok) {
          throw new Error(
            getApiError(
              usersPayload,
              `Не удалось загрузить пользователей (${usersResponse.status}).`,
            ),
          )
        }

        setUsers(normalizeUsers(usersPayload as UserApiResponse))
      } catch (userError) {
        setUsers([])
        setUsersError(
          userError instanceof Error
            ? userError.message
            : 'Не удалось загрузить список пользователей.',
        )
      }
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Не удалось загрузить данные дашборда.',
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    void loadDashboard()
  }, [loadDashboard])

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return users.filter((user) => {
      const searchableText =
        `${getUserName(user)} ${user.email}`.toLowerCase()

      const matchesQuery = searchableText.includes(normalizedQuery)
      const matchesRole =
        roleFilter === 'ALL' || user.role === roleFilter

      return matchesQuery && matchesRole
    })
  }, [users, query, roleFilter])

  const activityData = useMemo(() => {
    return (dashboard?.activity.submissionsByDay ?? []).map((day) => ({
      ...day,
      label: formatDay(day.date),
    }))
  }, [dashboard])

  const mostAttempted = dashboard?.exercisesStats.mostAttempted ?? []
  const mostFailed = dashboard?.exercisesStats.mostFailed ?? []

  const kpis = dashboard
    ? [
        {
          label: 'Всего пользователей',
          value: formatNumber(dashboard.users.total),
          description: `${formatNumber(dashboard.users.students)} студентов`,
          icon: Users,
          tone: 'bg-primary/10 text-primary',
        },
        {
          label: 'Активны за 7 дней',
          value: formatNumber(dashboard.users.activeLast7Days),
          description: `${formatNumber(dashboard.users.admins)} администраторов`,
          icon: UserCheck,
          tone: 'bg-ai/10 text-ai',
        },
        {
          label: 'Попытки решения SQL',
          value: formatNumber(dashboard.submissions.total),
          description: `${formatNumber(dashboard.submissions.correct)} верных решений`,
          icon: Activity,
          tone: 'bg-warn/10 text-warn',
        },
        {
          label: 'Успешность решений',
          value: `${dashboard.submissions.successRate}%`,
          description: `${formatNumber(dashboard.submissions.incorrect)} неудачных попыток`,
          icon: Target,
          tone: 'bg-primary/10 text-primary',
        },
      ]
    : []

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-8 lg:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-sm text-muted-foreground">
            {'-- сводка платформы'}
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Обзор
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Статистика обучения и активности пользователей SQLTutor.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadDashboard(true)}
          disabled={loading || refreshing}
          className="inline-flex h-9 w-fit items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            className={cn('size-4', refreshing && 'animate-spin')}
            aria-hidden="true"
          />
          {refreshing ? 'Обновление…' : 'Обновить данные'}
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-6 flex items-start gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4"
        >
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
          <div className="min-w-0 flex-1">
            <p className="font-medium">Не удалось загрузить дашборд</p>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            <button
              type="button"
              onClick={() => void loadDashboard(true)}
              className="mt-3 text-sm font-medium text-primary hover:underline"
            >
              Попробовать ещё раз
            </button>
          </div>
        </div>
      )}

      {loading && !dashboard && !error ? (
        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-36 animate-pulse rounded-xl border border-border bg-card"
            />
          ))}
        </div>
      ) : (
        <>
          <ul className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {kpis.map(({ label, value, description, icon: Icon, tone }) => (
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
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <p className="mt-4 text-2xl font-semibold tracking-tight">
                  {value}
                </p>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {description}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <section
              aria-labelledby="activity-heading"
              className="rounded-2xl border border-border bg-card p-5 sm:p-6 lg:col-span-2"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 id="activity-heading" className="font-semibold">
                    Активность за 7 дней
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Количество отправленных SQL-запросов
                  </p>
                </div>
                <Badge variant="outline">
                  {formatNumber(dashboard?.submissions.total)} всего
                </Badge>
              </div>

              {activityData.length > 0 ? (
                <ChartContainer
                  config={activityConfig}
                  className="mt-5 h-64 w-full"
                >
                  <AreaChart
                    data={activityData}
                    margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="activity-fill"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="var(--color-total)"
                          stopOpacity={0.25}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--color-total)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      vertical={false}
                      stroke="var(--border)"
                    />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      minTickGap={12}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          labelKey="label"
                          indicator="dot"
                        />
                      }
                    />
                    <Area
                      dataKey="total"
                      type="monotone"
                      stroke="var(--color-total)"
                      fill="url(#activity-fill)"
                      strokeWidth={2}
                      activeDot={{ r: 4 }}
                    />
                    <Area
                      dataKey="correct"
                      type="monotone"
                      stroke="var(--color-correct)"
                      fill="transparent"
                      strokeWidth={2}
                    />
                    <Area
                      dataKey="incorrect"
                      type="monotone"
                      stroke="var(--color-incorrect)"
                      fill="transparent"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ChartContainer>
              ) : (
                <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                  Пока нет данных об активности за выбранный период.
                </div>
              )}

              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <span className="size-2 rounded-full bg-[var(--chart-1)]" />
                  Все попытки
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="size-2 rounded-full bg-[var(--chart-2)]" />
                  Верные решения
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="size-2 rounded-full bg-[var(--chart-3)]" />
                  Ошибки
                </span>
              </div>
            </section>

            <section
              aria-labelledby="plans-heading"
              className="rounded-2xl border border-border bg-card p-5 sm:p-6"
            >
              <div className="flex items-center gap-2">
                <CircleDollarSign
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
                <h2 id="plans-heading" className="font-semibold">
                  Тарифы пользователей
                </h2>
              </div>

              <div className="mt-3 rounded-lg border border-dashed border-border bg-muted/40 px-3 py-2">
                <p className="text-xs font-medium">Демонстрационный блок</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Тарифные планы ещё не подключены. Диаграмма показывает
                  пример оформления и не отражает реальные данные.
                </p>
              </div>

              <ChartContainer
                config={planConfig}
                className="mx-auto mt-3 h-48 w-full max-w-64"
              >
                <PieChart>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent nameKey="plan" hideLabel />
                    }
                  />
                  <Pie
                    data={planDistribution}
                    dataKey="value"
                    nameKey="plan"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={3}
                    strokeWidth={2}
                  >
                    {planDistribution.map((entry) => (
                      <Cell
                        key={entry.plan}
                        fill={entry.fill}
                        stroke="var(--card)"
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>

              <ul className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                {planDistribution.map((plan) => (
                  <li
                    key={plan.plan}
                    className="flex items-center gap-1.5"
                  >
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: plan.fill }}
                    />
                    {plan.plan}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <section
              aria-labelledby="popular-heading"
              className="rounded-2xl border border-border bg-card p-5 sm:p-6"
            >
              <div className="flex items-center gap-2">
                <Target
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
                <h2 id="popular-heading" className="font-semibold">
                  Популярные задания
                </h2>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Задания с наибольшим числом попыток
              </p>

              {mostAttempted.length > 0 ? (
                <ChartContainer
                  config={exerciseConfig}
                  className="mt-5 h-64 w-full"
                >
                  <BarChart
                    data={mostAttempted.slice(0, 5)}
                    layout="vertical"
                    margin={{ left: 0, right: 12, top: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      horizontal={false}
                      stroke="var(--border)"
                    />
                    <XAxis
                      type="number"
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="title"
                      tickLine={false}
                      axisLine={false}
                      width={120}
                      tick={{ fontSize: 11 }}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          labelKey="title"
                          indicator="dot"
                        />
                      }
                    />
                    <Bar
                      dataKey="submissions"
                      fill="var(--color-submissions)"
                      radius={[0, 5, 5, 0]}
                      barSize={20}
                    />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                  Пока нет статистики по заданиям.
                </div>
              )}
            </section>

            <section
              aria-labelledby="failed-heading"
              className="rounded-2xl border border-border bg-card p-5 sm:p-6"
            >
              <div className="flex items-center gap-2">
                <AlertCircle
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
                <h2 id="failed-heading" className="font-semibold">
                  Задания с частыми ошибками
                </h2>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Больше всего неудачных попыток
              </p>

              <div className="mt-5 space-y-3">
                {mostFailed.length > 0 ? (
                  mostFailed.slice(0, 5).map((exercise, index) => (
                    <div
                      key={exercise.exerciseId}
                      className="flex items-center gap-3 rounded-xl border border-border p-3"
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted font-mono text-xs text-muted-foreground">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {exercise.title}
                        </p>
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {exercise.caseTitle || 'Учебный кейс'}
                          {exercise.difficulty
                            ? ` · ${exercise.difficulty}`
                            : ''}
                        </p>
                      </div>
                      <Badge variant="outline" className="shrink-0">
                        {formatNumber(exercise.submissions)}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                    Пока нет статистики ошибок.
                  </div>
                )}
              </div>
            </section>
          </div>

          <section
            aria-labelledby="content-heading"
            className="mt-6 rounded-2xl border border-border bg-card p-5 sm:p-6"
          >
            <h2 id="content-heading" className="font-semibold">
              Учебный контент и прогресс
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Текущее состояние учебных материалов на платформе
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border border-border p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Database className="size-4" />
                  <span className="text-sm">Учебные кейсы</span>
                </div>
                <p className="mt-3 text-2xl font-semibold">
                  {formatNumber(dashboard?.cases.total)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Опубликовано: {formatNumber(dashboard?.cases.published)}
                </p>
              </div>

              <div className="rounded-xl border border-border p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BookOpen className="size-4" />
                  <span className="text-sm">SQL-задания</span>
                </div>
                <p className="mt-3 text-2xl font-semibold">
                  {formatNumber(dashboard?.exercises.total)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Опубликовано:{' '}
                  {formatNumber(dashboard?.exercises.published)}
                </p>
              </div>

              <div className="rounded-xl border border-border p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="size-4" />
                  <span className="text-sm">Решено заданий</span>
                </div>
                <p className="mt-3 text-2xl font-semibold">
                  {formatNumber(dashboard?.progress.solved)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  В процессе: {formatNumber(dashboard?.progress.inProgress)}
                </p>
              </div>

              <div className="rounded-xl border border-border p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Trophy className="size-4" />
                  <span className="text-sm">Достижения</span>
                </div>
                <p className="mt-3 text-2xl font-semibold">
                  {formatNumber(dashboard?.achievements.total)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Получено: {formatNumber(dashboard?.achievements.unlocked)}
                </p>
              </div>
            </div>
          </section>

          <section
            id="users"
            aria-labelledby="users-heading"
            className="mt-6 scroll-mt-24 rounded-2xl border border-border bg-card p-5 sm:p-6"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 id="users-heading" className="font-semibold">
                  Пользователи
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {usersError
                    ? 'Не удалось получить список из API.'
                    : `Загружено пользователей: ${formatNumber(users.length)}`}
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Поиск по имени или почте"
                    className="h-9 w-full pl-8 sm:w-64"
                    aria-label="Поиск пользователей"
                  />
                </div>

                <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value ?? 'ALL')}>
                  <SelectTrigger
                    className="h-9 w-full sm:w-48"
                    aria-label="Фильтр по роли"
                  >
                    <SelectValue placeholder="Все роли" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Все роли</SelectItem>
                    <SelectItem value="STUDENT">Студенты</SelectItem>
                    <SelectItem value="ADMIN">Администраторы</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {usersError && (
              <div className="mt-4 rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
                {usersError}
                <p className="mt-1 text-xs">
                  Проверь адрес GET /admin/users и формат ответа контроллера.
                </p>
              </div>
            )}

            <div className="mt-4 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Пользователь</TableHead>
                    <TableHead>Роль</TableHead>
                    <TableHead>Дата регистрации</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user, index) => (
                    <TableRow key={user.id || user.email || index}>
                      <TableCell>
                        <p className="font-medium">
                          {getUserName(user)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getRoleBadgeClass(user.role)}
                        >
                          {getRoleLabel(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}

                  {!usersError && filteredUsers.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="py-10 text-center text-sm text-muted-foreground"
                      >
                        {users.length === 0
                          ? 'Пользователи пока не загружены.'
                          : 'По заданным условиям пользователи не найдены.'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </section>
        </>
      )}
    </main>
  )
}

