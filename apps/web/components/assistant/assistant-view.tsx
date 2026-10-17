'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowUp, MessageSquarePlus, Sparkles } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

type Message = { id: number; role: 'user' | 'assistant'; text: string }
type Conversation = { id: string; title: string; scope: string; messages: Message[] }

const SUGGESTIONS = [
  'Чем отличаются INNER и LEFT JOIN?',
  'Когда использовать HAVING вместо WHERE?',
  'Объясни оконные функции на примере',
  'Как работает индекс в PostgreSQL?',
]

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'c1',
    title: 'WHERE или HAVING?',
    scope: 'Соединения и агрегация',
    messages: [
      { id: 1, role: 'user', text: 'Чем отличаются WHERE и HAVING?' },
      {
        id: 2,
        role: 'assistant',
        text: 'WHERE фильтрует отдельные строки до группировки. HAVING фильтрует уже готовые группы после GROUP BY — поэтому агрегаты вроде AVG() работают только в HAVING.',
      },
    ],
  },
  {
    id: 'c2',
    title: 'Оконные функции',
    scope: 'Продвинутый SQL',
    messages: [
      { id: 1, role: 'user', text: 'Как работает RANK() OVER?' },
      {
        id: 2,
        role: 'assistant',
        text: 'RANK() присваивает каждой строке номер места внутри окна, заданного PARTITION BY, с учётом сортировки ORDER BY. При равных значениях места повторяются, а следующий номер пропускается.',
      },
    ],
  },
]

const SCOPES = ['Все курсы', 'Основы SQL', 'Соединения и агрегация', 'Продвинутый SQL']

function mockAnswer(prompt: string): string {
  const p = prompt.toLowerCase()
  if (p.includes('join'))
    return 'INNER JOIN возвращает только строки, у которых нашлась пара в обеих таблицах. LEFT JOIN сохраняет все строки левой таблицы, добавляя NULL там, где пары не нашлось.'
  if (p.includes('having'))
    return 'Используйте HAVING, когда нужно отфильтровать результат по агрегатной функции — например, оставить только группы с AVG(price) > 50. WHERE для агрегатов не подходит, потому что выполняется раньше группировки.'
  if (p.includes('окон'))
    return 'Оконная функция считает значение для каждой строки, «видя» соседние строки внутри окна: SUM() OVER (PARTITION BY team ORDER BY date) — это скользящая сумма по каждой команде без потери отдельных строк, в отличие от GROUP BY.'
  if (p.includes('индекс'))
    return 'Индекс — это отдельная структура (обычно B-дерево), которая хранит отсортированные значения столбца со ссылками на строки. Это ускоряет поиск и JOIN по этому столбцу, но немного замедляет INSERT/UPDATE.'
  return 'Хороший вопрос! Попробуйте сформулировать, что вы уже знаете об этой теме — я подскажу, в какую сторону думать дальше, а не просто дам готовый ответ.'
}

