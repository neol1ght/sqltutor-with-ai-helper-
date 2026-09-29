


'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Code2, Play, RotateCcw, Table2 } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { LESSON, runLessonQuery, type RunResult } from '@/lib/lesson-engine'
import { AiHelper } from './ai-helper'
import { ResultsPanel } from './results-panel'
import { SqlEditor } from './sql-editor'

export function LessonWorkspace() {
    const [query, setQuery] = useState(LESSON.starter)
    const [result, setResult] = useState<RunResult | null>(null)
    const [running, setRunning] = useState(false)

    function run() {
        if (running) return
        setRunning(true)
        setTimeout(() => {
            setResult(runLessonQuery(query))
            setRunning(false)
        }, 450)
    }

    const solved = result?.status === 'correct'
    const progress = Math.round((LESSON.number / LESSON.total) * 100)

    return (
        <div className="flex flex-1 flex-col lg:h-dvh lg:overflow-hidden">
            <div className="flex items-center gap-4 border-b border-border px-4 py-3 sm:px-6">
                <Link href="/learn" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="size-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Главная</span>
                </Link>
                <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-xs text-muted-foreground">
                        {`${LESSON.course} · урок ${LESSON.number}/${LESSON.total}`}
                    </p>
                    <div
                        className="mt-1.5 h-1 max-w-xs overflow-hidden rounded-full bg-muted"
                        role="progressbar"
                        aria-label="Прогресс курса"
                        aria-valuenow={progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                    >
                        <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
                    </div>
                </div>
                <span className="hidden rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 font-mono text-xs text-primary sm:inline">
          +40 XP
        </span>
            </div>

            <div className="grid min-h-0 flex-1 lg:grid-cols-[320px_1fr_340px]">
                <aside className="overflow-y-auto border-b border-border p-6 lg:border-b-0 lg:border-r">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
            <Code2 className="size-3" aria-hidden="true" />
              {`${LESSON.kind}`}
          </span>
                    <h1 className="mt-3 text-xl font-semibold tracking-tight">{LESSON.title}</h1>
                    <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                        <p>
                            <code className="font-mono text-ai">GROUP BY</code> объединяет строки в группы. Чтобы отфильтровать группы
                            по агрегату (например, по среднему), <code className="font-mono text-ai">WHERE</code> не подойдёт — он
                            выполняется до группировки.
                        </p>
                        <p>
                            Для этого существует <code className="font-mono text-ai">HAVING</code>: он фильтрует группы уже после
                            агрегации.
                        </p>
                    </div>

                    <div className="mt-6 rounded-xl border border-primary/25 bg-primary/5 p-4">
                        <h2 className="font-mono text-xs uppercase tracking-wider text-primary">Задание</h2>
                        <p className="mt-2 text-sm leading-relaxed">
                            Выведите каждую <strong>категорию</strong>, у которой средняя цена <strong>больше 50</strong>, со
                            средним значением в столбце <code className="font-mono text-xs">avg_price</code>. Отсортируйте по
                            убыванию.
                        </p>
                    </div>

                    {LESSON.schema.map((t) => (
                        <div key={t.table} className="mt-6">
                            <h2 className="flex items-center gap-2 text-sm font-medium">
                                <Table2 className="size-4 text-muted-foreground" aria-hidden="true" />
                                <span className="font-mono">{t.table}</span>
                            </h2>
                            <ul className="mt-2 divide-y divide-border rounded-lg border border-border font-mono text-xs">
                                {t.columns.map((c) => (
                                    <li key={c.name} className="flex justify-between px-3 py-1.5">
                                        <span>{c.name}</span>
                                        <span className="text-muted-foreground">{c.type}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </aside>

                <div className="flex min-h-[520px] min-w-0 flex-col lg:min-h-0">
                    <div className="flex items-center justify-between gap-2 border-b border-border bg-code px-4 py-2">
                        <span className="font-mono text-xs text-muted-foreground">solution.sql</span>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setQuery(LESSON.starter)
                                    setResult(null)
                                }}
                            >
                                <RotateCcw data-icon="inline-start" aria-hidden="true" />
                                Сбросить
                            </Button>
                            <Button size="sm" onClick={run} disabled={running}>
                                <Play data-icon="inline-start" aria-hidden="true" />
                                {running ? 'Выполняется…' : 'Запустить'}
                            </Button>
                        </div>
                    </div>

                    <SqlEditor value={query} onChange={setQuery} onRun={run} />

                    <div className="flex max-h-[45%] min-h-56 flex-col">
                        <ResultsPanel result={result} running={running} />
                    </div>

                    {solved && (
                        <div className="flex items-center justify-between gap-4 border-t border-primary/30 bg-primary/10 px-4 py-3">
                            <p className="text-sm font-medium">{'Урок пройден · +40 XP'}</p>
                            <Link href="/learn" className={buttonVariants({ size: 'sm' })}>
                                Следующий урок
                                <ArrowRight data-icon="inline-end" aria-hidden="true" />
                            </Link>
                        </div>
                    )}
                </div>

                <aside className="flex min-h-[480px] flex-col border-t border-border bg-card/30 lg:min-h-0 lg:border-l lg:border-t-0">
                    <AiHelper lastResult={result} />
                </aside>
            </div>
        </div>
    )
}

