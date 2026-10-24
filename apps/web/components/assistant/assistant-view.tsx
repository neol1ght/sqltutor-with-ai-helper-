
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowUp, MessageSquarePlus, Sparkles, AlertCircle } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

type Message = {
  id: string
  role: 'user' | 'assistant'
  text: string
}

type Conversation = {
  id: string
  title: string
  scope: string
  messages: Message[]
  updatedAt: number
}

const STORAGE_KEY = 'sqltutor_ai_conversations'

const SCOPES = [
  'Все курсы',
  'Основы SQL',
  'Соединения и агрегация',
  'Продвинутый SQL',
]

const SUGGESTIONS = [
  'Чем отличаются INNER и LEFT JOIN?',
  'Когда использовать HAVING вместо WHERE?',
  'Объясни оконные функции на примере',
  'Как работает индекс в PostgreSQL?',
]

const API_URL = (
    process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3500/api'
).replace(/\/+$/, '')

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function getErrorMessage(data: unknown): string {
  if (
      typeof data === 'object' &&
      data !== null &&
      'message' in data
  ) {
    const message = (data as { message?: unknown }).message

    if (typeof message === 'string') return message
    if (Array.isArray(message)) return message.join('\n')
  }

  return 'Не удалось получить ответ от AI. Попробуйте ещё раз.'
}

