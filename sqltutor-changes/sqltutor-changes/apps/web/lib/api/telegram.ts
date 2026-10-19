const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3500/api').replace(/\/$/, '');
const TOKEN_KEY = 'sqltutor_access_token';

export type TelegramStatusResponse = {
    linked: boolean;
    username: string | null;
    linkedAt: string | null;
};

export type TelegramLinkResponse = {
    url: string;
    expiresAt: string;
};

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
    if (!token) throw new Error('Войдите в аккаунт, чтобы управлять привязкой Telegram.');
    const response = await fetch(`${API_URL}${path}`, {
        ...init,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...init.headers },
        cache: 'no-store',
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
        const msg = data?.message;
        throw new Error(Array.isArray(msg) ? msg.join(', ') : msg || `Ошибка API (${response.status})`);
    }
    return data as T;
}

export const getTelegramStatus = () => request<TelegramStatusResponse>('/telegram/link');

export const createTelegramLink = () =>
    request<TelegramLinkResponse>('/telegram/link', { method: 'POST' });
