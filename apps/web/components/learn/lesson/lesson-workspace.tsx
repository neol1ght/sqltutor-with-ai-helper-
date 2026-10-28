'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Code2, Play, RotateCcw } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { executeLessonSql, getLessonExercise, getLessonExercises, submitLessonSql, type LessonExercise, type SqlApiResult } from '@/lib/api/lesson';
import { getContinue, getRoadmap, type RoadmapNode } from '@/lib/api/learning-content';
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

/** Этап маршрута, приведённый к единому виду для навигации. */
type RouteStep = {
    key: string;
    type: 'LECTURE' | 'EXERCISE';
    title: string;
    lectureSlug: string | null;
    exerciseId: string | null;
    unlocked: boolean;
};

function stepsFromNodes(nodes: RoadmapNode[]): RouteStep[] {
    return nodes
        .filter((node) => node.lecture || node.exercise)
        .map((node) => ({
            key: node.id,
            type: node.type,
            title: node.title,
            lectureSlug: node.lecture?.slug ?? null,
            exerciseId: node.exercise?.id ?? null,
            unlocked: node.unlocked,
        }));
}

function stepsFromExercises(exercises: LessonExercise[]): RouteStep[] {
    return exercises.map((exercise) => ({
        key: exercise.id,
        type: 'EXERCISE' as const,
        title: exercise.title,
        lectureSlug: null,
        exerciseId: exercise.id,
        unlocked: true,
    }));
}

