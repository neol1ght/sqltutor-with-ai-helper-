import type { AuthUser } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
    throw new Error(
        'NEXT_PUBLIC_API_URL не задан в переменных окружения',
    );
}

export type ProfileResponse = {
    user: AuthUser;

    stats: {
        streakDays: number;
        solvedExercises: number;
        totalAttempts: number;
        accuracy: number;
    };

    courses: {
        id: string;
        title: string;
        slug: string;
        totalExercises: number;
        solvedExercises: number;
        percent: number;
    }[];

    achievements: {
        id: string;
        code: string;
        title: string;
        description: string;
        icon: string | null;
        unlockedAt: string;
    }[];

    recentSubmissions: {
        id: string;
        exerciseId: string;
        exerciseTitle: string;
        caseTitle: string;
        caseSlug: string;
        isCorrect: boolean;
        executionTimeMs: number | null;
        createdAt: string;
    }[];
};

export type UpdateProfilePayload = {
    firstName: string;
    lastName: string;
    email: string;
};

export async function getProfile(
    accessToken: string,
): Promise<ProfileResponse> {
    const response = await fetch(
        `${API_URL}/profile`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            cache: 'no-store',
        },
    );

    const data =
        await response.json().catch(() => null);

    if (!response.ok) {
        let message =
            'Не удалось загрузить профиль';

        if (data?.message) {
            message = Array.isArray(data.message)
                ? data.message.join(', ')
                : data.message;
        }

        throw new Error(message);
    }

    return data;
}

export async function updateProfile(
    accessToken: string,
    payload: UpdateProfilePayload,
): Promise<ProfileResponse['user']> {
    const response = await fetch(
        `${API_URL}/profile`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(payload),
        },
    );

    const data =
        await response.json().catch(() => null);

    if (!response.ok) {
        let message =
            'Не удалось сохранить профиль';

        if (data?.message) {
            message = Array.isArray(data.message)
                ? data.message.join(', ')
                : data.message;
        }

        throw new Error(message);
    }

    return data.user;
}