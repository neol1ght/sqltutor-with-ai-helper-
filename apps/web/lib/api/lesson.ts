'use client';

const API_URL = (
    process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3500/api'
).replace(/\/$/, '');

const TOKEN_KEY = 'sqltutor_access_token';

export type LessonCase = {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    difficulty: string;
    databaseName: string;
    isPublished: boolean;
};

export type LessonExercise = {
    id: string;
    caseId: string;
    title: string;
    description: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD' | string;
    sortOrder: number;
    isPublished: boolean;
    learningCase?: {
        id: string;
        title: string;
        slug: string;
        difficulty?: string;
    };
};

export type SqlApiResult = {
    success: boolean;
    isCorrect?: boolean;
    rows?: Record<string, unknown>[];
    columns?: string[];
    rowCount?: number | null;
    submissionId?: string;
    error?: { message?: string; code?: string | null };
    unlockedAchievements?: Array<{
        code: string;
        title: string;
        description: string;
        icon: string | null;
        unlockedAt?: string;
    }>;
};

export type AiChatResult = {
    conversationId: string;
    message: string;
};

async function request<T>(
    path: string,
    init?: RequestInit,
    token?: string | null,
): Promise<T> {
    const response = await fetch(`${API_URL}${path}`, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...init?.headers,
        },
        cache: 'no-store',
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
        const message = data?.message;
        throw new Error(
            Array.isArray(message)
                ? message.join(', ')
                : message || `Ошибка API (${response.status})`,
        );
    }
    return data as T;
}

function requireToken(): string {
    if (typeof window === 'undefined') {
        throw new Error('Авторизация доступна только в браузере.');
    }
    const token = window.localStorage.getItem(TOKEN_KEY);
    if (!token) {
        throw new Error('Войдите в аккаунт, чтобы проверить и сохранить решение.');
    }
    return token;
}

export async function getLessonCases(): Promise<LessonCase[]> {
    return request<LessonCase[]>('/cases');
}

export async function getLessonExercises(slug: string): Promise<LessonExercise[]> {
    return request<LessonExercise[]>(`/cases/${encodeURIComponent(slug)}/exercises`);
}

export async function getLessonExercise(id: string): Promise<LessonExercise> {
    return request<LessonExercise>(`/exercises/${encodeURIComponent(id)}`);
}

export async function getFirstLessonExercise(): Promise<LessonExercise> {
    const cases = await getLessonCases();
    for (const learningCase of cases) {
        const exercises = await getLessonExercises(learningCase.slug);
        const first = [...exercises]
            .filter((exercise) => exercise.isPublished !== false)
            .sort((a, b) => a.sortOrder - b.sortOrder)[0];
        if (first) {
            return {
                ...first,
                learningCase: first.learningCase ?? {
                    id: learningCase.id,
                    title: learningCase.title,
                    slug: learningCase.slug,
                    difficulty: learningCase.difficulty,
                },
            };
        }
    }
    throw new Error('Пока нет опубликованных заданий. Опубликуйте хотя бы одно задание в панели администратора.');
}

/** Выполняет SQL и возвращает строки, не проверяя решение и не сохраняя попытку. */
export async function executeLessonSql(exerciseId: string, query: string): Promise<SqlApiResult> {
    return request<SqlApiResult>(`/exercises/${encodeURIComponent(exerciseId)}/execute`, {
        method: 'POST',
        body: JSON.stringify({ query }),
    });
}

/** Проверяет ответ, сохраняет попытку и обновляет прогресс пользователя. */
export async function submitLessonSql(exerciseId: string, query: string): Promise<SqlApiResult> {
    const token = requireToken();
    return request<SqlApiResult>(`/exercises/${encodeURIComponent(exerciseId)}/submit`, {
        method: 'POST',
        body: JSON.stringify({ query }),
    }, token);
}

export async function sendLessonAiMessage(input: {
    message: string;
    exerciseId: string;
    conversationId?: string;
    query?: string;
    executionResult?: string;
}): Promise<AiChatResult> {
    const token = requireToken();
    return request<AiChatResult>('/ai/chat', {
        method: 'POST',
        body: JSON.stringify(input),
    }, token);
}
