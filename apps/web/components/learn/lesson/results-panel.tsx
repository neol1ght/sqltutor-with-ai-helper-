


import { AlertTriangle, CheckCircle2, CircleDashed, XCircle } from 'lucide-react'
import type { RunResult } from '@/lib/lesson-engine'
import { cn } from '@/lib/utils'

export function ResultsPanel({ result, running }: { result: RunResult | null; running: boolean }) {
    return (
        <section aria-labelledby="results-heading" aria-live="polite" className="flex min-h-0 flex-col border-t border-border bg-card/40">
            <div className="flex items-center justify-between border-b border-border px-4 py-2">
                <h2 id="results-heading" className="font-mono text-xs text-muted-foreground">
                    Результат
                </h2>
                {result && result.status !== 'error' && !running && (
                    <span className="font-mono text-xs text-muted-foreground">{`строк: ${result.rows.length} · ${result.ms} мс`}</span>
                )}
            </div>

            <div className="min-h-0 flex-1 overflow-auto">
                {running ? (
                    <div className="flex h-full min-h-40 items-center justify-center gap-2 text-sm text-muted-foreground">
                        <CircleDashed className="size-4 animate-spin" aria-hidden="true" />
                        Выполняем запрос…
                    </div>
                ) : !result ? (
                    <div className="flex h-full min-h-40 flex-col items-center justify-center gap-1 px-6 text-center text-sm text-muted-foreground">
                        <p>Запустите запрос, чтобы увидеть результат.</p>
                        <p className="font-mono text-xs">
                            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5">Ctrl</kbd>
                            {' + '}
                            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5">Enter</kbd>
                        </p>
                    </div>
                ) : result.status === 'error' ? (
                    <div className="m-4 flex gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4">
                        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
                        <div>
                            <p className="text-sm font-medium text-destructive">Ошибка выполнения</p>
                            <p className="mt-1 font-mono text-xs text-foreground/80">{`ОШИБКА: ${result.message}`}</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div
                            className={cn(
                                'mx-4 mt-4 flex items-start gap-2.5 rounded-lg border p-3 text-sm',
                                result.status === 'correct'
                                    ? 'border-primary/30 bg-primary/10 text-foreground'
                                    : 'border-warn/30 bg-warn/10 text-foreground',
                            )}
                        >
                            {result.status === 'correct' ? (
                                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                            ) : (
                                <XCircle className="mt-0.5 size-4 shrink-0 text-warn" aria-hidden="true" />
                            )}
                            <p>{result.feedback}</p>
                        </div>
                        <div className="p-4">
                            <table className="w-full overflow-hidden rounded-lg border border-border font-mono text-xs">
                                <thead className="bg-muted/60 text-left text-muted-foreground">
                                <tr>
                                    {result.columns.map((c) => (
                                        <th key={c} scope="col" className="px-3 py-2 font-medium">
                                            {c}
                                        </th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {result.rows.map((row, i) => (
                                    <tr key={i} className="border-t border-border">
                                        {row.map((cell, j) => (
                                            <td key={j} className={cn('px-3 py-2', typeof cell === 'number' && 'text-warn')}>
                                                {typeof cell === 'number' && result.columns[j].includes('price') ? cell.toFixed(2) : cell}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </section>
    )
}

