import Link from 'next/link'
import { ArrowUpRight, BookOpen, Code2, Database, GraduationCap, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SectionHeading } from './section-heading'

const databases = [
  {
    title: 'Онлайн-магазин',
    level: 'Начальный уровень',
    description:
        'Освойте основы SQL на примере интернет-магазина: товары, категории, покупатели и заказы.',
    href: '/learn/roadmap/online-store',
    icon: Database,
    topics: ['SELECT', 'WHERE', 'ORDER BY', 'JOIN'],
    tone: 'beginner',
    number: '01',
  },
  {
    title: 'Университет',
    level: 'Средний уровень',
    description:
        'Работайте с данными студентов, преподавателей, дисциплин и оценок. Закрепите знания на более сложных запросах.',
    href: '/learn/roadmap/university',
    icon: GraduationCap,
    topics: ['GROUP BY', 'HAVING', 'JOIN', 'Подзапросы'],
    tone: 'intermediate',
    number: '02',
  },
  {
    title: 'База ВК',
    level: 'Сложный уровень',
    description:
        'Исследуйте данные социальной сети: пользователи, друзья, сообщения и сообщества. Решайте задачи повышенной сложности.',
    href: '/learn/roadmap/vk-base',
    icon: Users,
    topics: ['CTE', 'Оконные функции', 'Подзапросы', 'Сложные JOIN'],
    tone: 'advanced',
    number: '03',
  },
]

const toneClasses = {
  beginner: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/25',
    text: 'text-emerald-600 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
  intermediate: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/25',
    text: 'text-blue-600 dark:text-blue-400',
    dot: 'bg-blue-500',
  },
  advanced: {
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/25',
    text: 'text-violet-600 dark:text-violet-400',
    dot: 'bg-violet-500',
  },
}

export function Tracks() {
  return (
      <section
          id="tracks"
          className="scroll-mt-20 border-t border-border/60 py-14 sm:py-20 lg:py-24"
      >
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <SectionHeading
              eyebrow="Практические базы данных"
              title="Три базы — три уровня SQL"
              description="Выберите учебную базу под свой уровень, изучайте темы и переходите к практическим задачам."
          />

          <div className="mt-8 grid grid-cols-1 items-stretch gap-4 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3">
            {databases.map((database) => {
              const tone = toneClasses[database.tone]
              const Icon = database.icon

              return (
                  <article key={database.href} className="min-w-0">
                    <Link
                        href={database.href}
                        className={cn(
                            'group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all sm:p-6',
                            'hover:border-foreground/20 hover:shadow-xl hover:shadow-black/10',
                            'motion-safe:hover:-translate-y-1',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                        )}
                    >
                      <div className="flex items-center justify-between gap-3">
                    <span
                        className={cn(
                            'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
                            tone.bg,
                            tone.border,
                            tone.text,
                        )}
                    >
                      <span className={cn('size-1.5 rounded-full', tone.dot)} />
                      {database.level}
                    </span>

                        <span className="font-mono text-xs text-muted-foreground">
                      {database.number}
                    </span>
                      </div>

                      <div
                          className={cn(
                              'mt-6 flex size-12 items-center justify-center rounded-xl',
                              tone.bg,
                              tone.text,
                          )}
                      >
                        <Icon className="size-6" aria-hidden="true" />
                      </div>

                      <h3 className="mt-5 flex items-start gap-2 text-xl font-semibold tracking-tight">
                        <span className="min-w-0 flex-1">{database.title}</span>
                        <ArrowUpRight
                            className="mt-1 size-4 shrink-0 opacity-60 transition-all sm:opacity-0 sm:group-hover:translate-x-0.5 sm:group-hover:opacity-100"
                            aria-hidden="true"
                        />
                      </h3>

                      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                        {database.description}
                      </p>

                      <div className="mt-5">
                        <p className="mb-2 text-xs font-medium text-muted-foreground">
                          Основные темы
                        </p>

                        <ul className="flex flex-wrap gap-1.5" aria-label="Темы базы">
                          {database.topics.map((topic) => (
                              <li
                                  key={topic}
                                  className="max-w-full rounded-md bg-muted px-2 py-1 text-xs leading-relaxed text-muted-foreground"
                              >
                                {topic}
                              </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-sm">
                        <span className="font-medium">Перейти к обучению</span>
                        <span className="flex items-center gap-1 text-primary">
                      Открыть
                      <ArrowUpRight className="size-4" aria-hidden="true" />
                    </span>
                      </div>
                    </Link>
                  </article>
              )
            })}
          </div>
        </div>
      </section>
  )
}
