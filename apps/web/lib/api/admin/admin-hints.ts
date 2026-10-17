const API_URL =
    process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3500/api';

export type AdminHint = {
    id: string;
    exerciseId: string;
    level: number;
    content: string;
    createdAt: string;
    exercise?: {
        id: string;
        title: string;
    };
};

export type CreateHintPayload = {
    exerciseId: string;
    level: number;
    content: string;
};

export type UpdateHintPayload = {
    exerciseId?: string;
    level?: number;
    content?: string;
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

export async function getAdminHints(
    accessToken: string,
): Promise<AdminHint[]> {
    const response = await fetch(`${API_URL}/admin/hints`, {
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
                'Не удалось загрузить подсказки',
            ),
        );
    }

    return response.json();
}

export async function getAdminHint(
    accessToken: string,
    id: string,
): Promise<AdminHint> {
    const response = await fetch(
        `${API_URL}/admin/hints/${id}`,
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
                'Не удалось загрузить подсказку',
            ),
        );
    }

    return response.json();
}

export async function createAdminHint(
    accessToken: string,
    payload: CreateHintPayload,
): Promise<AdminHint> {
    const response = await fetch(`${API_URL}/admin/hints`, {
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
                'Не удалось создать подсказку',
            ),
        );
    }

    return response.json();
}

export async function updateAdminHint(
    accessToken: string,
    id: string,
    payload: UpdateHintPayload,
): Promise<AdminHint> {
    const response = await fetch(
        `${API_URL}/admin/hints/${id}`,
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
                'Не удалось обновить подсказку',
            ),
        );
    }

    return response.json();
}

export async function deleteAdminHint(
    accessToken: string,
    id: string,
): Promise<{ success: boolean; message: string }> {
    const response = await fetch(
        `${API_URL}/admin/hints/${id}`,
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
                'Не удалось удалить подсказку',
            ),
        );
    }

    return response.json();
}