export function AssistantView() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [scope, setScope] = useState(SCOPES[0])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const activeIdRef = useRef<string | null>(null)
  const thinkingRef = useRef(false)

  const active = conversations.find((c) => c.id === activeId) ?? null

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)

      if (saved) {
        const parsed = JSON.parse(saved) as Conversation[]

        if (Array.isArray(parsed)) {
          setConversations(parsed)
        }
      }
    } catch (e) {
      console.error('Не удалось загрузить историю AI-чатов:', e)
    } finally {
      setInitialized(true)
    }
  }, [])

  useEffect(() => {
    if (!initialized) return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
    } catch (e) {
      console.error('Не удалось сохранить историю AI-чатов:', e)
    }
  }, [conversations, initialized])

  useEffect(() => {
    activeIdRef.current = activeId
  }, [activeId])

  useEffect(() => {
    thinkingRef.current = thinking
  }, [thinking])

  useEffect(() => {
    if (!activeId) return

    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [active?.messages.length, thinking, activeId])

  const newChat = useCallback(() => {
    if (thinkingRef.current) return

    activeIdRef.current = null
    setActiveId(null)
    setInput('')
    setError(null)
    inputRef.current?.focus()
  }, [])

  async function send(text: string) {
    const trimmed = text.trim()

    if (!trimmed || thinkingRef.current) return

    const token = localStorage.getItem('sqltutor_access_token')

    if (!token) {
      setError('Необходимо войти в аккаунт SQLTutor, чтобы пользоваться AI.')
      return
    }

    setInput('')
    setError(null)
    thinkingRef.current = true
    setThinking(true)

    const userMessage: Message = {
      id: createId(),
      role: 'user',
      text: trimmed,
    }

    let conversationId = activeIdRef.current
    let createdConversation = false

    if (!conversationId) {
      conversationId = createId()
      createdConversation = true

      const conversation: Conversation = {
        id: conversationId,
        title: trimmed.length > 40
            ? `${trimmed.slice(0, 40)}…`
            : trimmed,
        scope,
        messages: [userMessage],
        updatedAt: Date.now(),
      }

      activeIdRef.current = conversationId
      setActiveId(conversationId)
      setConversations((prev) => [conversation, ...prev])
    } else {
      setConversations((prev) =>
          prev.map((c) =>
              c.id === conversationId
                  ? {
                    ...c,
                    messages: [...c.messages, userMessage],
                    updatedAt: Date.now(),
                  }
                  : c,
          ),
      )
    }

    try {
      const response = await fetch(`${API_URL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: trimmed,
          conversationId: createdConversation ? undefined : conversationId,
        }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error(
              'Сессия истекла или доступ запрещён. Войдите в аккаунт заново.',
          )
        }

        throw new Error(getErrorMessage(data))
      }

      if (
          !data ||
          typeof data.message !== 'string' ||
          !data.message.trim() ||
          typeof data.conversationId !== 'string'
      ) {
        throw new Error('Backend вернул ответ в неожиданном формате.')
      }

      const actualConversationId = data.conversationId

      const assistantMessage: Message = {
        id: createId(),
        role: 'assistant',
        text: data.message,
      }

      setConversations((prev) =>
          prev.map((c) =>
              c.id === conversationId
                  ? {
                    ...c,
                    id: actualConversationId,
                    messages: [...c.messages, assistantMessage],
                    updatedAt: Date.now(),
                  }
                  : c,
          ),
      )

      if (activeIdRef.current === conversationId) {
        activeIdRef.current = actualConversationId
        setActiveId(actualConversationId)
      }
    } catch (e) {
      const message =
          e instanceof Error
              ? e.message
              : 'Не удалось связаться с AI-сервисом.'

      setError(message)

      // Оставляем сообщение пользователя в истории.
      // Повторная отправка не дублирует его автоматически.
    } finally {
      thinkingRef.current = false
      setThinking(false)
    }
  }

  return (
      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-border p-4 lg:flex">
          <button
              type="button"
              onClick={newChat}
              disabled={thinking}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
          >
            <MessageSquarePlus className="size-4" />
            Новый чат
          </button>

          <nav aria-label="Диалоги" className="mt-4 min-h-0 flex-1 overflow-y-auto">
            <ul className="space-y-1">
              {conversations
                  .slice()
                  .sort((a, b) => b.updatedAt - a.updatedAt)
                  .map((c) => (
                      <li key={c.id}>
                        <button
                            type="button"
                            onClick={() => {
                              if (thinkingRef.current) return

                              activeIdRef.current = c.id
                              setActiveId(c.id)
                              setScope(c.scope)
                              setError(null)
                            }}
                            aria-current={c.id === activeId ? 'true' : undefined}
                            className={cn(
                                'w-full truncate rounded-lg px-3 py-2 text-left text-sm transition-colors',
                                c.id === activeId
                                    ? 'bg-muted font-medium text-foreground'
                                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                            )}
                        >
                          <span className="block truncate">{c.title}</span>
                          <span className="block truncate text-xs text-muted-foreground/80">
                      {c.scope}
                    </span>
                        </button>
                      </li>
                  ))}
            </ul>
          </nav>
        </aside>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3 sm:px-6">
          <span className="flex size-8 items-center justify-center rounded-lg bg-ai/15 text-ai">
            <Sparkles className="size-4" />
          </span>

            <div className="min-w-0">
              <h1 className="text-sm font-semibold">AI-репетитор</h1>
              <p className="text-xs text-muted-foreground">
                Персональный помощник по SQL
              </p>
            </div>

            <div className="ml-auto">
              <Select
                  value={scope}
                  onValueChange={(v) => setScope(v ?? SCOPES[0])}
                  disabled={thinking}
              >
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
              <div
                  ref={listRef}
                  className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-6 sm:px-6"
                  role="log"
                  aria-live="polite"
              >
                <div className="mx-auto max-w-2xl space-y-4">
                  {active.messages.map((m) => (
                      <div
                          key={m.id}
                          className={cn(
                              'max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-relaxed',
                              m.role === 'user'
                                  ? 'ml-auto rounded-br-sm bg-primary text-primary-foreground'
                                  : 'rounded-bl-sm border border-ai/20 bg-ai/5 text-foreground/90',
                          )}
                      >
                        {m.text}
                      </div>
                  ))}

                  {thinking && (
                      <div
                          className="flex w-fit gap-1 rounded-2xl rounded-bl-sm border border-ai/20 bg-ai/5 px-4 py-3"
                          aria-label="AI-репетитор генерирует ответ"
                      >
                        {[0, 1, 2].map((i) => (
                            <span
                                key={i}
                                className="size-1.5 animate-bounce rounded-full bg-ai"
                                style={{ animationDelay: `${i * 120}ms` }}
                            />
                        ))}
                      </div>
                  )}
                </div>
              </div>
          ) : (
              <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-6 text-center sm:px-6">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-ai/15 text-ai">
              <Sparkles className="size-6" />
            </span>

                <h2 className="mt-4 text-lg font-semibold">
                  Спросите что угодно про SQL
                </h2>

                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  Разбирайте ошибки, изучайте SQL и задавайте вопросы по своим задачам.
                </p>

                <div className="mt-6 grid w-full max-w-lg gap-2 sm:grid-cols-2">
                  {SUGGESTIONS.map((s) => (
                      <button
                          key={s}
                          type="button"
                          disabled={thinking}
                          onClick={() => send(s)}
                          className="rounded-xl border border-border bg-card px-4 py-3 text-left text-sm text-foreground/90 transition-colors hover:border-ai/40 disabled:opacity-50"
                      >
                        {s}
                      </button>
                  ))}
                </div>
              </div>
          )}

          {error && (
              <div
                  role="alert"
                  className="mx-auto flex w-full max-w-2xl items-start gap-2 px-4 py-2 text-sm text-destructive"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{error}</span>
              </div>
          )}

          <div className="border-t border-border p-4 sm:px-6">
            <form
                onSubmit={(e) => {
                  e.preventDefault()
                  void send(input)
                }}
                className="mx-auto flex max-w-2xl items-end gap-2 rounded-xl border border-input bg-background p-1.5 focus-within:border-ai/50"
            >
              <label htmlFor="assistant-input" className="sr-only">
                Вопрос AI-репетитору
              </label>

              <textarea
                  ref={inputRef}
                  id="assistant-input"
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.nativeEvent.isComposing || e.keyCode === 229) return

                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      void send(input)
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

            <p className="mx-auto mt-2 max-w-2xl text-xs text-muted-foreground">
              AI может ошибаться. Проверяйте SQL-запросы перед использованием.
            </p>
          </div>
        </div>
      </div>
  )
}
