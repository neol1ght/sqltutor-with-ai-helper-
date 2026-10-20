import Link from 'next/link'
import { ArrowUpRight, BookOpen, Clock, Code2 } from 'lucide-react'
import { SqlCode } from '@/components/sql/sql-code'
import { courses, lessonCount, plural, toneClasses } from '@/lib/content'
import { cn } from '@/lib/utils'
import { SectionHeading } from './section-heading'

export function Tracks() {
  return (
      <section
          id="tracks"
          className="scroll-mt-20 border-t border-border/60 py-14 sm:py-20 lg:py-24"
      >
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <SectionHeading
              eyebrow="Курсы"
              title="Три курса — от первого SELECT до уровня профи"
              description="Изучайте SQL постепенно: разбирайте теорию, пишите запросы и закрепляйте навыки на практических задачах."
          />

          <div className="mx-auto mt-8 grid w-full max-w-3xl grid-cols-1 gap-3 sm:mt-10 sm:grid-cols-2">
            <div className="flex min-w-0 items-start gap-3 rounded-xl border border-border bg-card/60 p-3 sm:p-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-ai/10 text-ai">
              <BookOpen className="size-4" aria-hidden="true" />
            </span>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Теория с примерами</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Разбирайте SQL-конструкции на понятных примерах и изучайте,
                  как работают запросы.
                </p>
              </div>
            </div>

            <div className="flex min-w-0 items-start gap-3 rounded-xl border border-border bg-card/60 p-3 sm:p-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Code2 className="size-4" aria-hidden="true" />
            </span>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Практика с проверкой</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Решайте задачи в SQL-редакторе, проверяйте результат и
                  обращайтесь за подсказками к AI-помощнику.
                </p>
              </div>
            </div>
          </div>

          <ul className="mt-8 grid grid-cols-1 items-stretch gap-4 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course, i) => {
              const tone = toneClasses[course.tone]
              const total = lessonCount(course)
              const theoryPct = total > 0 ? (course.theory / total) * 100 : 0

              return (
                  <li key={course.slug} className="min-w-0">
                    <Link
                        href="/learn"
                        className={cn(
                            'group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card p-4 transition-all',
                            'hover:border-foreground/20 hover:shadow-xl hover:shadow-black/10',
                            'sm:p-5 lg:p-6',
                            'motion-safe:hover:-translate-y-1',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                        )}
                    >
                      <div className="flex min-w-0 items-center justify-between gap-2">
                    <span
                        className={cn(
                            'inline-flex min-w-0 max-w-[75%] items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
                            tone.bg,
                            tone.border,
                            tone.text,
                        )}
                    >
                      <span
                          className={cn('size-1.5 shrink-0 rounded-full', tone.dot)}
                      />
                      <span className="break-words">{course.level}</span>
                    </span>

                        <span className="shrink-0 font-mono text-[11px] text-muted-foreground sm:text-xs">
                      Курс {String(i + 1).padStart(2, '0')}
                    </span>
                      </div>

                      <h3 className="mt-5 flex min-w-0 items-start gap-2 text-lg font-semibold leading-snug tracking-tight [overflow-wrap:anywhere] sm:text-xl">
                        <span className="min-w-0 flex-1">{course.title}</span>
                        <ArrowUpRight
                            className="mt-1 size-4 shrink-0 opacity-60 transition-all sm:opacity-0 sm:group-hover:translate-x-0.5 sm:group-hover:opacity-100"
                            aria-hidden="true"
                        />
                      </h3>

                      <p className="mt-2 min-w-0 text-sm leading-relaxed text-muted-foreground [overflow-wrap:anywhere]">
                        {course.description}
                      </p>

                      <div className="mt-5 min-w-0 max-w-full overflow-hidden rounded-lg border border-border bg-code px-3 py-2">
                        <div className="max-w-full overflow-x-auto text-xs">
                          <SqlCode code={course.snippet} />
                        </div>
                      </div>

                      <ul
                          className="mt-4 flex min-w-0 flex-wrap gap-1.5"
                          aria-label="Темы курса"
                      >
                        {course.topics.map((topic) => (
                            <li
                                key={topic}
                                className="max-w-full rounded-md bg-muted px-2 py-1 font-mono text-[11px] leading-relaxed text-muted-foreground [overflow-wrap:anywhere] sm:text-xs"
                            >
                              {topic}
                            </li>
                        ))}
                      </ul>

                      <div className="mt-auto min-w-0 pt-5 sm:pt-6">
                        <div className="min-w-0 rounded-xl border border-border bg-background/40 p-3 sm:p-4">
                          <div className="flex min-w-0 items-center justify-between gap-2 text-xs">
                        <span className="min-w-0 font-medium">
                          {total} {plural(total, ['урок', 'урока', 'уроков'])}
                        </span>

                            <span className="flex shrink-0 items-center gap-1.5 text-muted-foreground">
                          <Clock className="size-3.5" aria-hidden="true" />
                          ~{course.hours} ч
                        </span>
                          </div>

                          <div
                              className="mt-3 flex h-1.5 w-full gap-1 overflow-hidden rounded-full"
                              aria-hidden="true"
                          >
                            <div
                                className="rounded-full bg-ai"
                                style={{
                                  width: `${Math.min(100, Math.max(0, theoryPct))}%`,
                                }}
                            />
                            <div className="min-w-0 flex-1 rounded-full bg-primary" />
                          </div>

                          <dl className="mt-3 grid grid-cols-2 gap-x-2 gap-y-3 text-xs">
                            <div className="flex min-w-0 items-center gap-1.5">
                              <BookOpen
                                  className="size-3.5 shrink-0 text-ai"
                                  aria-hidden="true"
                              />
                              <dt className="min-w-0 truncate text-muted-foreground">
                                Теория
                              </dt>
                              <dd className="ml-auto shrink-0 font-mono">
                                {course.theory}
                              </dd>
                            </div>

                            <div className="flex min-w-0 items-center gap-1.5">
                              <Code2
                                  className="size-3.5 shrink-0 text-primary"
                                  aria-hidden="true"
                              />
                              <dt className="min-w-0 truncate text-muted-foreground">
                                Практика
                              </dt>
                              <dd className="ml-auto shrink-0 font-mono">
                                {course.practice}
                              </dd>
                            </div>
                          </dl>
                        </div>
                      </div>
                    </Link>
                  </li>
              )
            })}
          </ul>
        </div>
      </section>
  )
}