export function AssistantView() {
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS)
  const [activeId, setActiveId] = useState<string | null>(INITIAL_CONVERSATIONS[0].id)
  const [scope, setScope] = useState(SCOPES[0])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  const active = conversations.find((c) => c.id === activeId) ?? null

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [active, thinking])

  function newChat() {
    setActiveId(null)
    setInput('')
  }

  function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || thinking) return
    setInput('')
    setThinking(true)

    if (!activeId) {
      const id = `c${Date.now()}`
      const convo: Conversation = {
        id,
        title: trimmed.length > 40 ? `${trimmed.slice(0, 40)}…` : trimmed,
        scope,
        messages: [{ id: 1, role: 'user', text: trimmed }],
      }
      setConversations((c) => [convo, ...c])
      setActiveId(id)
      // Frontend-only mock: swap for a streaming AI SDK route handler when the backend is ready.
      setTimeout(() => {
        setConversations((cs) =>
          cs.map((c) => (c.id === id ? { ...c, messages: [...c.messages, { id: 2, role: 'assistant', text: mockAnswer(trimmed) }] } : c)),
        )
        setThinking(false)
      }, 650)
      return
    }

    const userMsg: Message = { id: Date.now(), role: 'user', text: trimmed }
    setConversations((cs) => cs.map((c) => (c.id === activeId ? { ...c, messages: [...c.messages, userMsg] } : c)))
    setTimeout(() => {
      const reply: Message = { id: Date.now() + 1, role: 'assistant', text: mockAnswer(trimmed) }
      setConversations((cs) => cs.map((c) => (c.id === activeId ? { ...c, messages: [...c.messages, reply] } : c)))
      setThinking(false)
    }, 650)
  }

  return (
    <div className="flex min-h-0 flex-1">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border p-4 lg:flex">
        <button
          type="button"
          onClick={newChat}
          className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          <MessageSquarePlus className="size-4" aria-hidden="true" />
          Новый чат
        </button>
        <nav aria-label="Диалоги" className="mt-4 min-h-0 flex-1 overflow-y-auto">
          <ul className="space-y-1">
            {conversations.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(c.id)}
                  aria-current={c.id === activeId ? 'true' : undefined}
                  className={cn(
                    'w-full truncate rounded-lg px-3 py-2 text-left text-sm transition-colors',
                    c.id === activeId ? 'bg-muted font-medium text-foreground' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                  )}
                >
                  <span className="block truncate">{c.title}</span>
                  <span className="block truncate text-xs text-muted-foreground/80">{c.scope}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3 sm:px-6">
          <span className="flex size-8 items-center justify-center rounded-lg bg-ai/15 text-ai">
            <Sparkles className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold">AI-репетитор</h1>
            <p className="text-xs text-muted-foreground">Отвечает подсказками, а не готовыми решениями</p>
          </div>
          <div className="ml-auto">
            <Select value={scope} onValueChange={(v) => setScope(v ?? SCOPES[0])}>
              <SelectTrigger className="h-8 w-48" aria-label="Область вопросов">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SCOPES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {active ? (
          <div ref={listRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-6 sm:px-6" role="log" aria-live="polite">
            <div className="mx-auto max-w-2xl space-y-4">
              {active.messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                    m.role === 'user'
                      ? 'ml-auto rounded-br-sm bg-primary text-primary-foreground'
                      : 'rounded-bl-sm border border-ai/20 bg-ai/5 text-foreground/90',
                  )}
                >
                  {m.text}
                </div>
              ))}
              {thinking && (
                <div className="flex w-fit gap-1 rounded-2xl rounded-bl-sm border border-ai/20 bg-ai/5 px-4 py-3" aria-label="AI-репетитор печатает">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="size-1.5 animate-bounce rounded-full bg-ai" style={{ animationDelay: `${i * 120}ms` }} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-6 text-center sm:px-6">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-ai/15 text-ai">
              <Sparkles className="size-6" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-lg font-semibold">Спросите что угодно про SQL</h2>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Репетитор объясняет концепции, разбирает ошибки в запросах и подстраивается под ваш уровень.
            </p>
            <div className="mt-6 grid w-full max-w-lg gap-2 sm:grid-cols-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-xl border border-border bg-card px-4 py-3 text-left text-sm text-foreground/90 transition-colors hover:border-ai/40"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-border p-4 sm:px-6">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              send(input)
            }}
            className="mx-auto flex max-w-2xl items-end gap-2 rounded-xl border border-input bg-background p-1.5 focus-within:border-ai/50"
          >
            <label htmlFor="assistant-input" className="sr-only">
              Вопрос AI-репетитору
            </label>
            <textarea
              id="assistant-input"
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
              placeholder="Спросите про SQL, вставьте запрос или опишите ошибку…"
              className="max-h-32 min-h-9 flex-1 resize-none bg-transparent px-2.5 py-2 text-sm outline-none field-sizing-content placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              disabled={!input.trim() || thinking}
              className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-ai text-ai-foreground transition-opacity disabled:opacity-40"
              aria-label="Отправить сообщение"
            >
              <ArrowUp className="size-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
