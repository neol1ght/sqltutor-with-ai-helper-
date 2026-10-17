import {
    ConflictException,
    Injectable,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service.js';

import { UpdateProfileDto } from './dto/update-profile.dto.js';
@Injectable()
export class ProfileService {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    async getProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true,
            },
        });

        if (!user) {
            throw new Error('Пользователь не найден');
        }

        const submissions = await this.prisma.submission.findMany({
            where: {
                userId,
            },
            select: {
                id: true,
                exerciseId: true,
                isCorrect: true,
                executionTimeMs: true,
                createdAt: true,
                exercise: {
                    select: {
                        title: true,
                        learningCase: {
                            select: {
                                title: true,
                                slug: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 10,
        });

        const allSubmissions = await this.prisma.submission.findMany({
            where: {
                userId,
            },
            select: {
                isCorrect: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        const progress = await this.prisma.userExerciseProgress.findMany({
            where: {
                userId,
            },
            select: {
                status: true,
                exercise: {
                    select: {
                        id: true,
                        caseId: true,
                        isPublished: true,
                        learningCase: {
                            select: {
                                id: true,
                                title: true,
                                slug: true,
                                isPublished: true,
                            },
                        },
                    },
                },
            },
        });

        const publishedCases = await this.prisma.learningCase.findMany({
            where: {
                isPublished: true,
            },
            select: {
                id: true,
                title: true,
                slug: true,
                exercises: {
                    where: {
                        isPublished: true,
                    },
                    select: {
                        id: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        const achievements =
            await this.prisma.userAchievement.findMany({
                where: {
                    userId,
                },
                select: {
                    unlockedAt: true,
                    achievement: {
                        select: {
                            id: true,
                            code: true,
                            title: true,
                            description: true,
                            icon: true,
                        },
                    },
                },
                orderBy: {
                    unlockedAt: 'desc',
                },
            });

        const totalAttempts = allSubmissions.length;

        const correctAttempts = allSubmissions.filter(
            (submission) => submission.isCorrect,
        ).length;

        const accuracy =
            totalAttempts > 0
                ? Math.round(
                    (correctAttempts / totalAttempts) * 100,
                )
                : 0;

        const solvedExercises = progress.filter(
            (item) =>
                item.status === 'SOLVED' &&
                item.exercise.isPublished &&
                item.exercise.learningCase.isPublished,
        ).length;

        const streakDays = this.calculateStreak(
            allSubmissions.map(
                (submission) => submission.createdAt,
            ),
        );

        const courses = publishedCases.map((learningCase) => {
            const totalExercises =
                learningCase.exercises.length;

            const solvedExercisesForCase = progress.filter(
                (item) =>
                    item.status === 'SOLVED' &&
                    item.exercise.isPublished &&
                    item.exercise.learningCase.id ===
                    learningCase.id,
            ).length;

            const percent =
                totalExercises > 0
                    ? Math.round(
                        (solvedExercisesForCase /
                            totalExercises) *
                        100,
                    )
                    : 0;

            return {
                id: learningCase.id,
                title: learningCase.title,
                slug: learningCase.slug,
                totalExercises,
                solvedExercises: solvedExercisesForCase,
                percent,
            };
        });

        return {
            user,
            stats: {
                streakDays,
                solvedExercises,
                totalAttempts,
                accuracy,
            },
            courses,
            achievements: achievements.map(
                ({ achievement, unlockedAt }) => ({
                    ...achievement,
                    unlockedAt,
                }),
            ),
            recentSubmissions: submissions.map(
                (submission) => ({
                    id: submission.id,
                    exerciseId: submission.exerciseId,
                    exerciseTitle:
                    submission.exercise.title,
                    caseTitle:
                    submission.exercise.learningCase.title,
                    caseSlug:
                    submission.exercise.learningCase.slug,
                    isCorrect: submission.isCorrect,
                    executionTimeMs:
                    submission.executionTimeMs,
                    createdAt: submission.createdAt,
                }),
            ),
        };
    }
    async updateProfile(
        userId: string,
        dto: UpdateProfileDto,
    ) {
        const existingUser =
            await this.prisma.user.findFirst({
                where: {
                    email: dto.email,
                    NOT: {
                        id: userId,
                    },
                },
                select: {
                    id: true,
                },
            });

        if (existingUser) {
            throw new ConflictException(
                'Пользователь с таким email уже существует',
            );
        }

        const user =
            await this.prisma.user.update({
                where: {
                    id: userId,
                },
                data: {
                    email: dto.email,
                    firstName:
                        dto.firstName?.trim() || null,
                    lastName:
                        dto.lastName?.trim() || null,
                },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    createdAt: true,
                },
            });

        return {
            user,
        };
    }
    private calculateStreak(dates: Date[]) {
        if (dates.length === 0) {
            return 0;
        }

        const uniqueDays = Array.from(
            new Set(
                dates.map((date) =>
                    date.toISOString().slice(0, 10),
                ),
            ),
        ).sort((a, b) => b.localeCompare(a));

        if (uniqueDays.length === 0) {
            return 0;
        }

        const today = new Date();

        const todayString = today
            .toISOString()
            .slice(0, 10);

        const yesterday = new Date(today);
        yesterday.setUTCDate(
            yesterday.getUTCDate() - 1,
        );

        const yesterdayString = yesterday
            .toISOString()
            .slice(0, 10);

        if (
            uniqueDays[0] !== todayString &&
            uniqueDays[0] !== yesterdayString
        ) {
            return 0;
        }

        let streak = 1;

        for (let i = 1; i < uniqueDays.length; i++) {
            const current = new Date(
                `${uniqueDays[i - 1]}T00:00:00Z`,
            );

            const previous = new Date(
                `${uniqueDays[i]}T00:00:00Z`,
            );

            const diff =
                (current.getTime() -
                    previous.getTime()) /
                (1000 * 60 * 60 * 24);

            if (diff !== 1) {
                break;
            }

            streak++;
        }

        return streak;
    }
}