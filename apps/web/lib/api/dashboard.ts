const API_URL =
    process.env.NEXT_PUBLIC_API_URL ??
    'http://localhost:3500/api';

export type DashboardStats = {
    streakDays: number;
    totalXp: number;
    todayXp: number;
    yesterdayXp: number;

    totalAttempts: number;
    correctAttempts: number;
    accuracy: number;

    solvedExercises: number;
};

export type WeeklyXpItem = {
    date: string;
    day: string;
    xp: number;
};

export type DashboardData = {
    stats: DashboardStats;
    weeklyXp: WeeklyXpItem[];
};

type ApiErrorResponse = {
    message?: string | string[];
};

export async function getDashboard(
    accessToken: string,
): Promise<DashboardData> {
    const response = await fetch(`${API_URL}/dashboard`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        cache: 'no-store',
    });

    if (!response.ok) {
        let message = 'Не удалось загрузить статистику';

        try {
            const error: ApiErrorResponse =
                await response.json();

            if (Array.isArray(error.message)) {
                message = error.message.join(', ');
            } else if (error.message) {
                message = error.message;
            }
        } catch {
            // Если backend вернул не JSON,
            // оставляем стандартное сообщение.
        }

        throw new Error(message);
    }

    return response.json();
}