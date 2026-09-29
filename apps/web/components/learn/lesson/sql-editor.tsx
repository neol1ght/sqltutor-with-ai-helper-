


'use client'

import { highlightSql } from '@/components/sql/sql-code'

export function SqlEditor({
                              value,
                              onChange,
                              onRun,
                          }: {
    value: string
    onChange: (v: string) => void
    onRun: () => void
}) {
    const lineCount = value.split('\n').length

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault()
            onRun()
            return
        }
        if (e.key === 'Tab') {
            e.preventDefault()
            const el = e.currentTarget
            const { selectionStart, selectionEnd } = el
            const next = value.slice(0, selectionStart) + '  ' + value.slice(selectionEnd)
            onChange(next)
            requestAnimationFrame(() => {
                el.selectionStart = el.selectionEnd = selectionStart + 2
            })
        }
    }

    return (
        <div className="flex min-h-0 flex-1 overflow-auto bg-code font-mono text-sm leading-6">
            <div aria-hidden="true" className="select-none py-4 pl-4 pr-3 text-right text-muted-foreground/40">
                {Array.from({ length: lineCount }, (_, i) => (
                    <div key={i}>{i + 1}</div>
                ))}
            </div>
            <div className="relative grid min-w-0 flex-1 py-4 pr-4">
        <pre
            aria-hidden="true"
            className="pointer-events-none col-start-1 row-start-1 whitespace-pre text-foreground/90"
        >
          {highlightSql(value)}
            {'\n'}
        </pre>
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    spellCheck={false}
                    autoCapitalize="off"
                    autoCorrect="off"
                    aria-label="Редактор SQL-запроса"
                    className="col-start-1 row-start-1 resize-none overflow-hidden whitespace-pre bg-transparent text-transparent caret-primary outline-none selection:bg-primary/25"
                    wrap="off"
                />
            </div>
        </div>
    )
}

