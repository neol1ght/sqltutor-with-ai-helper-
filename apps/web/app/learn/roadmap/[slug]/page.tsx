'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Circle, Clock3, Code2, LockKeyhole, Route } from 'lucide-react';
import { getRoadmap, type RoadmapResponse } from '@/lib/api/learning-content';

export default function LearningRoadmapPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [data, setData] = useState<RoadmapResponse | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setData(await getRoadmap(slug)); }
    catch (e) { setError(e instanceof Error ? e.message : 'Не удалось загрузить роадмап.'); }
    finally { setLoading(false); }
  }, [slug]);

  useEffect(() => { void load(); }, [load]);

  return <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-8">
    <Link href="/learn/roadmap" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Все роадмапы</Link>
    {loading ? <p className="py-16 text-center text-sm text-muted-foreground">Строим твой маршрут…</p> : error ? <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}<button onClick={() => void load()} className="ml-3 underline">Повторить</button></div> : data && <>
      <div className="mt-6 rounded-2xl border border-border bg-card p-5 sm:p-7"><div className="flex items-center gap-2 text-sm text-primary"><Route className="size-4" />ТВОЙ УЧЕБНЫЙ МАРШРУТ</div><h1 className="mt-2 text-3xl font-semibold tracking-tight">{data.learningCase.title}</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">{data.learningCase.description || 'Проходи этапы по порядку: изучай материал, отвечай на вопросы и закрепляй знания на практике.'}</p><div className="mt-5 flex items-center justify-between text-sm"><span className="text-muted-foreground">Пройдено {data.progress.completed} из {data.progress.total} этапов</span><span className="font-semibold">{data.progress.percent}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${data.progress.percent}%` }} /></div></div>
      <div className="relative mt-7 space-y-3">
        <div className="absolute bottom-8 left-[23px] top-8 w-px bg-border sm:left-[27px]" />
        {data.nodes.map((node, index) => {
          const href = node.type === 'LECTURE' && node.lecture ? `/learn/lecture/${node.lecture.slug}?case=${slug}` : node.type === 'EXERCISE' && node.exercise ? `/learn/lesson?exerciseId=${node.exercise.id}` : '#';
          const canOpen = node.unlocked && Boolean(node.lecture || node.exercise);
          return <article key={node.id} className={`relative flex gap-4 rounded-2xl border p-4 sm:gap-5 sm:p-5 ${node.completed ? 'border-primary/30 bg-primary/[0.04]' : canOpen ? 'border-border bg-card' : 'border-border/60 bg-muted/20 opacity-75'}`}>
            <div className={`z-10 flex size-12 shrink-0 items-center justify-center rounded-full border ${node.completed ? 'border-primary bg-primary text-primary-foreground' : canOpen ? 'border-primary/40 bg-background text-primary' : 'border-border bg-muted text-muted-foreground'}`}>{node.completed ? <CheckCircle2 className="size-5" /> : !canOpen ? <LockKeyhole className="size-5" /> : node.type === 'LECTURE' ? <BookOpen className="size-5" /> : <Code2 className="size-5" />}</div>
            <div className="min-w-0 flex-1 pt-0.5"><div className="flex flex-wrap items-center gap-2"><span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Этап {index + 1}</span><span className="rounded-full bg-muted px-2 py-0.5 text-xs">{node.type === 'LECTURE' ? 'Лекция' : 'Практика'}</span>{node.completed && <span className="text-xs font-medium text-primary">Пройдено</span>}</div><h2 className="mt-1 text-base font-semibold sm:text-lg">{node.title}</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">{node.description || (node.type === 'LECTURE' ? 'Разберись в теме и проверь понимание на интерактивном вопросе.' : 'Закрепи тему, написав и проверив SQL-запрос.')}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">{node.lecture && <span className="inline-flex items-center gap-1"><Clock3 className="size-3.5" />{node.lecture.estimatedMinutes} мин.</span>}{!canOpen && <span className="inline-flex items-center gap-1"><LockKeyhole className="size-3.5" />Сначала пройди предыдущий этап</span>}</div>
            </div>
            <div className="self-center">{canOpen ? <Link href={href} className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground sm:text-sm">{node.completed ? 'Повторить' : 'Начать'}<ArrowRight className="size-4" /></Link> : <Circle className="mr-1 size-4 text-muted-foreground" />}</div>
          </article>;
        })}
        {!data.nodes.length && <div className="rounded-xl border border-dashed border-border p-8 text-center"><h2 className="font-semibold">Роадмап пока пуст</h2><p className="mt-2 text-sm text-muted-foreground">Администратор ещё не добавил этапы в этот учебный блок.</p></div>}
      </div>
    </>}
  </main>;
}
