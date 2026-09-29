


'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowUp, Sparkles } from 'lucide-react'
import type { RunResult } from '@/lib/lesson-engine'
import { cn } from '@/lib/utils'

type Message = { id: number; role: 'user' | 'assistant'; text: string }

const QUICK_PROMPTS = ['Дай подсказку', 'Объясни результат', 'WHERE или HAVING?', 'Покажи решение']

function mockReply(prompt: string, result: RunResult | null): string {
  const p = prompt.toLowerCase()
  if (p.includes('решени'))
    return 'Конечно, но сначала попробуйте ещё раз! Если уверены: добавьте HAVING AVG(price) > 50 после GROUP BY, а затем ORDER BY avg_price DESC.'
  if (p.includes('where') || p.includes('having'))
    return 'WHERE фильтрует отдельные строки до группировки. HAVING фильтрует группы уже после агрегации — поэтому AVG() работает в HAVING, но не в WHERE.'
  if (p.includes('результат') || p.includes('ошибк') || p.includes('неправ')) {
    if (!result) return 'Сначала запустите запрос, и я разберу с вами результат.'
    if (result.status === 'error')
      return `База данных сообщает: «${result.message}». Агрегаты вроде AVG() считаются для каждой группы, поэтому фильтровать по ним можно только после GROUP BY.`
    if (result.status === 'correct') return 'Результат верный, отличная работа! Обратите внимание: фильтр HAVING прошли только 3 группы из 5.'
    return `${result.feedback} Посмотрите, какие строки должны исчезнуть, — что у них общего?`
  }
  if (p.includes('подсказ'))
    return 'Вы уже группируете по category. Теперь нужно условие, которое отфильтрует эти группы по средней цене. Оно пишется сразу после GROUP BY.'
  return 'Хороший вопрос! Вспомните порядок выполнения: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY. На каком шаге уже известны средние значения?'
}

export function AiHelper({ lastResult }: { lastResult: RunResult | null }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: 'assistant',
      text: 'Привет, Алексей! Я ваш SQL-помощник. Я даю подсказки, а не готовые ответы — спрашивайте что угодно по этому заданию.',
    },
  ])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, thinking])

  function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || thinking) return
    const id = Date.now()
    setMessages((m) => [...m, { id, role: 'user', text: trimmed }])
    setInput('')
    setThinking(true)
    // Frontend-only mock: swap for a streaming AI SDK route handler when the backend is ready.
    setTimeout(() => {
      setMessages((m) => [...m, { id: id + 1, role: 'assistant', text: mockReply(trimmed, lastResult) }])
      setThinking(false)
    }, 650)
  }

  return (
    <section aria-labelledby="ai-helper-heading" className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className="flex size-7 items-center justify-center rounded-md bg-ai/15 text-ai">
          <Sparkles className="size-4" aria-hidden="true" />
        </span>
        <h2 id="ai-helper-heading" className="text-sm font-semibold">
          AI-помощник
        </h2>
        <span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="size-1.5 rounded-full bg-primary" />
          В сети
        </span>
      </div>

      <div ref={listRef} className="min-h-48 flex-1 space-y-3 overflow-y-auto p-4" role="log" aria-live="polite">
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              'max-w-[90%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
              m.role === 'user'
                ? 'ml-auto rounded-br-sm bg-primary text-primary-foreground'
                : 'rounded-bl-sm border border-ai/20 bg-ai/5 text-foreground/90',
            )}
          >
            {m.text}
          </div>
        ))}
        {thinking && (
          <div className="flex w-fit gap-1 rounded-2xl rounded-bl-sm border border-ai/20 bg-ai/5 px-4 py-3" aria-label="AI-помощник печатает">
            {[0, 1, 2].map((i) => (
              <span key={i} className="size-1.5 animate-bounce rounded-full bg-ai" style={{ animationDelay: `${i * 120}ms` }} />
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-border p-3">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {QUICK_PROMPTS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => send(q)}
              disabled={thinking}
              className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-ai/40 hover:text-foreground disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            send(input)
          }}
          className="flex items-end gap-2 rounded-xl border border-input bg-background p-1.5 focus-within:border-ai/50"
        >
          <label htmlFor="ai-input" className="sr-only">
            Вопрос AI-помощнику
          </label>
          <textarea
            id="ai-input"
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.nativeEvent.isComposing || e.keyCode === 229) return
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send(input)
              }
            }}
            placeholder="Спросите о задании…"
            className="max-h-28 min-h-8 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none field-sizing-content placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={!input.trim() || thinking}
            className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-ai text-ai-foreground transition-opacity disabled:opacity-40"
            aria-label="Отправить сообщение"
          >
            <ArrowUp className="size-4" />
          </button>
        </form>
      </div>
    </section>
  )
}

