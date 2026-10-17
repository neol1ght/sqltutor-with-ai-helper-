'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { BookOpen, Plus, Save, Trash2, Route, Pencil, RefreshCw } from 'lucide-react';
import {
  createAdminLecture, createAdminPathNode, deleteAdminLecture, deleteAdminPathNode,
  getAdminLectures, getAdminPathNodes, getContentCases, getContentExercises,
  updateAdminLecture, updateAdminPathNode,
  type AdminLecture, type AdminNode, type ContentCase, type ContentExercise, type LectureBlock,
} from '@/lib/api/admin/learning-content';

const DEFAULT_BLOCKS: LectureBlock[] = [
  { type: 'text', title: 'Зачем это нужно?', body: 'Объясните задачу и приведите короткий пример из реальной работы с данными.' },
  { type: 'code', title: 'Пример SQL', language: 'sql', code: 'SELECT category, COUNT(*) AS products_count\nFROM products\nGROUP BY category;' },
  { type: 'quiz', title: 'Проверьте себя', body: 'Что делает GROUP BY?', options: ['Сортирует строки', 'Объединяет строки в группы для агрегатных вычислений', 'Удаляет дубликаты'], correctOption: 1, explanation: 'GROUP BY группирует строки с одинаковыми значениями, чтобы к группам можно было применять COUNT, SUM, AVG и другие агрегаты.' },
];

const EMPTY_LECTURE = { slug: '', title: '', summary: '', estimatedMinutes: 10, difficulty: 'EASY', isPublished: false, contentText: JSON.stringify(DEFAULT_BLOCKS, null, 2) };
const EMPTY_NODE = { caseId: '', type: 'LECTURE' as 'LECTURE' | 'EXERCISE', title: '', description: '', sortOrder: 1, lectureId: '', exerciseId: '', isPublished: false };

function message(error: unknown) {
  return error instanceof Error ? error.message : 'Не удалось выполнить запрос';
}

