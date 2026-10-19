import { getAccessToken, refreshAccessToken } from '@/lib/auth/session';

const API_URL =
    process.env.NEXT_PUBLIC_API_URL ??
    'http://localhost:3500';

export type LearningCase = {
    id: string;
    title: string;
    slug: string;
    description: string;
    difficulty: string;
    databaseName: string;
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
};

export type Exercise = {
    id: string;
    caseId: string;
    title: string;
    description: string;
    difficulty: string;
    sortOrder: number;
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
};

function getErrorMessage(
    error: unknown,
): string {
    if (
        typeof error === 'object' &&
        error !== null &&
        'message' in error
    ) {
        const message = (
            error as { message: unknown }
        ).message;

        if (Array.isArray(message)) {
            return message.join(', ');
        }

        if (typeof message === 'string') {
            return message;
        }
    }

    return 'Не удалось загрузить данные.';
}

async function request<T>(
    endpoint: string,
    options?: RequestInit,
    accessToken?: string | null,
): Promise<T> {
    const response = await fetch(
        `${API_URL}${endpoint}`,
        {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(accessToken
                    ? {
                        Authorization: `Bearer ${accessToken}`,
                    }
                    : {}),
                ...options?.headers,
            },
        },
    );

    const data = await response
        .json()
        .catch(() => null);

    if (!response.ok) {
        throw new Error(
            getErrorMessage(data),
        );
    }

    return data as T;
}

export async function getCases(): Promise<
    LearningCase[]
> {
    return request<LearningCase[]>('/cases');
}

export async function getCaseBySlug(
    slug: string,
): Promise<LearningCase> {
    return request<LearningCase>(
        `/cases/${encodeURIComponent(slug)}`,
    );
}

export async function getExercisesByCaseSlug(
    slug: string,
): Promise<Exercise[]> {
    return request<Exercise[]>(
        `/cases/${encodeURIComponent(slug)}/exercises`,
    );
}

export async function getExerciseById(
    id: string,
): Promise<Exercise & {
    learningCase: {
        id: string;
        title: string;
        slug: string;
        difficulty: string;
    };
}> {
    return request<
        Exercise & {
        learningCase: {
            id: string;
            title: string;
            slug: string;
            difficulty: string;
        };
    }
    >(
        `/exercises/${encodeURIComponent(id)}`,
    );
}

/**
 * Загружает кейсы и количество опубликованных
 * заданий для каждого кейса.
 */
export async function getCasesWithExercises() {
    const cases = await getCases();

    const casesWithExercises =
        await Promise.all(
            cases.map(async (learningCase) => {
                try {
                    const exercises =
                        await getExercisesByCaseSlug(
                            learningCase.slug,
                        );

                    return {
                        ...learningCase,
                        exercisesCount:
                        exercises.length,
                    };
                } catch {
                    return {
                        ...learningCase,
                        exercisesCount: 0,
                    };
                }
            }),
        );

    return casesWithExercises;
}

/**
 * Вспомогательная функция для защищённых
 * запросов в будущем.
 */
export async function authenticatedRequest<T>(
    endpoint: string,
    options?: RequestInit,
): Promise<T> {
    let accessToken = getAccessToken();

    if (!accessToken) {
        accessToken =
            await refreshAccessToken();
    }

    if (!accessToken) {
        throw new Error(
            'Необходимо войти в аккаунт.',
        );
    }

    try {
        return await request<T>(
            endpoint,
            options,
            accessToken,
        );
    } catch (error) {
        const newAccessToken =
            await refreshAccessToken();

        if (!newAccessToken) {
            throw error;
        }

        return request<T>(
            endpoint,
            options,
            newAccessToken,
        );
    }
}