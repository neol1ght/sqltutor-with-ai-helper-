'use client'

import { useEffect, useState } from 'react'
import { Check, Play, Sparkles } from 'lucide-react'
import { highlightSql } from '@/components/sql/sql-code'
import { cn } from '@/lib/utils'

const QUERY = `SELECT c.name, COUNT(o.id) AS orders
FROM customers c
JOIN orders o ON o.customer_id = c.id
GROUP BY c.name
ORDER BY orders DESC
LIMIT 3;`

const ROWS = [
  ['Анна Смирнова', '42'],
  ['Максим Орлов', '37'],
  ['София Волкова', '31'],
]

type Phase = 'typing' | 'running' | 'result'

export function HeroEditor() {
  const [typed, setTyped] = useState(0)
  const [phase, setPhase] = useState<Phase>('typing')

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTyped(QUERY.length)
      setPhase('result')
      return
    }

    let timeout: ReturnType<typeof setTimeout>
    let index = 0

    const type = () => {
      index += 1
      setTyped(index)
      if (index < QUERY.length) {
        timeout = setTimeout(type, QUERY[index - 1] === '\n' ? 140 : 28)
      } else {
        timeout = setTimeout(() => {
          setPhase('running')
          timeout = setTimeout(() => setPhase('result'), 700)
        }, 300)
      }
    }

    timeout = setTimeout(type, 500)
    return () => clearTimeout(timeout)
  }, [])

  const lines = QUERY.slice(0, typed).split('\n')

  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="absolute -inset-8 -z-10 rounded-[2.5rem] bg-gradient-to-tr from-primary/20 via-ai/15 to-transparent blur-3xl"
      />

      <div className="overflow-hidden rounded-2xl border border-border bg-code shadow-2xl shadow-black/40">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-destructive/70" />
            <span className="size-3 rounded-full bg-warn/70" />
            <span className="size-3 rounded-full bg-primary/70" />
            <span className="ml-3 font-mono text-xs text-muted-foreground">top_customers.sql</span>
          </div>
          <span
            className={cn(
              'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
              phase === 'typing' ? 'bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground',
            )}
          >
            <Play className="size-3" aria-hidden="true" />
            {phase === 'running' ? 'Выполняется…' : 'Запустить'}
          </span>
        </div>

        <pre className="min-h-[196px] overflow-x-auto p-4 text-[13px] leading-6 sm:text-sm" aria-label="Пример SQL-запроса">
          {lines.map((line, i) => (
            <div key={i} className="flex">
              <span className="w-7 shrink-0 select-none text-right font-mono text-muted-foreground/40">{i + 1}</span>
              <span className="pl-4 font-mono">
                {highlightSql(line)}
                {i === lines.length - 1 && phase === 'typing' && (
                  <span className="ml-px inline-block h-4 w-[2px] translate-y-0.5 animate-blink bg-primary" />
                )}
              </span>
            </div>
          ))}
        </pre>

        <div className="border-t border-border bg-card/40">
          <div className="flex items-center justify-between px-4 py-2 text-xs text-muted-foreground">
            <span className="font-mono">Результат</span>
            {phase === 'result' && (
              <span className="flex items-center gap-1 text-primary">
                <Check className="size-3.5" aria-hidden="true" />3 строки · 12 мс
              </span>
            )}
          </div>
          <table className="w-full font-mono text-[13px]">
            <thead>
              <tr className="border-y border-border text-left text-muted-foreground">
                <th className="px-4 py-2 font-medium">name</th>
                <th className="px-4 py-2 text-right font-medium">orders</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map(([name, count], i) => (
                <tr
                  key={name}
                  className={cn(
                    'border-b border-border/60 transition-all duration-500 last:border-0',
                    phase === 'result' ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0',
                  )}
                  style={{ transitionDelay: `${i * 90}ms` }}
                >
                  <td className="px-4 py-2">{name}</td>
                  <td className="px-4 py-2 text-right text-warn">{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div
        className={cn(
          'absolute -bottom-10 -left-4 max-w-[290px] rounded-xl border border-ai/30 bg-popover/95 p-4 shadow-xl backdrop-blur transition-all duration-500 sm:-left-10',
          phase === 'result' ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
        )}
        style={{ transitionDelay: '400ms' }}
      >
        <div className="mb-1.5 flex items-center gap-2 text-xs font-medium text-ai">
          <Sparkles className="size-3.5" aria-hidden="true" />
          AI-помощник
        </div>
        <p className="text-sm leading-relaxed text-foreground/90">
          {'Отличный JOIN! Нужны только постоянные клиенты? Попробуйте добавить '}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs text-ai">{'HAVING COUNT(o.id) > 30'}</code>
        </p>
      </div>
    </div>
  )
}
