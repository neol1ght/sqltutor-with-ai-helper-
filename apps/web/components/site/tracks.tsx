import Link from 'next/link'
import { ArrowUpRight, BookOpen, Clock, Code2 } from 'lucide-react'
import { SqlCode } from '@/components/sql/sql-code'
import { courses, lessonCount, plural, toneClasses } from '@/lib/content'
import { cn } from '@/lib/utils'
import { SectionHeading } from './section-heading'

export function Tracks() {
  return (
    <section id="tracks" className="scroll-mt-20 border-t border-border/60 py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Курсы"
          title="Три курса — от первого SELECT до уровня профи"
          description="Каждый курс состоит из теоретических и практических уроков. Сначала коротко разбираете концепцию, затем сразу закрепляете её на реальных задачах."
        />

        <div className="mx-auto mt-10 grid max-w-3xl gap-3 sm:grid-cols-2">
          <div className="flex gap-3 rounded-xl border border-border bg-card/60 p-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-ai/10 text-ai">
              <BookOpen className="size-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-medium">Теоретические уроки</p>
              <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                Короткие объяснения с интерактивными примерами, которые можно менять и запускать.
              </p>
            </div>
          </div>
          <div className="flex gap-3 rounded-xl border border-border bg-card/60 p-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Code2 className="size-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-medium">Практические уроки</p>
              <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                Задачи в живом редакторе с автопроверкой и подсказками AI-помощника.
              </p>
            </div>
          </div>
        </div>

        <ul className="mt-12 grid gap-4 lg:grid-cols-3">
          {courses.map((course, i) => {
            const tone = toneClasses[course.tone]
            const total = lessonCount(course)
            const theoryPct = (course.theory / total) * 100
            return (
              <li key={course.slug}>
                <Link
                  href="/learn"
                  className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-foreground/20 hover:shadow-xl hover:shadow-black/30"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                        tone.bg,
                        tone.border,
                        tone.text,
                      )}
                    >
                      <span className={cn('size-1.5 rounded-full', tone.dot)} />
                      {course.level}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {`Курс ${String(i + 1).padStart(2, '0')}`}
                    </span>
                  </div>

                  <h3 className="mt-5 flex items-center gap-2 text-xl font-semibold">
                    {course.title}
                    <ArrowUpRight
                      className="size-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
                      aria-hidden="true"
                    />
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{course.description}</p>

                  <div className="mt-5 truncate rounded-lg border border-border bg-code px-3 py-2 text-xs">
                    <SqlCode code={course.snippet} />
                  </div>

                  <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Темы курса">
                    {course.topics.map((t) => (
                      <li key={t} className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
                        {t}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-6">
                    <div className="rounded-xl border border-border bg-background/40 p-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">{`${total} ${plural(total, ['урок', 'урока', 'уроков'])}`}</span>
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="size-3.5" aria-hidden="true" />
                          {`~${course.hours} ч`}
                        </span>
                      </div>
                      <div className="mt-3 flex h-1.5 gap-1 overflow-hidden rounded-full" aria-hidden="true">
                        <div className="rounded-full bg-ai" style={{ width: `${theoryPct}%` }} />
                        <div className="flex-1 rounded-full bg-primary" />
                      </div>
                      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="size-3.5 text-ai" aria-hidden="true" />
                          <dt className="text-muted-foreground">Теория</dt>
                          <dd className="ml-auto font-mono">{course.theory}</dd>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Code2 className="size-3.5 text-primary" aria-hidden="true" />
                          <dt className="text-muted-foreground">Практика</dt>
                          <dd className="ml-auto font-mono">{course.practice}</dd>
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