export function LessonWorkspace() {
    const router = useRouter();
    const [exercise, setExercise] = useState<LessonExercise | null>(null);
    const [steps, setSteps] = useState<RouteStep[]>([]);
    const [query, setQuery] = useState(EMPTY_QUERY);
    const [result, setResult] = useState<RunResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [running, setRunning] = useState(false);
    const [error, setError] = useState('');
    const workspaceRef = useRef<HTMLElement>(null);
    const [editorHeight, setEditorHeight] = useState(360);
    const [isResizing, setIsResizing] = useState(false);

    function handleResizeStart(e: React.PointerEvent<HTMLDivElement>) {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        setIsResizing(true);
    }

    function handleResizeMove(e: React.PointerEvent<HTMLDivElement>) {
        if (!isResizing || !workspaceRef.current) return;

        const rect = workspaceRef.current.getBoundingClientRect();
        const headerHeight = 40;
        const dividerHeight = 8;
        const resultsMinHeight = 160;
        const solvedHeight = solved ? 56 : 0;
        const maxHeight = Math.max(
            120,
            rect.height - headerHeight - dividerHeight - resultsMinHeight - solvedHeight,
        );

        setEditorHeight(
            Math.max(120, Math.min(e.clientY - rect.top - headerHeight, maxHeight)),
        );
    }

    function handleResizeEnd() {
        setIsResizing(false);
    }

    // Курс, к которому относится открытый этап (для переходов между лекциями).
    const caseSlug = useMemo(() => exercise?.learningCase?.slug ?? null, [exercise]);

    const loadExercise = useCallback(async (exerciseId?: string) => {
        setLoading(true);
        setError('');
        setResult(null);

        // Без конкретного задания отправляем пользователя к его текущему этапу.
        if (!exerciseId) {
            try {
                const next = await getContinue();

                if (next.node?.type === 'LECTURE' && next.node.lectureSlug) {
                    const caseParam = next.learningCase?.slug ? `?case=${next.learningCase.slug}` : '';
                    router.replace(`/learn/lecture/${next.node.lectureSlug}${caseParam}`);
                    return;
                }

                if (next.node?.exerciseId) {
                    exerciseId = next.node.exerciseId;
                } else {
                    router.replace('/learn/roadmap');
                    return;
                }
            } catch {
                router.replace('/learn/roadmap');
                return;
            }
        }

        try {
            const selected = await getLessonExercise(exerciseId);
            setExercise(selected);
            setQuery(EMPTY_QUERY);

            // Строим последовательность этапов из роадмапа курса.
            const slug = selected.learningCase?.slug;
            let routeSteps: RouteStep[] = [];

            if (slug) {
                try {
                    const roadmap = await getRoadmap(slug);
                    routeSteps = stepsFromNodes(roadmap.nodes);
                } catch {
                    routeSteps = [];
                }

                // Если этапы не настроены, навигация идёт по упражнениям кейса.
                if (!routeSteps.length) {
                    const list = await getLessonExercises(slug);
                    routeSteps = stepsFromExercises([...list].sort((a, b) => a.sortOrder - b.sortOrder));
                }
            }

            if (!routeSteps.length) {
                routeSteps = [{ key: selected.id, type: 'EXERCISE', title: selected.title, lectureSlug: null, exerciseId: selected.id, unlocked: true }];
            }

            setSteps(routeSteps);

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
    }, [router]);

    const openStep = useCallback((step: RouteStep) => {
        if (step.type === 'LECTURE' && step.lectureSlug) {
            router.push(`/learn/lecture/${step.lectureSlug}${caseSlug ? `?case=${caseSlug}` : ''}`);
            return;
        }
        void loadExercise(step.exerciseId ?? undefined);
    }, [router, loadExercise, caseSlug]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        void loadExercise(params.get('exerciseId') ?? undefined);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const currentStepIndex = useMemo(
        () => steps.findIndex((step) => step.exerciseId === exercise?.id),
        [steps, exercise?.id],
    );
    const progress = steps.length > 0 && currentStepIndex >= 0 ? Math.round(((currentStepIndex + 1) / steps.length) * 100) : 0;
    const solved = result?.status === 'correct';

    const prevStep = currentStepIndex > 0 ? steps[currentStepIndex - 1] : null;
    const nextStep = currentStepIndex >= 0 && currentStepIndex < steps.length - 1 ? steps[currentStepIndex + 1] : null;

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

            // После верного решения обновляем этапы: следующий мог разблокироваться.
            if (response.isCorrect) {
                void refreshSteps();
            }
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

    async function refreshSteps() {
        const slug = exercise?.learningCase?.slug;
        if (!slug) return;
        try {
            const roadmap = await getRoadmap(slug);
            const routeSteps = stepsFromNodes(roadmap.nodes);
            if (routeSteps.length) setSteps(routeSteps);
        } catch {
            // Обновление блокировок не критично: попробуем при следующем действии.
        }
    }

    if (loading) {
        return <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">Загружаем задание из SQLTutor…</div>;
    }

    if (!exercise) {
        return <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-start justify-center gap-3 px-6"><h1 className="text-xl font-semibold">Не удалось открыть урок</h1><p className="text-sm text-muted-foreground">{error || 'Задание не найдено.'}</p><Link href="/learn/roadmap" className={buttonVariants({ variant: 'default' })}>К программе обучения</Link></div>;
    }

    return (
        <div className="flex h-dvh min-h-0 min-w-0 flex-col overflow-hidden">
            <header className="flex shrink-0 items-center gap-4 border-b border-border px-4 py-3 sm:px-6">
                <Link href={caseSlug ? `/learn/roadmap/${caseSlug}` : '/learn/roadmap'} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" aria-hidden="true" /><span className="hidden sm:inline">Программа курса</span></Link>
                <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-xs text-muted-foreground">{exercise.learningCase?.title ?? 'Практика'} · этап {currentStepIndex >= 0 ? currentStepIndex + 1 : 1}{steps.length ? `/${steps.length}` : ''}</p>
                    <div className="mt-1.5 h-1 max-w-xs overflow-hidden rounded-full bg-muted" role="progressbar" aria-label="Прогресс по курсу" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${progress}%` }} /></div>
                </div>
                <span className="hidden rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 font-mono text-xs text-primary sm:inline">{exercise.difficulty}</span>
            </header>

            <div className="grid min-h-0 min-w-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[300px_minmax(0,1fr)_340px] lg:grid-rows-[minmax(0,1fr)]">
                <aside className="min-h-0 min-w-0 overflow-x-hidden overflow-y-auto border-b border-border p-5 lg:border-b-0 lg:border-r lg:p-6">
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
                        <Button variant="outline" size="sm" disabled={!prevStep} onClick={() => prevStep && openStep(prevStep)}><ArrowLeft data-icon="inline-start" />Предыдущий</Button>
                        <Button variant="outline" size="sm" disabled={!nextStep || !nextStep.unlocked} onClick={() => nextStep && openStep(nextStep)}>Следующий<ArrowRight data-icon="inline-end" /></Button>
                    </div>
                </aside>

                <section
                    ref={workspaceRef}
                    className={`flex min-h-0 min-w-0 flex-col overflow-hidden ${
                        isResizing ? 'select-none' : ''
                    }`}
                >
                    <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border bg-code px-4 py-2">
                        <span className="font-mono text-xs text-muted-foreground">solution.sql</span>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={resetQuery} disabled={running}><RotateCcw data-icon="inline-start" aria-hidden="true" />Сбросить</Button>
                            <Button variant="outline" size="sm" onClick={() => void run()} disabled={running || !query.trim()}><Play data-icon="inline-start" aria-hidden="true" />{running ? 'Выполняется…' : 'Запустить'}</Button>
                            <Button size="sm" onClick={() => void checkSolution()} disabled={running || !query.trim()}><CheckCircle2 data-icon="inline-start" aria-hidden="true" />{running ? 'Проверяем…' : 'Проверить'}</Button>
                        </div>
                    </div>

                    <div
                        className="min-h-0 min-w-0 shrink-0 overflow-auto"
                        style={{ height: `${editorHeight}px` }}
                    >
                        <SqlEditor value={query} onChange={setQuery} onRun={run} />
                    </div>

                    <div
                        role="separator"
                        aria-label="Изменить высоту редактора и результата"
                        aria-orientation="horizontal"
                        aria-valuenow={editorHeight}
                        tabIndex={0}
                        className="group relative z-10 flex h-2 shrink-0 cursor-row-resize touch-none items-center justify-center border-y border-border bg-muted/30 hover:bg-primary/10 active:bg-primary/20"
                        onPointerDown={handleResizeStart}
                        onPointerMove={handleResizeMove}
                        onPointerUp={handleResizeEnd}
                        onPointerCancel={handleResizeEnd}
                        onLostPointerCapture={handleResizeEnd}
                        onKeyDown={(e) => {
                            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                                e.preventDefault();
                                setEditorHeight((height) => {
                                    const available = (workspaceRef.current?.clientHeight ?? 600) - 210;
                                    const maxHeight = Math.max(120, available);
                                    return Math.max(
                                        120,
                                        Math.min(height + (e.key === 'ArrowUp' ? -20 : 20), maxHeight),
                                    );
                                });
                            }
                        }}
                    >
                        <div className="h-1 w-12 rounded-full bg-muted-foreground/30 transition-colors group-hover:bg-primary/60" />
                    </div>

                    <div className="min-h-40 min-w-0 flex-1 overflow-hidden">
                        <ResultsPanel result={result} running={running} />
                    </div>

                    {solved && (
                        <div className="flex shrink-0 items-center justify-between gap-4 border-t border-primary/30 bg-primary/10 px-4 py-3">
                            <p className="flex items-center gap-2 text-sm font-medium">
                                <CheckCircle2 className="size-4 text-primary" />
                                Задание решено! Прогресс сохранён.
                            </p>
                            {nextStep && (
                                <Button size="sm" disabled={!nextStep.unlocked} onClick={() => openStep(nextStep)}>
                                    {nextStep.type === 'LECTURE' ? 'Следующая лекция' : 'Следующее задание'}
                                    <ArrowRight data-icon="inline-end" />
                                </Button>
                            )}
                        </div>
                    )}
                </section>

                <aside className="flex min-h-0 min-w-0 flex-col overflow-hidden border-t border-border bg-card/30 lg:border-l lg:border-t-0">
                    <AiHelper key={exercise.id} exerciseId={exercise.id} exerciseTitle={exercise.title} lastResult={result} query={query} />
                </aside>
            </div>
        </div>
    );
}
