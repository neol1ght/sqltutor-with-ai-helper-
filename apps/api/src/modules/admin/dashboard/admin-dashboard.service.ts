import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service.js';

@Injectable()
export class AdminDashboardService {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    async getDashboard() {
        const [
            totalUsers,
            students,
            admins,
            totalCases,
            publishedCases,
            totalExercises,
            publishedExercises,
            totalSubmissions,
            correctSubmissions,
            totalAchievements,
            unlockedAchievements,
            progressStats,
            recentSubmissions,
            exerciseSubmissionStats,
        ] = await Promise.all([
            this.prisma.user.count(),

            this.prisma.user.count({
                where: {
                    role: 'STUDENT',
                },
            }),

            this.prisma.user.count({
                where: {
                    role: 'ADMIN',
                },
            }),

            this.prisma.learningCase.count(),

            this.prisma.learningCase.count({
                where: {
                    isPublished: true,
                },
            }),

            this.prisma.exercise.count(),

            this.prisma.exercise.count({
                where: {
                    isPublished: true,
                },
            }),

            this.prisma.submission.count(),

            this.prisma.submission.count({
                where: {
                    isCorrect: true,
                },
            }),

            this.prisma.achievement.count(),

            this.prisma.userAchievement.count(),

            this.prisma.userExerciseProgress.groupBy({
                by: ['status'],
                _count: {
                    _all: true,
                },
            }),

            this.prisma.submission.findMany({
                where: {
                    createdAt: {
                        gte: this.getDateDaysAgo(6),
                    },
                },
                select: {
                    createdAt: true,
                    isCorrect: true,
                },
                orderBy: {
                    createdAt: 'asc',
                },
            }),

            this.prisma.submission.groupBy({
                by: ['exerciseId'],
                _count: {
                    _all: true,
                },
                where: {},
                orderBy: {
                    _count: {
                        exerciseId: 'desc',
                    },
                },
                take: 10,
            }),
        ]);

        const incorrectSubmissions =
            totalSubmissions - correctSubmissions;

        const successRate =
            totalSubmissions > 0
                ? Number(
                    (
                        (correctSubmissions /
                            totalSubmissions) *
                        100
                    ).toFixed(2),
                )
                : 0;

        const activeUserIds =
            await this.prisma.submission.findMany({
                where: {
                    createdAt: {
                        gte: this.getDateDaysAgo(6),
                    },
                },
                select: {
                    userId: true,
                },
                distinct: ['userId'],
            });

        const mostAttemptedExercises =
            await this.getExerciseStats(
                exerciseSubmissionStats,
            );

        const failedExerciseStats =
            await this.prisma.submission.groupBy({
                by: ['exerciseId'],
                where: {
                    isCorrect: false,
                },
                _count: {
                    _all: true,
                },
                orderBy: {
                    _count: {
                        exerciseId: 'desc',
                    },
                },
                take: 10,
            });

        const mostFailedExercises =
            await this.getExerciseStats(
                failedExerciseStats,
            );

        return {
            users: {
                total: totalUsers,
                students,
                admins,
                activeLast7Days:
                activeUserIds.length,
            },

            cases: {
                total: totalCases,
                published: publishedCases,
            },

            exercises: {
                total: totalExercises,
                published: publishedExercises,
            },

            submissions: {
                total: totalSubmissions,
                correct: correctSubmissions,
                incorrect: incorrectSubmissions,
                successRate,
            },

            progress: this.formatProgressStats(
                progressStats,
            ),

            achievements: {
                total: totalAchievements,
                unlocked: unlockedAchievements,
            },

            activity: {
                submissionsByDay:
                    this.formatSubmissionsByDay(
                        recentSubmissions,
                    ),
            },

            exercisesStats: {
                mostAttempted:
                mostAttemptedExercises,

                mostFailed:
                mostFailedExercises,
            },
        };
    }

    private getDateDaysAgo(days: number) {
        const date = new Date();

        date.setDate(
            date.getDate() - days,
        );

        date.setHours(0, 0, 0, 0);

        return date;
    }

    private formatProgressStats(
        stats: Array<{
            status: string;
            _count: {
                _all: number;
            };
        }>,
    ) {
        return {
            notStarted:
                stats.find(
                    (item) =>
                        item.status ===
                        'NOT_STARTED',
                )?._count._all ?? 0,

            inProgress:
                stats.find(
                    (item) =>
                        item.status ===
                        'IN_PROGRESS',
                )?._count._all ?? 0,

            solved:
                stats.find(
                    (item) =>
                        item.status === 'SOLVED',
                )?._count._all ?? 0,
        };
    }

    private formatSubmissionsByDay(
        submissions: Array<{
            createdAt: Date;
            isCorrect: boolean;
        }>,
    ) {
        const result = new Map<
            string,
            {
                date: string;
                total: number;
                correct: number;
                incorrect: number;
            }
        >();

        for (let i = 6; i >= 0; i--) {
            const date =
                this.getDateDaysAgo(i);

            const key =
                date.toISOString().slice(0, 10);

            result.set(key, {
                date: key,
                total: 0,
                correct: 0,
                incorrect: 0,
            });
        }

        for (const submission of submissions) {
            const key =
                submission.createdAt
                    .toISOString()
                    .slice(0, 10);

            const day = result.get(key);

            if (!day) {
                continue;
            }

            day.total++;

            if (submission.isCorrect) {
                day.correct++;
            } else {
                day.incorrect++;
            }
        }

        return Array.from(
            result.values(),
        );
    }

    private async getExerciseStats(
        stats: Array<{
            exerciseId: string;
            _count: {
                _all: number;
            };
        }>,
    ) {
        if (stats.length === 0) {
            return [];
        }

        const exerciseIds =
            stats.map(
                (item) => item.exerciseId,
            );

        const exercises =
            await this.prisma.exercise.findMany({
                where: {
                    id: {
                        in: exerciseIds,
                    },
                },
                select: {
                    id: true,
                    title: true,
                    difficulty: true,

                    learningCase: {
                        select: {
                            title: true,
                        },
                    },
                },
            });

        return stats.map((stat) => {
            const exercise =
                exercises.find(
                    (item) =>
                        item.id ===
                        stat.exerciseId,
                );

            return {
                exerciseId:
                stat.exerciseId,

                title:
                    exercise?.title ??
                    'Unknown exercise',

                difficulty:
                    exercise?.difficulty ??
                    null,

                caseTitle:
                    exercise
                        ?.learningCase
                        .title ?? null,

                submissions:
                stat._count._all,
            };
        });
    }
}