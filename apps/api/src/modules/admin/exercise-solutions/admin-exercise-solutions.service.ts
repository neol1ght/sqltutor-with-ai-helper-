import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service.js';

import { CreateExerciseSolutionDto } from './dto/create-exercise-solution.dto.js';
import { UpdateExerciseSolutionDto } from './dto/update-exercise-solution.dto.js';

@Injectable()
export class AdminExerciseSolutionsService {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    async findOne(exerciseId: string) {
        const exercise =
            await this.prisma.exercise.findUnique({
                where: {
                    id: exerciseId,
                },
            });

        if (!exercise) {
            throw new NotFoundException(
                'Упражнение не найдено',
            );
        }

        const solution =
            await this.prisma.exerciseSolution.findUnique({
                where: {
                    exerciseId,
                },
                select: {
                    id: true,
                    exerciseId: true,
                    query: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });

        if (!solution) {
            throw new NotFoundException(
                'Решение для этого упражнения не найдено',
            );
        }

        return solution;
    }

    async create(
        exerciseId: string,
        dto: CreateExerciseSolutionDto,
    ) {
        const exercise =
            await this.prisma.exercise.findUnique({
                where: {
                    id: exerciseId,
                },
            });

        if (!exercise) {
            throw new NotFoundException(
                'Упражнение не найдено',
            );
        }

        const existingSolution =
            await this.prisma.exerciseSolution.findUnique({
                where: {
                    exerciseId,
                },
            });

        if (existingSolution) {
            throw new ConflictException(
                'Решение для этого упражнения уже существует',
            );
        }

        return this.prisma.exerciseSolution.create({
            data: {
                exerciseId,
                query: dto.query,
            },
            select: {
                id: true,
                exerciseId: true,
                query: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    async update(
        exerciseId: string,
        dto: UpdateExerciseSolutionDto,
    ) {
        const existingSolution =
            await this.prisma.exerciseSolution.findUnique({
                where: {
                    exerciseId,
                },
            });

        if (!existingSolution) {
            throw new NotFoundException(
                'Решение для этого упражнения не найдено',
            );
        }

        return this.prisma.exerciseSolution.update({
            where: {
                exerciseId,
            },
            data: {
                query: dto.query,
            },
            select: {
                id: true,
                exerciseId: true,
                query: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    async remove(exerciseId: string) {
        const existingSolution =
            await this.prisma.exerciseSolution.findUnique({
                where: {
                    exerciseId,
                },
            });

        if (!existingSolution) {
            throw new NotFoundException(
                'Решение для этого упражнения не найдено',
            );
        }

        await this.prisma.exerciseSolution.delete({
            where: {
                exerciseId,
            },
        });

        return {
            success: true,
            message: 'Решение удалено',
        };
    }
}