export function LearningContentManager() {
  const [tab, setTab] = useState<'lectures' | 'roadmap'>('lectures');
  const [lectures, setLectures] = useState<AdminLecture[]>([]);
  const [nodes, setNodes] = useState<AdminNode[]>([]);
  const [cases, setCases] = useState<ContentCase[]>([]);
  const [exercises, setExercises] = useState<ContentExercise[]>([]);
  const [lectureForm, setLectureForm] = useState(EMPTY_LECTURE);
  const [nodeForm, setNodeForm] = useState(EMPTY_NODE);
  const [editingLecture, setEditingLecture] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setBusy(true); setError('');
    try {
      const [l, n, c, e] = await Promise.all([getAdminLectures(), getAdminPathNodes(), getContentCases(), getContentExercises()]);
      setLectures(l); setNodes(n); setCases(c); setExercises(e);
      setNodeForm((prev) => ({ ...prev, caseId: prev.caseId || c[0]?.id || '' }));
    } catch (err) { setError(message(err)); }
    finally { setBusy(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filteredExercises = useMemo(() => exercises.filter((e) => !nodeForm.caseId || e.caseId === nodeForm.caseId), [exercises, nodeForm.caseId]);

  function startEditLecture(lecture: AdminLecture) {
    setEditingLecture(lecture.id);
    setLectureForm({
      slug: lecture.slug, title: lecture.title, summary: lecture.summary ?? '',
      estimatedMinutes: lecture.estimatedMinutes, difficulty: lecture.difficulty,
      isPublished: lecture.isPublished, contentText: JSON.stringify(lecture.content, null, 2),
    });
    setNotice(''); setError('');
  }

  async function saveLecture() {
    setError(''); setNotice('');
    let content: LectureBlock[];
    try {
      content = JSON.parse(lectureForm.contentText);
      if (!Array.isArray(content)) throw new Error('Содержимое должно быть JSON-массивом блоков.');
      const allowed = ['text', 'code', 'callout', 'quiz'];
      if (content.some((block) => !block || !allowed.includes(block.type))) throw new Error('Тип блока должен быть text, code, callout или quiz.');
    } catch (err) { setError(`Проверь содержимое лекции: ${message(err)}`); return; }
    if (!lectureForm.slug.trim() || !lectureForm.title.trim()) { setError('Укажи slug и название лекции.'); return; }
    setBusy(true);
    try {
      const payload = {
        slug: lectureForm.slug.trim(), title: lectureForm.title.trim(), summary: lectureForm.summary.trim() || undefined,
        estimatedMinutes: Number(lectureForm.estimatedMinutes), difficulty: lectureForm.difficulty,
        isPublished: lectureForm.isPublished, content,
      };
      if (editingLecture) await updateAdminLecture(editingLecture, payload);
      else await createAdminLecture(payload);
      setLectureForm(EMPTY_LECTURE); setEditingLecture(null); setNotice('Лекция сохранена.'); await load();
    } catch (err) { setError(message(err)); }
    finally { setBusy(false); }
  }

  async function removeLecture(lecture: AdminLecture) {
    if (!window.confirm(`Удалить лекцию «${lecture.title}»? Этапы роадмапа, связанные с ней, также будут удалены.`)) return;
    try { await deleteAdminLecture(lecture.id); if (editingLecture === lecture.id) { setEditingLecture(null); setLectureForm(EMPTY_LECTURE); } setNotice('Лекция удалена.'); await load(); }
    catch (err) { setError(message(err)); }
  }

  function startEditNode(node: AdminNode) {
    setEditingNode(node.id);
    setNodeForm({
      caseId: node.caseId, type: node.type, title: node.title, description: node.description ?? '',
      sortOrder: node.sortOrder, lectureId: node.lectureId ?? '', exerciseId: node.exerciseId ?? '', isPublished: node.isPublished,
    });
    setNotice(''); setError('');
  }

  async function saveNode() {
    setError(''); setNotice('');
    if (!nodeForm.caseId || !nodeForm.title.trim()) { setError('Выбери учебный блок и укажи название этапа.'); return; }
    if (nodeForm.type === 'LECTURE' && !nodeForm.lectureId) { setError('Выбери лекцию для этапа.'); return; }
    if (nodeForm.type === 'EXERCISE' && !nodeForm.exerciseId) { setError('Выбери упражнение для этапа.'); return; }
    setBusy(true);
    try {
      const payload = {
        caseId: nodeForm.caseId, type: nodeForm.type, title: nodeForm.title.trim(),
        description: nodeForm.description.trim() || undefined, sortOrder: Number(nodeForm.sortOrder),
        lectureId: nodeForm.type === 'LECTURE' ? nodeForm.lectureId : undefined,
        exerciseId: nodeForm.type === 'EXERCISE' ? nodeForm.exerciseId : undefined,
        isPublished: nodeForm.isPublished,
      };
      if (editingNode) await updateAdminPathNode(editingNode, payload);
      else await createAdminPathNode(payload);
      setEditingNode(null); setNodeForm({ ...EMPTY_NODE, caseId: cases[0]?.id ?? '' }); setNotice('Этап роадмапа сохранён.'); await load();
    } catch (err) { setError(message(err)); }
    finally { setBusy(false); }
  }

  async function removeNode(node: AdminNode) {
    if (!window.confirm(`Удалить этап «${node.title}»?`)) return;
    try { await deleteAdminPathNode(node.id); if (editingNode === node.id) setEditingNode(null); setNotice('Этап удалён.'); await load(); }
    catch (err) { setError(message(err)); }
  }

  const inputClass = 'mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary';
  const labelClass = 'block text-xs font-medium text-muted-foreground';

  return <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-8">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><p className="text-sm text-muted-foreground">Конструктор учебного контента</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Лекции и роадмапы</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Создавай интерактивные лекции и связывай их с курсами и упражнениями на карте обучения.</p></div>
      <button onClick={() => void load()} disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted disabled:opacity-50"><RefreshCw className="size-4" />Обновить</button>
    </div>
    <div className="mt-6 flex gap-2 border-b border-border">
      <button onClick={() => setTab('lectures')} className={`px-4 py-3 text-sm ${tab === 'lectures' ? 'border-b-2 border-primary font-semibold' : 'text-muted-foreground'}`}><BookOpen className="mr-2 inline size-4" />Лекции</button>
      <button onClick={() => setTab('roadmap')} className={`px-4 py-3 text-sm ${tab === 'roadmap' ? 'border-b-2 border-primary font-semibold' : 'text-muted-foreground'}`}><Route className="mr-2 inline size-4" />Этапы роадмапа</button>
    </div>
    {error && <p role="alert" className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
    {notice && <p role="status" className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">{notice}</p>}

    {tab === 'lectures' ? <div className="mt-5 grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(340px,0.9fr)]">
      <section className="space-y-3">
        <div className="flex items-center justify-between"><h2 className="font-semibold">Все лекции <span className="text-muted-foreground">({lectures.length})</span></h2><button onClick={() => { setEditingLecture(null); setLectureForm(EMPTY_LECTURE); }} className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground"><Plus className="size-4" />Новая</button></div>
        {lectures.map((lecture) => <article key={lecture.id} className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-medium">{lecture.title}</h3><span className={`rounded-full px-2 py-0.5 text-xs ${lecture.isPublished ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>{lecture.isPublished ? 'Опубликована' : 'Черновик'}</span></div><p className="mt-1 text-xs text-muted-foreground">/{lecture.slug} · {lecture.estimatedMinutes} мин. · {lecture._count?.roadmapNodes ?? 0} этапов</p><p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{lecture.summary || 'Без описания'}</p></div><div className="flex gap-1"><button aria-label="Редактировать" onClick={() => startEditLecture(lecture)} className="rounded-md p-2 hover:bg-muted"><Pencil className="size-4" /></button><button aria-label="Удалить" onClick={() => void removeLecture(lecture)} className="rounded-md p-2 text-destructive hover:bg-destructive/10"><Trash2 className="size-4" /></button></div></div>
        </article>)}
        {!lectures.length && <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Пока нет лекций. Создай первую справа.</p>}
      </section>
      <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
        <h2 className="font-semibold">{editingLecture ? 'Редактировать лекцию' : 'Новая лекция'}</h2>
        <div className="mt-4 space-y-3">
          <label className={labelClass}>Slug<input className={inputClass} value={lectureForm.slug} onChange={(e) => setLectureForm({ ...lectureForm, slug: e.target.value })} placeholder="group-by-basics" /></label>
          <label className={labelClass}>Название<input className={inputClass} value={lectureForm.title} onChange={(e) => setLectureForm({ ...lectureForm, title: e.target.value })} placeholder="Группировка данных" /></label>
          <label className={labelClass}>Краткое описание<textarea className={inputClass} rows={2} value={lectureForm.summary} onChange={(e) => setLectureForm({ ...lectureForm, summary: e.target.value })} /></label>
          <div className="grid grid-cols-2 gap-3"><label className={labelClass}>Минут<input type="number" min={1} max={240} className={inputClass} value={lectureForm.estimatedMinutes} onChange={(e) => setLectureForm({ ...lectureForm, estimatedMinutes: Number(e.target.value) })} /></label><label className={labelClass}>Сложность<select className={inputClass} value={lectureForm.difficulty} onChange={(e) => setLectureForm({ ...lectureForm, difficulty: e.target.value })}><option value="EASY">Начальная</option><option value="MEDIUM">Средняя</option><option value="HARD">Продвинутая</option></select></label></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={lectureForm.isPublished} onChange={(e) => setLectureForm({ ...lectureForm, isPublished: e.target.checked })} />Опубликовать лекцию</label>
          <label className={labelClass}>Содержимое (JSON-блоки)<textarea spellCheck={false} className={`${inputClass} min-h-72 font-mono text-xs leading-relaxed`} value={lectureForm.contentText} onChange={(e) => setLectureForm({ ...lectureForm, contentText: e.target.value })} /></label>
          <p className="text-xs leading-relaxed text-muted-foreground">Типы блоков: text, code, callout, quiz. Вопрос quiz использует options, correctOption (индекс с нуля) и explanation.</p>
          <div className="flex gap-2"><button onClick={() => void saveLecture()} disabled={busy} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground disabled:opacity-50"><Save className="size-4" />{busy ? 'Сохраняем…' : 'Сохранить'}</button>{editingLecture && <button onClick={() => { setEditingLecture(null); setLectureForm(EMPTY_LECTURE); }} className="rounded-lg border border-border px-3 py-2 text-sm">Отмена</button>}</div>
        </div>
      </section>
    </div> : <div className="mt-5 grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(340px,0.9fr)]">
      <section className="space-y-3"><div className="flex items-center justify-between"><h2 className="font-semibold">Этапы обучения <span className="text-muted-foreground">({nodes.length})</span></h2><button onClick={() => { setEditingNode(null); setNodeForm({ ...EMPTY_NODE, caseId: cases[0]?.id ?? '' }); }} className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground"><Plus className="size-4" />Новый этап</button></div>
        {nodes.map((node) => <article key={node.id} className="rounded-xl border border-border bg-card p-4"><div className="flex items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-medium">{node.title}</h3><span className="rounded-full bg-muted px-2 py-0.5 text-xs">{node.type === 'LECTURE' ? 'Лекция' : 'Практика'}</span><span className={`rounded-full px-2 py-0.5 text-xs ${node.isPublished ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>{node.isPublished ? 'Опубликован' : 'Черновик'}</span></div><p className="mt-1 text-xs text-muted-foreground">{node.learningCase?.title ?? 'Учебный блок'} · этап {node.sortOrder} · {node.lecture?.title ?? node.exercise?.title ?? 'Материал не выбран'}</p></div><div className="flex gap-1"><button aria-label="Редактировать" onClick={() => startEditNode(node)} className="rounded-md p-2 hover:bg-muted"><Pencil className="size-4" /></button><button aria-label="Удалить" onClick={() => void removeNode(node)} className="rounded-md p-2 text-destructive hover:bg-destructive/10"><Trash2 className="size-4" /></button></div></div></article>)}
        {!nodes.length && <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Этапов пока нет. Создай этап справа.</p>}
      </section>
      <section className="rounded-2xl border border-border bg-card p-4 sm:p-5"><h2 className="font-semibold">{editingNode ? 'Редактировать этап' : 'Новый этап роадмапа'}</h2><div className="mt-4 space-y-3">
        <label className={labelClass}>Учебный блок<select className={inputClass} value={nodeForm.caseId} onChange={(e) => setNodeForm({ ...nodeForm, caseId: e.target.value, exerciseId: '' })}><option value="">Выбери блок</option>{cases.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select></label>
        <label className={labelClass}>Тип этапа<select className={inputClass} value={nodeForm.type} onChange={(e) => setNodeForm({ ...nodeForm, type: e.target.value as 'LECTURE' | 'EXERCISE', lectureId: '', exerciseId: '' })}><option value="LECTURE">Лекция</option><option value="EXERCISE">Практическое задание</option></select></label>
        <label className={labelClass}>Название этапа<input className={inputClass} value={nodeForm.title} onChange={(e) => setNodeForm({ ...nodeForm, title: e.target.value })} /></label>
        <label className={labelClass}>Описание<textarea className={inputClass} rows={2} value={nodeForm.description} onChange={(e) => setNodeForm({ ...nodeForm, description: e.target.value })} /></label>
        <label className={labelClass}>Порядок этапа<input type="number" min={1} className={inputClass} value={nodeForm.sortOrder} onChange={(e) => setNodeForm({ ...nodeForm, sortOrder: Number(e.target.value) })} /></label>
        {nodeForm.type === 'LECTURE' ? <label className={labelClass}>Лекция<select className={inputClass} value={nodeForm.lectureId} onChange={(e) => setNodeForm({ ...nodeForm, lectureId: e.target.value })}><option value="">Выбери лекцию</option>{lectures.map((l) => <option key={l.id} value={l.id}>{l.title}{l.isPublished ? '' : ' (черновик)'}</option>)}</select></label> : <label className={labelClass}>Упражнение<select className={inputClass} value={nodeForm.exerciseId} onChange={(e) => setNodeForm({ ...nodeForm, exerciseId: e.target.value })}><option value="">Выбери упражнение</option>{filteredExercises.map((e) => <option key={e.id} value={e.id}>{e.title}{e.isPublished ? '' : ' (черновик)'}</option>)}</select></label>}
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={nodeForm.isPublished} onChange={(e) => setNodeForm({ ...nodeForm, isPublished: e.target.checked })} />Опубликовать этап</label>
        <div className="flex gap-2"><button onClick={() => void saveNode()} disabled={busy} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground disabled:opacity-50"><Save className="size-4" />Сохранить этап</button>{editingNode && <button onClick={() => { setEditingNode(null); setNodeForm({ ...EMPTY_NODE, caseId: cases[0]?.id ?? '' }); }} className="rounded-lg border border-border px-3 py-2 text-sm">Отмена</button>}</div>
      </div></section>
    </div>}
  </main>;
}
