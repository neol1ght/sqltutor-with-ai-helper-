const API_URL =
    process.env.NEXT_PUBLIC_API_URL ??
    'http://localhost:3500/api'

export type AdminAchievement = {
    id: string
    code: string
    title: string
    description: string
    icon: string | null
    createdAt: string
    _count: {
        userAchievements: number
    }
}

export type CreateAchievementPayload = {
    code: string
    title: string
    description: string
    icon?: string
}

export type UpdateAchievementPayload = {
    code?: string
    title?: string
    description?: string
    icon?: string
}

type ApiErrorResponse = {
    message?: string | string[]
}

async function getErrorMessage(
    response: Response,
    fallback: string,
): Promise<string> {
    try {
        const error: ApiErrorResponse = await response.json()

        if (Array.isArray(error.message)) {
            return error.message.join(', ')
        }

        if (error.message) {
            return error.message
        }
    } catch {
        // ignore
    }

    return fallback
}

export async function getAdminAchievements(
    accessToken: string,
): Promise<AdminAchievement[]> {
    const response = await fetch(
        `${API_URL}/admin/achievements`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            cache: 'no-store',
        },
    )

    if (!response.ok) {
        throw new Error(
            await getErrorMessage(
                response,
                'Не удалось загрузить достижения',
            ),
        )
    }

    return response.json()
}

export async function getAdminAchievement(
    accessToken: string,
    id: string,
): Promise<AdminAchievement> {
    const response = await fetch(
        `${API_URL}/admin/achievements/${id}`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            cache: 'no-store',
        },
    )

    if (!response.ok) {
        throw new Error(
            await getErrorMessage(
                response,
                'Не удалось загрузить достижение',
            ),
        )
    }

    return response.json()
}

export async function createAdminAchievement(
    accessToken: string,
    payload: CreateAchievementPayload,
): Promise<AdminAchievement> {
    const response = await fetch(
        `${API_URL}/admin/achievements`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        },
    )

    if (!response.ok) {
        throw new Error(
            await getErrorMessage(
                response,
                'Не удалось создать достижение',
            ),
        )
    }

    return response.json()
}

export async function updateAdminAchievement(
    accessToken: string,
    id: string,
    payload: UpdateAchievementPayload,
): Promise<AdminAchievement> {
    const response = await fetch(
        `${API_URL}/admin/achievements/${id}`,
        {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        },
    )

    if (!response.ok) {
        throw new Error(
            await getErrorMessage(
                response,
                'Не удалось обновить достижение',
            ),
        )
    }

    return response.json()
}

export async function deleteAdminAchievement(
    accessToken: string,
    id: string,
): Promise<void> {
    const response = await fetch(
        `${API_URL}/admin/achievements/${id}`,
        {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
    )

    if (!response.ok) {
        throw new Error(
            await getErrorMessage(
                response,
                'Не удалось удалить достижение',
            ),
        )
    }
}