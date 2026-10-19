const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3500/api').replace(/\/$/, '');
const TOKEN_KEY = 'sqltutor_access_token';

export type LectureBlock = {
  id?: string;
  type: 'text' | 'code' | 'callout' | 'quiz' | 'video';
  title?: string;
  body?: string;
  code?: string;
  language?: string;
  options?: string[];
  correctOption?: number;
  explanation?: string;
  url?: string;
};

export type AdminLecture = {
  id: string; slug: string; title: string; summary: string | null;
  content: LectureBlock[]; estimatedMinutes: number; difficulty: string;
  isPublished: boolean; createdAt: string; updatedAt: string;
  _count?: { roadmapNodes: number; progress: number };
};

export type AdminNode = {
  id: string; caseId: string; type: 'LECTURE' | 'EXERCISE'; title: string;
  description: string | null; sortOrder: number; lectureId: string | null;
  exerciseId: string | null; isPublished: boolean;
  learningCase?: { id: string; title: string; slug: string };
  lecture?: { id: string; title: string; slug?: string; isPublished?: boolean } | null;
  exercise?: { id: string; title: string; isPublished?: boolean } | null;
};

export type ContentCase = { id: string; title: string; slug: string; isPublished: boolean };
export type ContentExercise = { id: string; caseId: string; title: string; isPublished: boolean; sortOrder: number };

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
  if (!token) throw new Error('Войдите в аккаунт администратора.');
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
    cache: 'no-store',
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data?.message;
    throw new Error(Array.isArray(message) ? message.join(', ') : message || `Ошибка API (${response.status})`);
  }
  return data as T;
}

export const getAdminLectures = () => request<AdminLecture[]>('/admin/lectures');
export const createAdminLecture = (payload: Partial<AdminLecture>) =>
  request<AdminLecture>('/admin/lectures', { method: 'POST', body: JSON.stringify(payload) });
export const updateAdminLecture = (id: string, payload: Partial<AdminLecture>) =>
  request<AdminLecture>(`/admin/lectures/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
export const deleteAdminLecture = (id: string) =>
  request<{ success: boolean }>(`/admin/lectures/${id}`, { method: 'DELETE' });

export const getAdminPathNodes = () => request<AdminNode[]>('/admin/learning-path-nodes');
export const createAdminPathNode = (payload: Partial<AdminNode>) =>
  request<AdminNode>('/admin/learning-path-nodes', { method: 'POST', body: JSON.stringify(payload) });
export const updateAdminPathNode = (id: string, payload: Partial<AdminNode>) =>
  request<AdminNode>(`/admin/learning-path-nodes/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
export const deleteAdminPathNode = (id: string) =>
  request<{ success: boolean }>(`/admin/learning-path-nodes/${id}`, { method: 'DELETE' });


export const getContentCases = async () => {
  const cases = await request<ContentCase[]>('/cases');

  console.table(
      cases.map((item) => ({
        id: item.id,
        title: item.title,
        slug: item.slug,
        isUuid:
            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
                item.id,
            ),
      })),
  );

  return cases;
};

export const getContentExercises = async () => {
  const cases = await getContentCases();
  const groups = await Promise.all(cases.map(async (c) => {
    const response = await fetch(`${API_URL}/cases/${encodeURIComponent(c.slug)}/exercises`, { cache: 'no-store' });
    if (!response.ok) return [];
    return await response.json() as ContentExercise[];
  }));
  return groups.flat();
};
