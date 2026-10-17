'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Code2, Play, RotateCcw } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { executeLessonSql, getFirstLessonExercise, getLessonExercise, getLessonExercises, type LessonExercise, submitLessonSql, type SqlApiResult } from '@/lib/api/lesson';
import type { RunResult } from '@/lib/lesson-engine';
import { AiHelper } from './ai-helper';
import { ResultsPanel } from './results-panel';
import { SqlEditor } from './sql-editor';

const EMPTY_QUERY = '-- Напишите SQL-запрос для решения задания\nSELECT\n';

function toRunResult(response: SqlApiResult, ms: number, checked: boolean): RunResult {
    if (!response.success) {
        return {
            status: 'error',
            message: response.error?.message ?? 'Не удалось выполнить запрос.',
            ms,
        };
    }

    const rows = response.rows ?? [];
    const columns = response.columns ?? (rows.length > 0 ? Object.keys(rows[0]) : []);
    const values = rows.map((row) => columns.map((column) => {
        const value = row[column];
        if (value === null || typeof value === 'string' || typeof value === 'number') return value;
        if (value === undefined) return 'NULL';
        return JSON.stringify(value);
    }));

    const status = checked ? (response.isCorrect ? 'correct' : 'wrong') : 'success';
    const feedback = !checked
        ? 'Запрос выполнен. Проверьте результат, а когда будете готовы — нажмите «Проверить решение».'
        : response.isCorrect
            ? 'Верно! Результат совпадает с эталонным ответом. Попытка сохранена в прогрессе.'
            : 'Запрос выполнился, но результат не совпадает с ожидаемым. Проверьте условие, группировку и сортировку.';

    return { status, columns, rows: values, ms, feedback };
}

