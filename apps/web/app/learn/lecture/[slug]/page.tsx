'use client';

import {useCallback, useEffect, useMemo, useState} from 'react';
import {useParams, useRouter} from 'next/navigation';
import Link from 'next/link';
import {ArrowLeft, ArrowRight, CheckCircle2, CircleHelp, Code2, Lightbulb, Trophy} from 'lucide-react';
import {getLecture, saveLectureProgress, type LectureResponse, type LectureBlock} from '@/lib/api/learning-content';

export default function InteractiveLecturePage() {
    const {slug} = useParams<{ slug: string }>();
    const router = useRouter();
    const [lecture, setLecture] = useState<LectureResponse | null>(null);
    const [index, setIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [finished, setFinished] = useState(false);

    const load = useCallback(async () => {
        try {
            const data = await getLecture(slug);
            setLecture(data);
            setIndex(Math.min(data.progress.lastPosition, Math.max(0, data.content.length - 1)));
            setFinished(Boolean(data.progress.completedAt));
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Не удалось загрузить лекцию.');
        }
    }, [slug]);

    useEffect(() => {
        void load();
    }, [load]);

    const blocks = useMemo(() => lecture?.content ?? [], [lecture]);
    const block = blocks[index];

    async function goTo(nextIndex: number) {
        if (!lecture) return;
        const safeIndex = Math.max(0, Math.min(nextIndex, blocks.length - 1));
        setIndex(safeIndex);
        try {
            await saveLectureProgress(lecture.id, {lastPosition: safeIndex});
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Не удалось сохранить позицию.');
        }
    }

    async function complete() {
        if (!lecture) return;
        setSaving(true);
        setError('');
        try {
            await saveLectureProgress(lecture.id, {lastPosition: Math.max(0, blocks.length - 1), completed: true});
            setFinished(true);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Не удалось сохранить прогресс.');
        } finally {
            setSaving(false);
        }
    }

    if (error && !lecture) return <main className="mx-auto max-w-3xl flex-1 px-4 py-12"><p role="alert"
                                                                                           className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</p>
        <Link className="mt-4 inline-block text-sm underline" href="/learn/roadmap">Вернуться к роадмапам</Link></main>;
    if (!lecture) return <main
        className="flex flex-1 items-center justify-center text-sm text-muted-foreground">Загружаем лекцию…</main>;
    if (!blocks.length) return <main className="mx-auto max-w-3xl flex-1 px-4 py-12"><h1
        className="text-2xl font-semibold">{lecture.title}</h1><p className="mt-3 text-muted-foreground">В этой лекции
        пока нет содержимого.</p></main>;

    return <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-8">
        <Link href="/learn/roadmap"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft
            className="size-4"/>К роадмапу</Link>
        <header className="mt-5 rounded-2xl border border-border bg-card p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><span
                className="rounded-full bg-primary/10 px-2.5 py-1 font-medium text-primary">ИНТЕРАКТИВНАЯ ЛЕКЦИЯ</span><span>{lecture.estimatedMinutes} мин.</span><span>Шаг {index + 1} из {blocks.length}</span>
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">{lecture.title}</h1>{lecture.summary &&
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{lecture.summary}</p>}
            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary transition-all"
                     style={{width: `${((index + 1) / blocks.length) * 100}%`}}/>
            </div>
        </header>
        <section className="mt-5 min-h-64 rounded-2xl border border-border bg-card p-5 sm:p-8">
            {block.title && <h2 className="flex items-center gap-2 text-xl font-semibold">{block.type === 'quiz' ?
                <CircleHelp className="size-5 text-primary"/> : block.type === 'code' ?
                    <Code2 className="size-5 text-primary"/> : block.type === 'callout' ?
                        <Lightbulb className="size-5 text-primary"/> : null}{block.title}</h2>}
            {block.type === 'text' &&
                <p className="mt-4 whitespace-pre-wrap text-base leading-8 text-foreground/90">{block.body}</p>}
            {block.type === 'callout' && <div
                className="mt-4 rounded-xl border border-primary/25 bg-primary/5 p-4 text-sm leading-7">{block.body}</div>}
            {block.type === 'code' && <><p className="mt-4 text-sm leading-6 text-muted-foreground">{block.body}</p>
                <pre
                    className="mt-4 overflow-x-auto rounded-xl border border-border bg-[#10151f] p-4 text-sm leading-7 text-slate-100"><code>{block.code}</code></pre>
            </>}
            {block.type === 'quiz' && <div className="mt-5"><p
                className="text-sm leading-6 text-muted-foreground">{block.body || 'Выбери правильный ответ.'}</p>
                <div className="mt-4 space-y-2">{(block.options ?? []).map((option, optionIndex) => {
                    const selected = answers[index] === optionIndex;
                    const answered = answers[index] !== undefined;
                    const correct = optionIndex === block.correctOption;
                    return <button key={`${optionIndex}-${option}`}
                                   onClick={() => setAnswers((old) => ({...old, [index]: optionIndex}))}
                                   className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left text-sm transition ${selected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'} ${answered && correct ? 'border-emerald-500/60 bg-emerald-500/5' : ''}`}>
                        <span
                            className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border ${selected ? 'border-primary text-primary' : 'border-border'}`}>{selected ?
                            <CheckCircle2 className="size-4"/> : null}</span>{option}</button>;
                })}</div>
                {answers[index] !== undefined && <div
                    className={`mt-4 rounded-xl p-4 text-sm leading-6 ${answers[index] === block.correctOption ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-200' : 'bg-amber-500/10 text-amber-800 dark:text-amber-200'}`}>
                    <p className="font-semibold">{answers[index] === block.correctOption ? 'Верно! Отлично.' : 'Пока не совсем — попробуй ещё раз.'}</p>{answers[index] === block.correctOption && block.explanation &&
                    <p className="mt-1">{block.explanation}</p>}</div>}</div>}
        </section>
        {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
        {finished &&
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4"><Trophy
                className="size-5 text-primary"/>
                <div><p className="font-medium">Лекция завершена!</p><p
                    className="text-sm text-muted-foreground">Прогресс сохранён. Можно перейти к следующему этапу
                    роадмапа.</p></div>
            </div>}
        <footer className="mt-5 flex items-center justify-between gap-3">
            <button onClick={() => void goTo(index - 1)} disabled={index === 0}
                    className="rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-40">Назад
            </button>
            {index < blocks.length - 1 ? <button onClick={() => void goTo(index + 1)}
                                                 className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Далее <ArrowRight
                className="size-4"/></button> : finished ? <button onClick={() => router.push('/learn/roadmap')}
                                                                   className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">К
                роадмапу <ArrowRight className="size-4"/></button> : <button onClick={() => void complete()}
                                                                             disabled={saving || blocks.some((b, i) => b.type === 'quiz' && answers[i] !== b.correctOption)}
                                                                             className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
                <CheckCircle2 className="size-4"/>{saving ? 'Сохраняем…' : 'Завершить лекцию'}</button>}</footer>
    </main>;
}
