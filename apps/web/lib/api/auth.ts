export type AuthUser = {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
    createdAt: string;
    updatedAt: string;
};

export type AuthResponse = {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
    throw new Error(
        'NEXT_PUBLIC_API_URL не задан в переменных окружения',
    );
}

async function request<T>(
    endpoint: string,
    options?: RequestInit,
): Promise<T> {
    const response = await fetch(
        `${API_URL}${endpoint}`,
        {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(options?.headers ?? {}),
            },
        },
    );

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        let message = 'Произошла ошибка';

        if (data?.message) {
            message = Array.isArray(data.message)
                ? data.message.join(', ')
                : data.message;
        }

        throw new Error(message);
    }

    return data;
}

export async function login(
    email: string,
    password: string,
): Promise<AuthResponse> {
    return request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
            email,
            password,
        }),
    });
}

export async function register(
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
): Promise<AuthResponse> {
    return request<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
            email,
            password,
            ...(firstName ? { firstName } : {}),
            ...(lastName ? { lastName } : {}),
        }),
    });
}

export async function refresh(
    refreshToken: string,
): Promise<{
    accessToken: string;
    refreshToken: string;
}> {
    return request('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({
            refreshToken,
        }),
    });
}

export async function logout(
    refreshToken: string,
): Promise<{ message: string }> {
    return request('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({
            refreshToken,
        }),
    });
}

export async function getMe(
    accessToken: string,
): Promise<AuthUser> {
    return request<AuthUser>('/auth/me', {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
}