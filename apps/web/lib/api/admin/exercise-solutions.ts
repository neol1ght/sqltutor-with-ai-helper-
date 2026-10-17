const API_URL =
    process.env.NEXT_PUBLIC_API_URL ??
    'http://localhost:3500/api';

export type AdminExerciseSolution = {
    id: string;
    exerciseId: string;
    query: string;
    createdAt: string;
    updatedAt: string;
};

type ApiErrorResponse = {
    message?: string | string[];
};

async function getErrorMessage(
    response: Response,
    fallback: string,
): Promise<string> {
    try {
        const data =
            (await response.json()) as ApiErrorResponse;

        if (Array.isArray(data.message)) {
            return data.message.join(', ');
        }

        if (typeof data.message === 'string') {
            return data.message;
        }
    } catch {
        // Используем fallback.
    }

    return fallback;
}

export async function getAdminExerciseSolution(
    accessToken: string,
    exerciseId: string,
): Promise<AdminExerciseSolution | null> {
    const response = await fetch(
        `${API_URL}/admin/exercises/${exerciseId}/solution`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            cache: 'no-store',
        },
    );

    if (response.status === 404) {
        return null;
    }

    if (!response.ok) {
        throw new Error(
            await getErrorMessage(
                response,
                'Не удалось загрузить решение',
            ),
        );
    }

    return response.json();
}

export async function createAdminExerciseSolution(
    accessToken: string,
    exerciseId: string,
    query: string,
): Promise<AdminExerciseSolution> {
    const response = await fetch(
        `${API_URL}/admin/exercises/${exerciseId}/solution`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query,
            }),
        },
    );

    if (!response.ok) {
        throw new Error(
            await getErrorMessage(
                response,
                'Не удалось сохранить решение',
            ),
        );
    }

    return response.json();
}

export async function updateAdminExerciseSolution(
    accessToken: string,
    exerciseId: string,
    query: string,
): Promise<AdminExerciseSolution> {
    const response = await fetch(
        `${API_URL}/admin/exercises/${exerciseId}/solution`,
        {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query,
            }),
        },
    );

    if (!response.ok) {
        throw new Error(
            await getErrorMessage(
                response,
                'Не удалось обновить решение',
            ),
        );
    }

    return response.json();
}

export async function deleteAdminExerciseSolution(
    accessToken: string,
    exerciseId: string,
): Promise<{
    success: boolean;
    message: string;
}> {
    const response = await fetch(
        `${API_URL}/admin/exercises/${exerciseId}/solution`,
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
                'Не удалось удалить решение',
            ),
        );
    }

    return response.json();
}