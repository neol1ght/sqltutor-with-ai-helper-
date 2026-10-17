'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Route } from 'lucide-react';

export default function RoadmapIndexPage() {
  const [cases, setCases] = useState<{ id: string; title: string; slug: string; isPublished: boolean }[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const api = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3500/api').replace(/\/$/, '');
        const response = await fetch(`${api}/cases`, { cache: 'no-store' });
        if (!response.ok) throw new Error('Не удалось загрузить курсы.');
        const data = await response.json();
        if (!cancelled) setCases(Array.isArray(data) ? data : []);
      } catch (e) { if (!cancelled) setError(e instanceof Error ? e.message : 'Ошибка загрузки'); }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  return <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-8">
    <div className="flex items-center gap-3"><span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Route className="size-6" /></span><div><p className="text-sm text-muted-foreground">Твой маршрут обучения</p><h1 className="text-3xl font-semibold tracking-tight">Роадмапы курсов</h1></div></div>
    <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">Выбери учебный блок и двигайся по этапам: короткие лекции, интерактивные вопросы и SQL-практика. Прогресс сохраняется в твоём аккаунте.</p>
    {error && <p role="alert" className="mt-5 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</p>}
    {loading ? <p className="mt-8 text-sm text-muted-foreground">Загружаем курсы…</p> : <div className="mt-7 grid gap-4 sm:grid-cols-2">{cases.map((item, i) => <Link key={item.id} href={`/learn/roadmap/${item.slug}`} className="group rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"><span className={`flex size-10 items-center justify-center rounded-xl ${i % 2 ? 'bg-ai/10 text-ai' : 'bg-primary/10 text-primary'}`}><BookOpen className="size-5" /></span><h2 className="mt-4 text-lg font-semibold">{item.title}</h2><p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{item.slug ? `Учебный маршрут: ${item.slug}` : 'Учебный маршрут'}{item.isPublished ? '' : ' · черновик'}</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary">Открыть роадмап <ArrowRight className="size-4 transition group-hover:translate-x-1" /></span></Link>)}</div>}
  </main>;
}
