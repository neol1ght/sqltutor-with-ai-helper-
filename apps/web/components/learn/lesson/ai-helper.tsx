'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUp, Sparkles } from 'lucide-react';
import type { RunResult } from '@/lib/lesson-engine';
import { sendLessonAiMessage } from '@/lib/api/lesson';
import { cn } from '@/lib/utils';

type Message = { id: string; role: 'user' | 'assistant'; text: string };
const QUICK_PROMPTS = ['Дай подсказку', 'Объясни результат', 'Объясни HAVING', 'Как исправить ошибку?'];

export function AiHelper({
    exerciseId,
    exerciseTitle,
    lastResult,
    query,
}: {
    exerciseId: string;
    exerciseTitle: string;
    lastResult: RunResult | null;
    query: string;
}) {
    const [messages, setMessages] = useState<Message[]>([
        { id: 'welcome', role: 'assistant', text: `Привет! Я SQL-помощник. Помогу разобраться с заданием «${exerciseTitle}». Могу объяснить ошибку, дать подсказку или разобрать результат запроса.` },
    ]);
    const [input, setInput] = useState('');
    const [thinking, setThinking] = useState(false);
    const [error, setError] = useState('');
    const [conversationId, setConversationId] = useState<string>();
    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages, thinking]);

    useEffect(() => {
        setMessages([{ id: `welcome-${exerciseId}`, role: 'assistant', text: `Привет! Я SQL-помощник. Помогу разобраться с заданием «${exerciseTitle}». Могу объяснить ошибку, дать подсказку или разобрать результат запроса.` }]);
        setConversationId(undefined);
        setError('');
    }, [exerciseId, exerciseTitle]);

    async function send(text: string) {
        const trimmed = text.trim();
        if (!trimmed || thinking) return;
        const userMessage: Message = { id: `${Date.now()}-user`, role: 'user', text: trimmed };
        setMessages((current) => [...current, userMessage]);
        setInput('');
        setThinking(true);
        setError('');
        try {
            const response = await sendLessonAiMessage({
                message: trimmed,
                exerciseId,
                ...(conversationId ? { conversationId } : {}),
                ...(query.trim() ? { query } : {}),
                ...(lastResult ? { executionResult: JSON.stringify(lastResult) } : {}),
            });
            setConversationId(response.conversationId);
            setMessages((current) => [...current, { id: `${Date.now()}-assistant`, role: 'assistant', text: response.message }]);
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : 'Не удалось отправить сообщение ИИ.');
        } finally {
            setThinking(false);
        }
    }

    return (
        <section aria-labelledby="ai-helper-heading" className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                <span className="flex size-7 items-center justify-center rounded-md bg-ai/15 text-ai"><Sparkles className="size-4" aria-hidden="true" /></span>
                <h2 id="ai-helper-heading" className="text-sm font-semibold">AI-помощник</h2>
                <span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground"><span className={cn('size-1.5 rounded-full', thinking ? 'animate-pulse bg-warn' : 'bg-primary')} />{thinking ? 'Думает…' : 'Готов'}</span>
            </div>
            <div ref={listRef} className="min-h-48 flex-1 space-y-3 overflow-y-auto p-4" role="log" aria-live="polite">
                {messages.map((message) => <div key={message.id} className={cn('max-w-[90%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed', message.role === 'user' ? 'ml-auto rounded-br-sm bg-primary text-primary-foreground' : 'rounded-bl-sm border border-ai/20 bg-ai/5 text-foreground/90')}>{message.text}</div>)}
                {thinking && <div className="flex w-fit gap-1 rounded-2xl rounded-bl-sm border border-ai/20 bg-ai/5 px-4 py-3" aria-label="ИИ формирует ответ">{[0, 1, 2].map((i) => <span key={i} className="size-1.5 animate-bounce rounded-full bg-ai" style={{ animationDelay: `${i * 120}ms` }} />)}</div>}
                {error && <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">{error}</p>}
            </div>
            <div className="border-t border-border p-3">
                <div className="mb-2 flex flex-wrap gap-1.5">{QUICK_PROMPTS.map((prompt) => <button key={prompt} type="button" onClick={() => void send(prompt)} disabled={thinking} className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-ai/40 hover:text-foreground disabled:opacity-50">{prompt}</button>)}</div>
                <form onSubmit={(event) => { event.preventDefault(); void send(input); }} className="flex items-end gap-2 rounded-xl border border-input bg-background p-1.5 focus-within:border-ai/50">
                    <label htmlFor="ai-input" className="sr-only">Вопрос AI-помощнику</label>
                    <textarea id="ai-input" rows={1} value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.nativeEvent.isComposing || event.keyCode === 229) return; if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void send(input); } }} placeholder="Спросите о задании…" className="max-h-28 min-h-8 flex-1 resize-y bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground" />
                    <button type="submit" disabled={!input.trim() || thinking} className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-ai text-ai-foreground transition-opacity disabled:opacity-40" aria-label="Отправить сообщение"><ArrowUp className="size-4" /></button>
                </form>
                <p className="mt-2 px-1 text-[10px] text-muted-foreground">Ответы генерируются ИИ и могут содержать ошибки.</p>
            </div>
        </section>
    );
}
