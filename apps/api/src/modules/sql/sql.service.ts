import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { Pool } from 'pg';

import { PrismaService } from '../../prisma/prisma.service.js';
import { AchievementsService } from '../achievements/achievements.service.js';
import { SqlQueryValidator } from './sql-query.validator.js';

@Injectable()
export class SqlService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly achievementsService: AchievementsService,
    ) {}

    private createPool(databaseName: string) {
        const baseUrl = process.env.DATABASE_URL;

        if (!baseUrl) {
            throw new Error(
                'DATABASE_URL is not configured',
            );
        }

        const url = new URL(baseUrl);

        url.pathname = `/${databaseName}`;

        return new Pool({
            connectionString: url.toString(),
            max: 5,
            options: '-c statement_timeout=3000',
        });
    }

    async execute(
        exerciseId: string,
        query: string,
    ) {
        let pool: Pool | null = null;

        try {
            const validatedQuery =
                SqlQueryValidator.validate(query);

            const exercise =
                await this.prisma.exercise.findUnique({
                    where: {
                        id: exerciseId,
                    },
                    include: {
                        learningCase: true,
                    },
                });

            if (!exercise) {
                throw new NotFoundException(
                    'Exercise not found',
                );
            }

            pool = this.createPool(
                exercise.learningCase.databaseName,
            );

            const result =
                await pool.query(validatedQuery);

            return {
                success: true,
                rows: result.rows,
                columns: result.fields.map((field) => field.name),
                rowCount: result.rowCount,
            };
        } catch (error: any) {
            console.error(
                'SQL execution error:',
                error,
            );

            return {
                success: false,
                error: {
                    message:
                        error?.message ??
                        'Не удалось выполнить SQL-запрос',
                    code:
                        error?.code ??
                        null,
                },
            };
        } finally {
            if (pool) {
                await pool.end();
            }
        }
    }

    async submit(
        userId: string,
        exerciseId: string,
        query: string,
    ) {
        const validatedQuery =
            SqlQueryValidator.validate(query);

        const exercise =
            await this.prisma.exercise.findUnique({
                where: {
                    id: exerciseId,
                },
                include: {
                    learningCase: true,
                    exerciseSolution: true,
                },
            });

        if (!exercise) {
            throw new NotFoundException(
                'Exercise not found',
            );
        }

        if (!exercise.exerciseSolution) {
            throw new NotFoundException(
                'Exercise solution not found',
            );
        }

        const pool = this.createPool(
            exercise.learningCase.databaseName,
        );

        try {
            const actualResult =
                await pool.query(validatedQuery);

            const expectedResult =
                await pool.query(
                    exercise.exerciseSolution.query,
                );

            const actualRows =
                this.normalizeRows(
                    actualResult.rows,
                );

            const expectedRows =
                this.normalizeRows(
                    expectedResult.rows,
                );

            const isCorrect =
                JSON.stringify(actualRows) ===
                JSON.stringify(expectedRows);

            const submission =
                await this.prisma.submission.create({
                    data: {
                        userId,
                        exerciseId,
                        query: validatedQuery,
                        isCorrect,
                    },
                });

            const existingProgress =
                await this.prisma.userExerciseProgress.findUnique(
                    {
                        where: {
                            userId_exerciseId: {
                                userId,
                                exerciseId,
                            },
                        },
                    },
                );

            if (existingProgress) {
                /*
                 * Если упражнение уже было решено,
                 * сохраняем SOLVED независимо от
                 * результата новой попытки.
                 *
                 * Например:
                 *
                 * SOLVED
                 *   ↓
                 * повторная неправильная попытка
                 *   ↓
                 * всё равно SOLVED
                 */
                const nextStatus =
                    existingProgress.status ===
                    'SOLVED'
                        ? 'SOLVED'
                        : isCorrect
                            ? 'SOLVED'
                            : 'IN_PROGRESS';

                const nextSolvedAt =
                    existingProgress.solvedAt ??
                    (isCorrect
                        ? new Date()
                        : null);

                await this.prisma.userExerciseProgress.update(
                    {
                        where: {
                            userId_exerciseId: {
                                userId,
                                exerciseId,
                            },
                        },
                        data: {
                            attemptsCount: {
                                increment: 1,
                            },
                            status: nextStatus,
                            lastAttemptAt:
                                new Date(),
                            solvedAt:
                            nextSolvedAt,
                        },
                    },
                );
            } else {
                await this.prisma.userExerciseProgress.create(
                    {
                        data: {
                            userId,
                            exerciseId,
                            attemptsCount: 1,
                            status: isCorrect
                                ? 'SOLVED'
                                : 'IN_PROGRESS',
                            lastAttemptAt:
                                new Date(),
                            solvedAt: isCorrect
                                ? new Date()
                                : null,
                        },
                    },
                );
            }

            let unlockedAchievements: {
                code: string;
                title: string;
                description: string;
                icon: string | null;
                unlockedAt: Date;
            }[] = [];

            if (isCorrect) {
                unlockedAchievements =
                    await this.achievementsService.checkAchievements(
                        userId,
                        {
                            difficulty:
                            exercise.difficulty,
                            exerciseId:
                            exercise.id,
                        },
                    );
            }

            return {
                success: true,
                isCorrect,
                rows: actualResult.rows,
                columns: actualResult.fields.map((field) => field.name),
                rowCount: actualResult.rowCount,
                submissionId: submission.id,
                unlockedAchievements,
            };
        } catch (error: any) {
            console.error(
                'SQL submit error:',
                error,
            );

            return {
                success: false,
                isCorrect: false,
                error: {
                    message:
                        error?.message ??
                        'Unknown SQL error',
                    code:
                        error?.code ??
                        null,
                },
            };
        } finally {
            await pool.end();
        }
    }

    private normalizeRows(
        rows: Record<string, unknown>[],
    ) {
        return rows
            .map((row) => {
                const sortedEntries =
                    Object.entries(row).sort(
                        ([a], [b]) =>
                            a.localeCompare(b),
                    );

                return Object.fromEntries(
                    sortedEntries,
                );
            })
            .sort((a, b) =>
                JSON.stringify(a).localeCompare(
                    JSON.stringify(b),
                ),
            );
    }
}