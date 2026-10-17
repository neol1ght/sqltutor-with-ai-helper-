const API_URL =
    process.env.NEXT_PUBLIC_API_URL ??
    'http://localhost:3500/api'

export type CaseDifficulty =
    | 'EASY'
    | 'MEDIUM'
    | 'HARD'

export type AdminCase = {
    id: string
    slug: string
    title: string
    description: string | null
    difficulty: CaseDifficulty
    databaseName: string
    isPublished: boolean
    createdAt: string
    updatedAt: string
}

export type CreateCasePayload = {
    slug: string
    title: string
    description?: string
    difficulty: CaseDifficulty
    databaseName: string
    published?: boolean
}

export type UpdateCasePayload = {
    slug?: string
    title?: string
    description?: string
    difficulty?: CaseDifficulty
    databaseName?: string
    published?: boolean
}

type ApiErrorResponse = {
    message?: string | string[]
}

async function getErrorMessage(
    response: Response,
    fallback: string,
): Promise<string> {
    try {
        const error: ApiErrorResponse =
            await response.json()

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

export async function getAdminCases(
    accessToken: string,
): Promise<AdminCase[]> {
    const response = await fetch(
        `${API_URL}/admin/cases`,
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
                'Не удалось загрузить учебные кейсы',
            ),
        )
    }

    return response.json()
}

export async function getAdminCase(
    accessToken: string,
    id: string,
): Promise<AdminCase> {
    const response = await fetch(
        `${API_URL}/admin/cases/${id}`,
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
                'Не удалось загрузить учебный кейс',
            ),
        )
    }

    return response.json()
}

export async function createAdminCase(
    accessToken: string,
    payload: CreateCasePayload,
): Promise<AdminCase> {
    const response = await fetch(
        `${API_URL}/admin/cases`,
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
                'Не удалось создать учебный кейс',
            ),
        )
    }

    return response.json()
}

export async function updateAdminCase(
    accessToken: string,
    id: string,
    payload: UpdateCasePayload,
): Promise<AdminCase> {
    const response = await fetch(
        `${API_URL}/admin/cases/${id}`,
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
                'Не удалось обновить учебный кейс',
            ),
        )
    }

    return response.json()
}

export async function deleteAdminCase(
    accessToken: string,
    id: string,
): Promise<void> {
    const response = await fetch(
        `${API_URL}/admin/cases/${id}`,
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
                'Не удалось удалить учебный кейс',
            ),
        )
    }
}