export function LessonWorkspace() {
    const [exercise, setExercise] = useState<LessonExercise | null>(null);
    const [exercises, setExercises] = useState<LessonExercise[]>([]);
    const [query, setQuery] = useState(EMPTY_QUERY);
    const [result, setResult] = useState<RunResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [running, setRunning] = useState(false);
    const [error, setError] = useState('');

    const loadExercise = useCallback(async (exerciseId?: string) => {
        setLoading(true);
        setError('');
        setResult(null);
        try {
            const selected = exerciseId ? await getLessonExercise(exerciseId) : await getFirstLessonExercise();
            setExercise(selected);
            setQuery(EMPTY_QUERY);
            const slug = selected.learningCase?.slug;
            if (slug) {
                const list = await getLessonExercises(slug);
                setExercises([...list].sort((a, b) => a.sortOrder - b.sortOrder));
            } else {
                setExercises([selected]);
            }
            if (typeof window !== 'undefined') {
                const url = new URL(window.location.href);
                url.searchParams.set('exerciseId', selected.id);
                window.history.replaceState({}, '', url);
            }
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : 'Не удалось загрузить задание.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        void loadExercise(params.get('exerciseId') ?? undefined);
    }, [loadExercise]);

    const currentIndex = useMemo(() => exercises.findIndex((item) => item.id === exercise?.id), [exercises, exercise?.id]);
    const progress = exercises.length > 0 && currentIndex >= 0 ? Math.round(((currentIndex + 1) / exercises.length) * 100) : 0;
    const solved = result?.status === 'correct';

    async function run() {
        if (!exercise || running || !query.trim()) return;
        setRunning(true);
        setError('');
        const startedAt = performance.now();
        try {
            const response = await executeLessonSql(exercise.id, query);
            setResult(toRunResult(response, Math.round(performance.now() - startedAt), false));
        } catch (cause) {
            setResult({
                status: 'error',
                message: cause instanceof Error ? cause.message : 'Не удалось выполнить SQL.',
                ms: Math.round(performance.now() - startedAt),
            });
        } finally {
            setRunning(false);
        }
    }

    async function checkSolution() {
        if (!exercise || running || !query.trim()) return;
        setRunning(true);
        setError('');
        const startedAt = performance.now();
        try {
            const response = await submitLessonSql(exercise.id, query);
            setResult(toRunResult(response, Math.round(performance.now() - startedAt), true));
        } catch (cause) {
            setResult({
                status: 'error',
                message: cause instanceof Error ? cause.message : 'Не удалось проверить решение.',
                ms: Math.round(performance.now() - startedAt),
            });
        } finally {
            setRunning(false);
        }
    }

    function resetQuery() {
        setQuery(EMPTY_QUERY);
        setResult(null);
        setError('');
    }

    function navigateTo(index: number) {
        const target = exercises[index];
        if (target) void loadExercise(target.id);
    }

    if (loading) {
        return <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">Загружаем задание из SQLTutor…</div>;
    }

    if (!exercise) {
        return <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-start justify-center gap-3 px-6"><h1 className="text-xl font-semibold">Не удалось открыть урок</h1><p className="text-sm text-muted-foreground">{error || 'Задание не найдено.'}</p><Link href="/learn" className={buttonVariants({ variant: 'default' })}>Вернуться к обучению</Link></div>;
    }

    return (
        <div className="flex flex-1 flex-col lg:h-dvh lg:overflow-hidden">
            <header className="flex items-center gap-4 border-b border-border px-4 py-3 sm:px-6">
                <Link href="/learn" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" aria-hidden="true" /><span className="hidden sm:inline">Главная</span></Link>
                <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-xs text-muted-foreground">{exercise.learningCase?.title ?? 'Практика'} · задание {currentIndex >= 0 ? currentIndex + 1 : 1}{exercises.length ? `/${exercises.length}` : ''}</p>
                    <div className="mt-1.5 h-1 max-w-xs overflow-hidden rounded-full bg-muted" role="progressbar" aria-label="Прогресс по кейсу" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${progress}%` }} /></div>
                </div>
                <span className="hidden rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 font-mono text-xs text-primary sm:inline">{exercise.difficulty}</span>
            </header>

            <div className="grid min-h-0 flex-1 lg:grid-cols-[300px_minmax(0,1fr)_340px]">
                <aside className="overflow-y-auto border-b border-border p-5 lg:border-b-0 lg:border-r lg:p-6">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary"><Code2 className="size-3" aria-hidden="true" />Практика</span>
                    <h1 className="mt-3 text-xl font-semibold tracking-tight">{exercise.title}</h1>
                    <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{exercise.description}</p>
                    <div className="mt-6 rounded-xl border border-primary/25 bg-primary/5 p-4">
                        <h2 className="font-mono text-xs uppercase tracking-wider text-primary">Перед началом</h2>
                        <p className="mt-2 text-sm leading-relaxed">Нажмите «Запустить», чтобы выполнить SQL и посмотреть строки. Когда будете готовы, нажмите «Проверить», чтобы сравнить результат с эталоном и сохранить попытку в прогрессе.</p>
                    </div>
                    <div className="mt-6 rounded-xl border border-border p-4">
                        <h2 className="flex items-center gap-2 text-sm font-medium"><BookOpen className="size-4 text-muted-foreground" />Учебная база</h2>
                        <p className="mt-2 text-sm text-muted-foreground">{exercise.learningCase?.title ?? 'Учебный кейс'}</p>
                        <p className="mt-1 text-xs text-muted-foreground">Используйте таблицы и столбцы, указанные в условии задания. Доступны только запросы чтения SELECT/WITH.</p>
                    </div>
                    {error && <p role="alert" className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
                    <div className="mt-6 flex gap-2">
                        <Button variant="outline" size="sm" disabled={currentIndex <= 0} onClick={() => navigateTo(currentIndex - 1)}><ArrowLeft data-icon="inline-start" />Предыдущее</Button>
                        <Button variant="outline" size="sm" disabled={currentIndex < 0 || currentIndex >= exercises.length - 1} onClick={() => navigateTo(currentIndex + 1)}>Следующее<ArrowRight data-icon="inline-end" /></Button>
                    </div>
                </aside>

                <section className="flex min-h-[560px] min-w-0 flex-col lg:min-h-0">
                    <div className="flex items-center justify-between gap-2 border-b border-border bg-code px-4 py-2">
                        <span className="font-mono text-xs text-muted-foreground">solution.sql</span>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={resetQuery} disabled={running}><RotateCcw data-icon="inline-start" aria-hidden="true" />Сбросить</Button>
                            <Button variant="outline" size="sm" onClick={() => void run()} disabled={running || !query.trim()}><Play data-icon="inline-start" aria-hidden="true" />{running ? 'Выполняется…' : 'Запустить'}</Button>
                            <Button size="sm" onClick={() => void checkSolution()} disabled={running || !query.trim()}><CheckCircle2 data-icon="inline-start" aria-hidden="true" />{running ? 'Проверяем…' : 'Проверить'}</Button>
                        </div>
                    </div>
                    <SqlEditor value={query} onChange={setQuery} onRun={run} />
                    <div className="flex h-72 min-h-56 shrink-0 flex-col overflow-hidden"><ResultsPanel result={result} running={running} /></div>
                    {solved && <div className="flex items-center justify-between gap-4 border-t border-primary/30 bg-primary/10 px-4 py-3"><p className="flex items-center gap-2 text-sm font-medium"><CheckCircle2 className="size-4 text-primary" />Задание решено! Прогресс сохранён.</p><Button size="sm" disabled={currentIndex < 0 || currentIndex >= exercises.length - 1} onClick={() => navigateTo(currentIndex + 1)}>Следующее задание<ArrowRight data-icon="inline-end" /></Button></div>}
                </section>

                <aside className="flex min-h-[480px] flex-col border-t border-border bg-card/30 lg:min-h-0 lg:border-l lg:border-t-0"><AiHelper key={exercise.id} exerciseId={exercise.id} exerciseTitle={exercise.title} lastResult={result} query={query} /></aside>
            </div>
        </div>
    );
}
