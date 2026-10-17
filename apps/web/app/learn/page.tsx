'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Code2,
  Flame,
  Sparkles,
  Target,
  Trophy,
  Zap,
  Lock,
} from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { SqlCode } from '@/components/sql/sql-code'
import { cn } from '@/lib/utils'

import {
  getDashboard,
  type DashboardData,
} from '@/lib/api/dashboard'

const API_URL =
    process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3500/api'

type LearningCase = {
  id: string
  title: string
  slug: string
  description: string
  difficulty: string
  databaseName: string
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

const CASE_STYLES = [
  {
    bg: 'bg-primary/10',
    text: 'text-primary',
    dot: 'bg-primary',
  },
  {
    bg: 'bg-ai/10',
    text: 'text-ai',
    dot: 'bg-ai',
  },
]

const CHALLENGES = [
  {
    title: 'Вторая по величине зарплата',
    level: 'Средне',
    xp: 60,
    minutes: 8,
  },
  {
    title: 'Клиенты без заказов',
    level: 'Легко',
    xp: 30,
    minutes: 5,
  },
  {
    title: 'Рост выручки по месяцам',
    level: 'Сложно',
    xp: 100,
    minutes: 15,
  },
]

function getDifficultyLabel(difficulty: string) {
  const normalized = difficulty.toLowerCase()

  if (
      normalized.includes('beginner') ||
      normalized.includes('easy') ||
      normalized.includes('нач')
  ) {
    return 'Начальный'
  }

  if (
      normalized.includes('advanced') ||
      normalized.includes('hard') ||
      normalized.includes('слож')
  ) {
    return 'Продвинутый'
  }

  return 'Средний'
}

function getCaseDescription(
    learningCase: LearningCase,
    index: number,
) {
  if (learningCase.description?.trim()) {
    return learningCase.description
  }

  if (index === 0) {
    return 'Практика SQL на данных интернет-магазина: товары, категории, клиенты и заказы.'
  }

  return 'Практика SQL на данных университета: студенты, преподаватели, группы и учебные дисциплины.'
}

export default function DashboardPage() {
  const [cases, setCases] = useState<LearningCase[]>([])
  const [isCasesLoading, setIsCasesLoading] = useState(true)

  const [dashboard, setDashboard] =
      useState<DashboardData | null>(null)

  const [isDashboardLoading, setIsDashboardLoading] =
      useState(true)

  const [dashboardError, setDashboardError] =
      useState<string | null>(null)

  // ----------------------------------------
  // LOAD LEARNING CASES
  // ----------------------------------------

  useEffect(() => {
    let cancelled = false

    async function loadCases() {
      try {
        const response = await fetch(`${API_URL}/cases`, {
          method: 'GET',
          cache: 'no-store',
        })

        if (!response.ok) {
          throw new Error('Не удалось загрузить учебные базы')
        }

        const data = await response.json()

        if (!cancelled) {
          setCases(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        console.error(
            'Failed to load learning cases:',
            error,
        )

        if (!cancelled) {
          setCases([])
        }
      } finally {
        if (!cancelled) {
          setIsCasesLoading(false)
        }
      }
    }

    void loadCases()

    return () => {
      cancelled = true
    }
  }, [])

  // ----------------------------------------
  // LOAD USER DASHBOARD
  // ----------------------------------------

  useEffect(() => {
    let cancelled = false

    async function loadDashboard() {
      const accessToken = localStorage.getItem(
          'sqltutor_access_token',
      )

      if (!accessToken) {
        if (!cancelled) {
          setDashboardError(
              'Необходимо войти в аккаунт',
          )
          setIsDashboardLoading(false)
        }

        return
      }

      try {
        if (!cancelled) {
          setDashboardError(null)
        }

        const data = await getDashboard(accessToken)

        if (!cancelled) {
          setDashboard(data)
        }
      } catch (error) {
        console.error(
            'Failed to load dashboard:',
            error,
        )

        if (!cancelled) {
          setDashboardError(
              error instanceof Error
                  ? error.message
                  : 'Не удалось загрузить статистику',
          )
        }
      } finally {
        if (!cancelled) {
          setIsDashboardLoading(false)
        }
      }
    }

    void loadDashboard()

    return () => {
      cancelled = true
    }
  }, [])

  // ----------------------------------------
  // DASHBOARD DATA
  // ----------------------------------------

  const stats = dashboard?.stats

  const weeklyXp = dashboard?.weeklyXp ?? []

  const maxXp = Math.max(
      ...weeklyXp.map((item) => item.xp),
      1,
  )

  const weeklyTotalXp = weeklyXp.reduce(
      (total, item) => total + item.xp,
      0,
  )

  const bestDay = weeklyXp.reduce(
      (best, current) =>
          current.xp > best.xp ? current : best,
      weeklyXp[0] ?? {
        date: '',
        day: '',
        xp: 0,
      },
  )

  // ----------------------------------------
  // RENDER
  // ----------------------------------------

  return (
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-8 lg:py-10">
        {/* HEADER */}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-sm text-muted-foreground">
              {'-- понедельник, 28 сентября'}
            </p>

            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
              С возвращением
            </h1>
          </div>

          <p className="text-sm text-muted-foreground">
            {'Продолжайте практиковаться и развивайте '}
            <span className="font-medium text-primary">
            свой SQL-навык
          </span>
            .
          </p>
        </div>

        {/* STATS */}

        <ul className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {/* STREAK */}

          <li className="rounded-xl border border-border bg-card p-4">
          <span className="flex size-8 items-center justify-center rounded-lg bg-warn/10 text-warn">
            <Flame
                className="size-4"
                aria-hidden="true"
            />
          </span>

            <p className="mt-4 text-2xl font-semibold tracking-tight">
              {isDashboardLoading ? (
                  <span className="inline-block h-7 w-12 animate-pulse rounded bg-muted" />
              ) : (
                  stats?.streakDays ?? 0
              )}
            </p>

            <p className="text-sm text-muted-foreground">
              Дней подряд
            </p>
          </li>

          {/* XP */}

          <li className="rounded-xl border border-border bg-card p-4">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Zap
                className="size-4"
                aria-hidden="true"
            />
          </span>

            <p className="mt-4 text-2xl font-semibold tracking-tight">
              {isDashboardLoading ? (
                  <span className="inline-block h-7 w-20 animate-pulse rounded bg-muted" />
              ) : (
                  (stats?.totalXp ?? 0).toLocaleString(
                      'ru-RU',
                  )
              )}
            </p>

            <p className="text-sm text-muted-foreground">
              Всего XP
            </p>
          </li>

          {/* SOLVED */}

          <li className="rounded-xl border border-border bg-card p-4">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <CheckCircle2
                className="size-4"
                aria-hidden="true"
            />
          </span>

            <p className="mt-4 text-2xl font-semibold tracking-tight">
              {isDashboardLoading ? (
                  <span className="inline-block h-7 w-12 animate-pulse rounded bg-muted" />
              ) : (
                  stats?.solvedExercises ?? 0
              )}
            </p>

            <p className="text-sm text-muted-foreground">
              Уроков пройдено
            </p>
          </li>

          {/* ACCURACY */}

          <li className="rounded-xl border border-border bg-card p-4">
          <span className="flex size-8 items-center justify-center rounded-lg bg-ai/10 text-ai">
            <Target
                className="size-4"
                aria-hidden="true"
            />
          </span>

            <p className="mt-4 text-2xl font-semibold tracking-tight">
              {isDashboardLoading ? (
                  <span className="inline-block h-7 w-14 animate-pulse rounded bg-muted" />
              ) : (
                  `${stats?.accuracy ?? 0}%`
              )}
            </p>

            <p className="text-sm text-muted-foreground">
              Точность
            </p>
          </li>
        </ul>

        {/* DASHBOARD ERROR */}

        {dashboardError && (
            <div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {dashboardError}
            </div>
        )}

        {/* TODAY / YESTERDAY XP */}

        {!isDashboardLoading && dashboard && (
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <span>
            Сегодня:{' '}
            <strong className="font-medium text-foreground">
              {stats?.todayXp ?? 0} XP
            </strong>
          </span>

              <span>
            Вчера:{' '}
                <strong className="font-medium text-foreground">
              {stats?.yesterdayXp ?? 0} XP
            </strong>
          </span>

              <span>
            Попыток:{' '}
                <strong className="font-medium text-foreground">
              {stats?.totalAttempts ?? 0}
            </strong>
          </span>
            </div>
        )}

        {/* CONTINUE + ACTIVITY */}

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* CONTINUE */}

          <section
              aria-labelledby="continue-heading"
              className="relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 via-card to-card p-6 lg:col-span-2"
          >
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-mono text-xs text-primary">
                {'Соединения и агрегация · урок 15 из 30'}
              </p>

              <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary">
              <Code2
                  className="size-3"
                  aria-hidden="true"
              />
              Практика
            </span>
            </div>

            <h2
                id="continue-heading"
                className="mt-2 text-2xl font-semibold tracking-tight"
            >
              Фильтрация групп с HAVING
            </h2>

            <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
              Узнайте, почему WHERE не умеет фильтровать агрегаты и как HAVING помогает оставить только нужные группы.
            </p>

            <div className="mt-5 rounded-lg border border-border bg-code px-4 py-3 text-sm">
              <SqlCode code="SELECT category, AVG(price) FROM products GROUP BY category HAVING AVG(price) > 50;" />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Link
                  href="/learn/lesson"
                  className={buttonVariants({
                    size: 'lg',
                    className: 'h-10 px-4',
                  })}
              >
                Продолжить урок

                <ArrowRight
                    data-icon="inline-end"
                    aria-hidden="true"
                />
              </Link>

              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock
                  className="size-4"
                  aria-hidden="true"
              />
              осталось ~8 мин
            </span>
            </div>
          </section>

          {/* ACTIVITY */}

          <section
              aria-labelledby="activity-heading"
              className="rounded-2xl border border-border bg-card p-6"
          >
            <div className="flex items-center justify-between">
              <h2
                  id="activity-heading"
                  className="font-semibold"
              >
                Эта неделя
              </h2>

              {isDashboardLoading ? (
                  <span className="h-4 w-16 animate-pulse rounded bg-muted" />
              ) : (
                  <span className="font-mono text-xs text-muted-foreground">
                {weeklyTotalXp.toLocaleString('ru-RU')} XP
              </span>
              )}
            </div>

            <div
                className="mt-6 flex h-36 items-end justify-between gap-2"
                role="img"
                aria-label="XP, заработанные за последние семь дней"
            >
              {isDashboardLoading ? (
                  Array.from({ length: 7 }).map(
                      (_, index) => (
                          <div
                              key={index}
                              className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                          >
                            <div
                                className="w-full animate-pulse rounded-md bg-muted"
                                style={{
                                  height: `${25 + index * 8}%`,
                                }}
                            />

                            <span className="h-3 w-5 animate-pulse rounded bg-muted" />
                          </div>
                      ),
                  )
              ) : (
                  weeklyXp.map((item, index) => (
                      <div
                          key={item.date}
                          className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                      >
                        <div
                            title={`${item.day}: ${item.xp} XP`}
                            className={cn(
                                'w-full rounded-md transition-all',
                                index === weeklyXp.length - 1
                                    ? 'bg-primary'
                                    : 'bg-primary/25',
                            )}
                            style={{
                              height:
                                  item.xp === 0
                                      ? '4px'
                                      : `${Math.max(
                                          (item.xp / maxXp) * 100,
                                          6,
                                      )}%`,
                            }}
                        />

                        <span className="text-xs text-muted-foreground">
                    {item.day}
                  </span>
                      </div>
                  ))
              )}
            </div>

            {!isDashboardLoading && (
                <p className="mt-4 text-xs text-muted-foreground">
                  {bestDay.xp > 0
                      ? `Лучший день: ${bestDay.day} · ${bestDay.xp} XP`
                      : 'Пока нет заработанного XP за последние 7 дней'}
                </p>
            )}
          </section>
        </div>

        {/* COURSES */}

        <section
            id="courses"
            aria-labelledby="courses-heading"
            className="mt-6 scroll-mt-24 rounded-2xl border border-border bg-card p-6"
        >
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2
                  id="courses-heading"
                  className="font-semibold"
              >
                Учебные базы
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Выберите базу данных и начинайте практиковаться.
              </p>
            </div>

            <span className="font-mono text-xs text-muted-foreground">
            {cases.length} доступно
          </span>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {/* REAL CASES */}

            {isCasesLoading ? (
                <>
                  {[0, 1].map((item) => (
                      <div
                          key={item}
                          className="animate-pulse rounded-xl border border-border p-5"
                      >
                        <div className="h-10 w-10 rounded-lg bg-muted" />

                        <div className="mt-5 h-5 w-2/3 rounded bg-muted" />

                        <div className="mt-3 h-10 w-full rounded bg-muted" />

                        <div className="mt-6 h-1.5 w-full rounded-full bg-muted" />
                      </div>
                  ))}
                </>
            ) : (
                cases.map((learningCase, index) => {
                  const style =
                      CASE_STYLES[index % CASE_STYLES.length]

                  const difficulty =
                      getDifficultyLabel(
                          learningCase.difficulty,
                      )

                  const description =
                      getCaseDescription(
                          learningCase,
                          index,
                      )

                  return (
                      <Link
                          key={learningCase.id}
                          href={`/learn/roadmap/${learningCase.slug}`}
                          className="group flex h-full flex-col rounded-xl border border-border bg-background p-5 transition-colors hover:border-foreground/20"
                      >
                        <div className="flex items-start justify-between gap-3">
                    <span
                        className={cn(
                            'flex size-10 shrink-0 items-center justify-center rounded-lg',
                            style.bg,
                            style.text,
                        )}
                    >
                      <BookOpen
                          className="size-4"
                          aria-hidden="true"
                      />
                    </span>

                          <span
                              className={cn(
                                  'rounded-md px-2 py-1 text-xs font-medium',
                                  style.bg,
                                  style.text,
                              )}
                          >
                      {difficulty}
                    </span>
                        </div>

                        <h3 className="mt-5 text-lg font-semibold tracking-tight">
                          {learningCase.title}
                        </h3>

                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {description}
                        </p>

                        <div className="mt-auto pt-6">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Code2
                            className="size-3.5"
                            aria-hidden="true"
                        />
                        SQL практика
                      </span>

                            <span className="font-mono">
                        {learningCase.databaseName}
                      </span>
                          </div>

                          <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-sm">
                      <span className="font-medium">
                        Открыть базу
                      </span>

                            <ArrowRight
                                className="size-4 transition-transform group-hover:translate-x-0.5"
                                aria-hidden="true"
                            />
                          </div>
                        </div>
                      </Link>
                  )
                })
            )}

            {/* PRO PLACEHOLDER */}

            <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-dashed border-ai/30 bg-ai/5 p-5">
              <div className="flex items-start justify-between gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-ai/10 text-ai">
                <Lock
                    className="size-4"
                    aria-hidden="true"
                />
              </span>

                <span className="rounded-md bg-ai/10 px-2 py-1 text-xs font-medium text-ai">
                Pro
              </span>
              </div>

              <h3 className="mt-5 text-lg font-semibold tracking-tight">
                SQL Pro
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Продвинутые задачи, сложные запросы и реальные сценарии для уверенного владения SQL.
              </p>

              <div className="mt-auto pt-6">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Sparkles
                      className="size-3.5 text-ai"
                      aria-hidden="true"
                  />
                  Скоро будет доступно
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-ai/15 pt-4 text-sm">
                <span className="font-medium text-ai">
                  В разработке
                </span>

                  <Lock
                      className="size-4 text-muted-foreground"
                      aria-hidden="true"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AI */}

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <section
              aria-labelledby="ai-heading"
              className="rounded-2xl border border-ai/25 bg-gradient-to-b from-ai/10 to-card p-6 lg:col-span-1"
          >
            <h2
                id="ai-heading"
                className="flex items-center gap-2 font-semibold"
            >
              <Sparkles
                  className="size-4 text-ai"
                  aria-hidden="true"
              />
              Совет AI-помощника
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-foreground/90">
              {'Вы часто путаете '}

              <code className="rounded bg-muted px-1 font-mono text-xs text-ai">
                WHERE
              </code>

              {' и '}

              <code className="rounded bg-muted px-1 font-mono text-xs text-ai">
                HAVING
              </code>

              {
                '. Я добавил 3 коротких упражнения в следующее занятие, чтобы закрепить тему.'
              }
            </p>

            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-ai">•</span>
                Сильные стороны: LEFT JOIN, DISTINCT
              </li>

              <li className="flex gap-2">
                <span className="text-ai">•</span>
                Потренировать: HAVING, COUNT(*) и COUNT(col)
              </li>
            </ul>

            <Link
                href="/learn/lesson"
                className={buttonVariants({
                  variant: 'outline',
                  className: 'mt-6 w-full',
                })}
            >
              Начать упражнения
            </Link>
          </section>
        </div>

        {/* CHALLENGES */}

        <section
            id="challenges"
            aria-labelledby="challenges-heading"
            className="mt-6 scroll-mt-24"
        >
          <h2
              id="challenges-heading"
              className="flex items-center gap-2 font-semibold"
          >
            <Trophy
                className="size-4 text-warn"
                aria-hidden="true"
            />
            Рекомендуемые задачи
          </h2>

          <ul className="mt-4 grid gap-3 md:grid-cols-3">
            {CHALLENGES.map((challenge) => (
                <li key={challenge.title}>
                  <Link
                      href="/learn/lesson"
                      className="group flex h-full flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-foreground/20"
                  >
                <span
                    className={cn(
                        'w-fit rounded-md px-2 py-0.5 text-xs font-medium',
                        challenge.level === 'Легко' &&
                        'bg-primary/10 text-primary',
                        challenge.level === 'Средне' &&
                        'bg-ai/10 text-ai',
                        challenge.level === 'Сложно' &&
                        'bg-warn/10 text-warn',
                    )}
                >
                  {challenge.level}
                </span>

                    <p className="mt-3 font-medium">
                      {challenge.title}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-4 text-xs text-muted-foreground">
                  <span>
                    {`+${challenge.xp} XP · ${challenge.minutes} мин`}
                  </span>

                      <ArrowRight
                          className="size-4 transition-transform group-hover:translate-x-0.5"
                          aria-hidden="true"
                      />
                    </div>
                  </Link>
                </li>
            ))}
          </ul>
        </section>
      </main>
  )
}
