import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class AchievementsService {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    async getUserAchievements(userId: string) {
        const achievements =
            await this.prisma.achievement.findMany({
                orderBy: {
                    createdAt: 'asc',
                },
            });

        const unlocked =
            await this.prisma.userAchievement.findMany({
                where: {
                    userId,
                },
                select: {
                    achievementId: true,
                    unlockedAt: true,
                },
            });

        const unlockedMap = new Map(
            unlocked.map((item) => [
                item.achievementId,
                item.unlockedAt,
            ]),
        );

        return achievements.map((achievement) => ({
            id: achievement.id,
            code: achievement.code,
            title: achievement.title,
            description: achievement.description,
            icon: achievement.icon,
            unlocked: unlockedMap.has(achievement.id),
            unlockedAt:
                unlockedMap.get(achievement.id) ?? null,
        }));
    }

    async checkAchievements(
        userId: string,
        context: {
            difficulty: string;
            exerciseId: string;
        },
    ) {
        const achievements =
            await this.prisma.achievement.findMany({
                where: {
                    code: {
                        in: [
                            'FIRST_SOLVE',
                            'TEN_SOLVES',
                            'TWENTY_FIVE_SOLVES',
                            'HARD_SOLVE',
                        ],
                    },
                },
            });

        const alreadyUnlocked =
            await this.prisma.userAchievement.findMany({
                where: {
                    userId,
                },
                select: {
                    achievementId: true,
                },
            });

        const unlockedIds = new Set(
            alreadyUnlocked.map(
                (item) => item.achievementId,
            ),
        );

        /*
         * Считаем именно уникальные упражнения,
         * которые пользователь решил.
         *
         * Повторная правильная отправка одного
         * упражнения не увеличивает этот счётчик.
         */
        const solvedExercises =
            await this.prisma.userExerciseProgress.findMany({
                where: {
                    userId,
                    status: 'SOLVED',
                },
                select: {
                    exerciseId: true,
                },
            });

        const solvedCount = solvedExercises.length;

        const achievementsToUnlock = [];

        for (const achievement of achievements) {
            if (unlockedIds.has(achievement.id)) {
                continue;
            }

            let shouldUnlock = false;

            if (achievement.code === 'FIRST_SOLVE') {
                shouldUnlock = solvedCount >= 1;
            }

            if (achievement.code === 'TEN_SOLVES') {
                shouldUnlock = solvedCount >= 10;
            }

            if (
                achievement.code ===
                'TWENTY_FIVE_SOLVES'
            ) {
                shouldUnlock = solvedCount >= 25;
            }

            if (achievement.code === 'HARD_SOLVE') {
                shouldUnlock =
                    context.difficulty === 'HARD';
            }

            if (shouldUnlock) {
                achievementsToUnlock.push(
                    achievement,
                );
            }
        }

        const unlockedAchievements: {
            code: string;
            title: string;
            description: string;
            icon: string | null;
            unlockedAt: Date;
        }[] = [];

        for (const achievement of achievementsToUnlock) {
            const userAchievement =
                await this.prisma.userAchievement.create({
                    data: {
                        userId,
                        achievementId:
                        achievement.id,
                    },
                    select: {
                        unlockedAt: true,
                        achievement: {
                            select: {
                                code: true,
                                title: true,
                                description: true,
                                icon: true,
                            },
                        },
                    },
                });

            unlockedAchievements.push({
                code:
                userAchievement.achievement
                    .code,
                title:
                userAchievement.achievement
                    .title,
                description:
                userAchievement.achievement
                    .description,
                icon:
                userAchievement.achievement
                    .icon,
                unlockedAt:
                userAchievement.unlockedAt,
            });
        }

        return unlockedAchievements;
    }
}