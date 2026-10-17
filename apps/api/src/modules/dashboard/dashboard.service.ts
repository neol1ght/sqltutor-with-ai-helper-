import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

const XP_BY_DIFFICULTY = {
    EASY: 20,
    MEDIUM: 35,
    HARD: 50,
} as const;

@Injectable()
export class DashboardService {
    constructor(private readonly prisma: PrismaService) {}

    async getDashboard(userId: string) {
        const [submissions, solvedExercises] = await Promise.all([
            this.prisma.submission.findMany({
                where: {
                    userId,
                },
                select: {
                    isCorrect: true,
                    createdAt: true,
                },
                orderBy: {
                    createdAt: 'asc',
                },
            }),

            this.prisma.userExerciseProgress.findMany({
                where: {
                    userId,
                    status: 'SOLVED',
                    solvedAt: {
                        not: null,
                    },
                },
                select: {
                    exerciseId: true,
                    solvedAt: true,
                    exercise: {
                        select: {
                            difficulty: true,
                        },
                    },
                },
                orderBy: {
                    solvedAt: 'asc',
                },
            }),
        ]);

        // -------------------------
        // Attempts / accuracy
        // -------------------------

        const totalAttempts = submissions.length;

        const correctAttempts = submissions.filter(
            (submission) => submission.isCorrect,
        ).length;

        const accuracy =
            totalAttempts === 0
                ? 0
                : Math.round((correctAttempts / totalAttempts) * 100);

        // -------------------------
        // XP
        // -------------------------

        const totalXp = solvedExercises.reduce((total, progress) => {
            if (!progress.solvedAt) {
                return total;
            }

            return (
                total +
                XP_BY_DIFFICULTY[progress.exercise.difficulty]
            );
        }, 0);

        const weeklyXp = this.calculateWeeklyXp(solvedExercises);

        const todayXp = weeklyXp[weeklyXp.length - 1]?.xp ?? 0;
        const yesterdayXp = weeklyXp[weeklyXp.length - 2]?.xp ?? 0;

        // -------------------------
        // Streak
        // -------------------------

        const streakDays = this.calculateStreakDays(submissions);

        // -------------------------
        // Response
        // -------------------------

        return {
            stats: {
                streakDays,
                totalXp,
                todayXp,
                yesterdayXp,

                totalAttempts,
                correctAttempts,
                accuracy,

                solvedExercises: solvedExercises.length,
            },

            weeklyXp,
        };
    }

    /**
     * Calculates the current activity streak.
     *
     * Any submission counts as activity for the day.
     * The streak can start from today or yesterday.
     */
    private calculateStreakDays(
        submissions: Array<{
            createdAt: Date;
        }>,
    ): number {
        if (submissions.length === 0) {
            return 0;
        }

        const activeDates = new Set(
            submissions.map((submission) =>
                this.toDateKey(submission.createdAt),
            ),
        );

        const today = this.startOfDay(new Date());
        const todayKey = this.toDateKey(today);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const yesterdayKey = this.toDateKey(yesterday);

        let currentDate: Date;

        if (activeDates.has(todayKey)) {
            currentDate = today;
        } else if (activeDates.has(yesterdayKey)) {
            currentDate = yesterday;
        } else {
            return 0;
        }

        let streak = 0;

        while (activeDates.has(this.toDateKey(currentDate))) {
            streak += 1;

            currentDate = new Date(currentDate);
            currentDate.setDate(currentDate.getDate() - 1);
        }

        return streak;
    }

    /**
     * Calculates XP earned for each of the last 7 calendar days.
     */
    private calculateWeeklyXp(
        solvedExercises: Array<{
            solvedAt: Date | null;
            exercise: {
                difficulty: 'EASY' | 'MEDIUM' | 'HARD';
            };
        }>,
    ) {
        const today = this.startOfDay(new Date());

        const result: Array<{
            date: string;
            day: string;
            xp: number;
        }> = [];

        for (let i = 6; i >= 0; i -= 1) {
            const date = new Date(today);

            date.setDate(date.getDate() - i);

            const dateKey = this.toDateKey(date);

            const xp = solvedExercises.reduce((total, progress) => {
                if (!progress.solvedAt) {
                    return total;
                }

                if (this.toDateKey(progress.solvedAt) !== dateKey) {
                    return total;
                }

                return (
                    total +
                    XP_BY_DIFFICULTY[progress.exercise.difficulty]
                );
            }, 0);

            result.push({
                date: dateKey,
                day: this.getDayLabel(date),
                xp,
            });
        }

        return result;
    }

    /**
     * Returns the beginning of the calendar day.
     */
    private startOfDay(date: Date): Date {
        const result = new Date(date);

        result.setHours(0, 0, 0, 0);

        return result;
    }

    /**
     * Converts Date -> YYYY-MM-DD.
     */
    private toDateKey(date: Date): string {
        const year = date.getFullYear();

        const month = String(
            date.getMonth() + 1,
        ).padStart(2, '0');

        const day = String(
            date.getDate(),
        ).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    /**
     * Russian short weekday labels.
     */
    private getDayLabel(date: Date): string {
        const labels = [
            'Вс',
            'Пн',
            'Вт',
            'Ср',
            'Чт',
            'Пт',
            'Сб',
        ];

        return labels[date.getDay()];
    }
}