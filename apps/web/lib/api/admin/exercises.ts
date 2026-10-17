const API_URL =
    process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3500/api';

export type ExerciseDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export type AdminExercise = {
    id: string;
    caseId: string;
    title: string;
    description: string;
    difficulty: ExerciseDifficulty;
    sortOrder: number;
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
    learningCase?: {
        id: string;
        slug: string;
        title: string;
    };
};

export type CreateExercisePayload = {
    caseId: string;
    title: string;
    description: string;
    difficulty: ExerciseDifficulty;
    sortOrder: number;
    isPublished?: boolean;
};

export type UpdateExercisePayload = {
    caseId?: string;
    title?: string;
    description?: string;
    difficulty?: ExerciseDifficulty;
    sortOrder?: number;
    isPublished?: boolean;
};

type ApiErrorResponse = {
    message?: string | string[];
};

async function getErrorMessage(
    response: Response,
    fallback: string,
): Promise<string> {
    try {
        const data = (await response.json()) as ApiErrorResponse;

        if (Array.isArray(data.message)) {
            return data.message.join(', ');
        }

        if (typeof data.message === 'string') {
            return data.message;
        }
    } catch {
        // Ignore invalid JSON and use fallback.
    }

    return fallback;
}

export async function getAdminExercises(
    accessToken: string,
): Promise<AdminExercise[]> {
    const response = await fetch(`${API_URL}/admin/exercises`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        cache: 'no-store',
    });

    if (!response.ok) {
        throw new Error(
            await getErrorMessage(
                response,
                'Не удалось загрузить задания',
            ),
        );
    }

    return response.json();
}

export async function getAdminExercise(
    accessToken: string,
    id: string,
): Promise<AdminExercise> {
    const response = await fetch(
        `${API_URL}/admin/exercises/${id}`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            cache: 'no-store',
        },
    );

    if (!response.ok) {
        throw new Error(
            await getErrorMessage(
                response,
                'Не удалось загрузить задание',
            ),
        );
    }

    return response.json();
}

export async function createAdminExercise(
    accessToken: string,
    payload: CreateExercisePayload,
): Promise<AdminExercise> {
    const response = await fetch(`${API_URL}/admin/exercises`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error(
            await getErrorMessage(
                response,
                'Не удалось создать задание',
            ),
        );
    }

    return response.json();
}

export async function updateAdminExercise(
    accessToken: string,
    id: string,
    payload: UpdateExercisePayload,
): Promise<AdminExercise> {
    const response = await fetch(
        `${API_URL}/admin/exercises/${id}`,
        {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        },
    );

    if (!response.ok) {
        throw new Error(
            await getErrorMessage(
                response,
                'Не удалось обновить задание',
            ),
        );
    }

    return response.json();
}

export async function deleteAdminExercise(
    accessToken: string,
    id: string,
): Promise<{ success: boolean; message: string }> {
    const response = await fetch(
        `${API_URL}/admin/exercises/${id}`,
        {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
    );

    if (!response.ok) {
        throw new Error(
            await getErrorMessage(
                response,
                'Не удалось удалить задание',
            ),
        );
    }

    return response.json();
}