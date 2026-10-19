
'use client';

import {
    getMe,
    logout as logoutRequest,
    refresh as refreshRequest,
    type AuthUser,
} from '@/lib/api/auth';

const ACCESS_TOKEN_KEY =
    'sqltutor_access_token';

const REFRESH_TOKEN_KEY =
    'sqltutor_refresh_token';

const USER_KEY =
    'sqltutor_user';

export function getAccessToken(): string | null {
    if (typeof window === 'undefined') {
        return null;
    }

    return localStorage.getItem(
        ACCESS_TOKEN_KEY,
    );
}

export function getRefreshToken(): string | null {
    if (typeof window === 'undefined') {
        return null;
    }

    return localStorage.getItem(
        REFRESH_TOKEN_KEY,
    );
}

export function getStoredUser(): AuthUser | null {
    if (typeof window === 'undefined') {
        return null;
    }

    const value =
        localStorage.getItem(USER_KEY);

    if (!value) {
        return null;
    }

    try {
        return JSON.parse(value) as AuthUser;
    } catch {
        localStorage.removeItem(USER_KEY);

        return null;
    }
}

export function saveSession(
    user: AuthUser,
    accessToken: string,
    refreshToken: string,
) {
    localStorage.setItem(
        ACCESS_TOKEN_KEY,
        accessToken,
    );

    localStorage.setItem(
        REFRESH_TOKEN_KEY,
        refreshToken,
    );

    localStorage.setItem(
        USER_KEY,
        JSON.stringify(user),
    );
}

export function clearSession() {
    localStorage.removeItem(
        ACCESS_TOKEN_KEY,
    );

    localStorage.removeItem(
        REFRESH_TOKEN_KEY,
    );

    localStorage.removeItem(
        USER_KEY,
    );
}

export async function getCurrentUser(): Promise<AuthUser | null> {
    const accessToken =
        getAccessToken();

    const refreshToken =
        getRefreshToken();

    if (!accessToken && !refreshToken) {
        return null;
    }

    /*
     * Сначала пробуем действующий access token.
     */
    if (accessToken) {
        try {
            const user =
                await getMe(accessToken);

            localStorage.setItem(
                USER_KEY,
                JSON.stringify(user),
            );

            return user;
        } catch {
            // Access token истёк.
            // Ниже попробуем refresh.
        }
    }

    /*
     * Access token недействителен.
     * Пробуем получить новую пару токенов.
     */
    if (!refreshToken) {
        clearSession();

        return null;
    }

    try {
        const tokens =
            await refreshRequest(
                refreshToken,
            );

        const user =
            await getMe(
                tokens.accessToken,
            );

        saveSession(
            user,
            tokens.accessToken,
            tokens.refreshToken,
        );

        return user;
    } catch {
        clearSession();

        return null;
    }
}

/*
 * Обновляет пару токенов по сохранённому refresh token.
 * Возвращает новый access token или null, если обновить не удалось.
 */
export async function refreshAccessToken(): Promise<string | null> {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
        return null;
    }

    try {
        const tokens = await refreshRequest(refreshToken);

        localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);

        return tokens.accessToken;
    } catch {
        return null;
    }
}

export async function logout() {
    const refreshToken =
        getRefreshToken();

    try {
        if (refreshToken) {
            await logoutRequest(
                refreshToken,
            );
        }
    } catch {
        /*
         * Даже если backend уже считает
         * refresh token недействительным,
         * локальную сессию всё равно очищаем.
         */
    } finally {
        clearSession();
    }
}