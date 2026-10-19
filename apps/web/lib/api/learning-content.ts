const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3500/api').replace(/\/$/, '');
const TOKEN_KEY = 'sqltutor_access_token';

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
  if (!token) throw new Error('Войдите в аккаунт, чтобы продолжить обучение.');
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...init.headers },
    cache: 'no-store',
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const msg = data?.message;
    throw new Error(Array.isArray(msg) ? msg.join(', ') : msg || `Ошибка API (${response.status})`);
  }
  return data as T;
}

export type RoadmapNode = {
  id: string; type: 'LECTURE' | 'EXERCISE'; title: string; description: string | null;
  sortOrder: number; unlocked: boolean; completed: boolean;
  lecture: { id: string; slug: string; title: string; estimatedMinutes: number; difficulty: string } | null;
  exercise: { id: string; title: string; difficulty: string } | null;
};
export type RoadmapResponse = {
  learningCase: { id: string; slug: string; title: string; description: string | null; difficulty: string };
  nodes: RoadmapNode[];
  progress: { completed: number; total: number; percent: number };
};
export type LectureBlock = {
  id?: string; type: 'text' | 'code' | 'callout' | 'quiz' | 'video'; title?: string; body?: string;
  code?: string; language?: string; options?: string[]; correctOption?: number; explanation?: string;
  url?: string;
};
export type LectureResponse = {
  id: string; slug: string; title: string; summary: string | null; content: LectureBlock[];
  estimatedMinutes: number; difficulty: string; progress: { lastPosition: number; completedAt: string | null };
};
export type ContinueResponse = {
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'EMPTY';
  learningCase: { slug: string; title: string } | null;
  node: {
    type: 'LECTURE' | 'EXERCISE';
    title: string;
    lectureSlug: string | null;
    exerciseId: string | null;
  } | null;
  progress: { completed: number; total: number; percent: number } | null;
};
export const getRoadmap = (slug: string) => request<RoadmapResponse>(`/learning-paths/${encodeURIComponent(slug)}`);
export const getContinue = () => request<ContinueResponse>('/learning-paths/continue');
export const getLecture = (slug: string) => request<LectureResponse>(`/lectures/${encodeURIComponent(slug)}`);
export const saveLectureProgress = (id: string, body: { lastPosition?: number; completed?: boolean }) =>
  request(`/lectures/${encodeURIComponent(id)}/progress`, { method: 'PATCH', body: JSON.stringify(body) });
