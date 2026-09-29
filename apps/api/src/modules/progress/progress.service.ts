import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class ProgressService {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    /**
     * Прогресс пользователя по конкретному заданию.
     */
    async getExerciseProgress(
        userId: string,
        exerciseId: string,
    ) {
        const exercise =
            await this.prisma.exercise.findUnique({
                where: {
                    id: exerciseId,
                },
                select: {
                    id: true,
                    title: true,
                    isPublished: true,
                },
            });

        if (!exercise || !exercise.isPublished) {
            throw new NotFoundException(
                'Задание не найдено',
            );
        }

        const progress =
            await this.prisma.userExerciseProgress.findUnique({
                where: {
                    userId_exerciseId: {
                        userId,
                        exerciseId,
                    },
                },
            });

        if (!progress) {
            return {
                exerciseId,
                status: 'NOT_STARTED',
                attemptsCount: 0,
                solvedAt: null,
                lastAttemptAt: null,
            };
        }

        return {
            exerciseId,
            status: progress.status,
            attemptsCount: progress.attemptsCount,
            solvedAt: progress.solvedAt,
            lastAttemptAt: progress.lastAttemptAt,
        };
    }

    /**
     * Прогресс пользователя по конкретному кейсу.
     */
    async getCaseProgress(
        userId: string,
        caseId: string,
    ) {
        const learningCase =
            await this.prisma.learningCase.findUnique({
                where: {
                    id: caseId,
                },
                select: {
                    id: true,
                    title: true,
                    isPublished: true,
                },
            });

        if (
            !learningCase ||
            !learningCase.isPublished
        ) {
            throw new NotFoundException(
                'Учебный кейс не найден',
            );
        }

        /**
         * Получаем опубликованные задания кейса.
         */
        const exercises =
            await this.prisma.exercise.findMany({
                where: {
                    caseId,
                    isPublished: true,
                },
                select: {
                    id: true,
                    title: true,
                    sortOrder: true,
                },
                orderBy: {
                    sortOrder: 'asc',
                },
            });

        /**
         * Получаем весь прогресс пользователя
         * по этим заданиям.
         */
        const progress =
            await this.prisma.userExerciseProgress.findMany({
                where: {
                    userId,
                    exerciseId: {
                        in: exercises.map(
                            (exercise) => exercise.id,
                        ),
                    },
                },
                select: {
                    exerciseId: true,
                    status: true,
                    attemptsCount: true,
                    solvedAt: true,
                    lastAttemptAt: true,
                },
            });

        /**
         * Создаём Map для быстрого поиска
         * прогресса по exerciseId.
         */
        const progressMap = new Map(
            progress.map((item) => [
                item.exerciseId,
                item,
            ]),
        );

        const result =
            exercises.map((exercise) => {
                const item =
                    progressMap.get(exercise.id);

                return {
                    exerciseId: exercise.id,
                    title: exercise.title,

                    status:
                        item?.status ??
                        'NOT_STARTED',

                    attemptsCount:
                        item?.attemptsCount ??
                        0,

                    solvedAt:
                        item?.solvedAt ??
                        null,

                    lastAttemptAt:
                        item?.lastAttemptAt ??
                        null,
                };
            });

        const total =
            result.length;

        const solved =
            result.filter(
                (exercise) =>
                    exercise.status === 'SOLVED',
            ).length;

        return {
            caseId: learningCase.id,
            title: learningCase.title,

            total,
            solved,

            progressPercent:
                total === 0
                    ? 0
                    : Math.round(
                        (solved / total) * 100,
                    ),

            exercises: result,
        };
    }

    /**
     * Общий прогресс пользователя.
     */
    async getOverallProgress(
        userId: string,
    ) {
        const exercises =
            await this.prisma.exercise.findMany({
                where: {
                    isPublished: true,
                },
                select: {
                    id: true,
                    caseId: true,
                },
            });

        /**
         * Получаем только опубликованные кейсы.
         */
        const publishedCases =
            await this.prisma.learningCase.findMany({
                where: {
                    isPublished: true,
                },
                select: {
                    id: true,
                },
            });

        const publishedCaseIds =
            new Set(
                publishedCases.map(
                    (learningCase) =>
                        learningCase.id,
                ),
            );

        const publishedExercises =
            exercises.filter(
                (exercise) =>
                    publishedCaseIds.has(
                        exercise.caseId,
                    ),
            );

        const exerciseIds =
            publishedExercises.map(
                (exercise) => exercise.id,
            );

        const progress =
            await this.prisma.userExerciseProgress.findMany({
                where: {
                    userId,
                    exerciseId: {
                        in: exerciseIds,
                    },
                },
                select: {
                    exerciseId: true,
                    status: true,
                },
            });

        const solved =
            progress.filter(
                (item) =>
                    item.status === 'SOLVED',
            ).length;

        const total =
            publishedExercises.length;

        return {
            total,
            solved,

            progressPercent:
                total === 0
                    ? 0
                    : Math.round(
                        (solved / total) * 100,
                    ),
        };
    }
    /**
     * Сводный прогресс пользователя.
     */
    async getUserSummary(
        userId: string,
    ) {
        /**
         * Получаем все опубликованные кейсы
         * вместе с опубликованными заданиями.
         */
        const cases =
            await this.prisma.learningCase.findMany({
                where: {
                    isPublished: true,
                },
                select: {
                    id: true,
                    title: true,
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

        /**
         * Собираем все опубликованные exerciseId.
         */
        const exerciseIds =
            cases.flatMap(
                (learningCase) =>
                    learningCase.exercises.map(
                        (exercise) => exercise.id,
                    ),
            );

        /**
         * Получаем текущий прогресс пользователя.
         */
        const progress =
            await this.prisma.userExerciseProgress.findMany({
                where: {
                    userId,
                    exerciseId: {
                        in: exerciseIds,
                    },
                },
                select: {
                    exerciseId: true,
                    status: true,
                    attemptsCount: true,
                },
            });

        /**
         * Map для быстрого поиска прогресса.
         */
        const progressMap = new Map(
            progress.map((item) => [
                item.exerciseId,
                item,
            ]),
        );

        /**
         * Общая статистика по упражнениям.
         */
        const total =
            exerciseIds.length;

        const solved =
            progress.filter(
                (item) =>
                    item.status === 'SOLVED',
            ).length;

        const inProgress =
            progress.filter(
                (item) =>
                    item.status === 'IN_PROGRESS',
            ).length;

        const totalAttempts =
            progress.reduce(
                (sum, item) =>
                    sum + item.attemptsCount,
                0,
            );

        /**
         * Статистика по каждому кейсу.
         */
        const caseProgress =
            cases.map((learningCase) => {
                const caseExerciseIds =
                    learningCase.exercises.map(
                        (exercise) =>
                            exercise.id,
                    );

                const caseSolved =
                    caseExerciseIds.filter(
                        (exerciseId) =>
                            progressMap.get(
                                exerciseId,
                            )?.status ===
                            'SOLVED',
                    ).length;

                const caseTotal =
                    caseExerciseIds.length;

                return {
                    caseId: learningCase.id,
                    title: learningCase.title,

                    total: caseTotal,
                    solved: caseSolved,

                    progressPercent:
                        caseTotal === 0
                            ? 0
                            : Math.round(
                                (caseSolved /
                                    caseTotal) *
                                100,
                            ),
                };
            });

        return {
            total,
            solved,

            inProgress,

            notStarted:
                total - solved - inProgress,

            totalAttempts,

            progressPercent:
                total === 0
                    ? 0
                    : Math.round(
                        (solved / total) *
                        100,
                    ),

            cases: caseProgress,
        };
    }
}