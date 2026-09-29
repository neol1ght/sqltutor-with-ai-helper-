import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service.js';

import { CreateExerciseDto } from './dto/create-exercise.dto.js';
import { UpdateExerciseDto } from './dto/update-exercise.dto.js';

@Injectable()
export class AdminExercisesService {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    async findAll() {
        return this.prisma.exercise.findMany({
            select: {
                id: true,
                caseId: true,
                title: true,
                description: true,
                difficulty: true,
                sortOrder: true,
                isPublished: true,
                createdAt: true,
                updatedAt: true,

                learningCase: {
                    select: {
                        id: true,
                        slug: true,
                        title: true,
                    },
                },
            },
            orderBy: [
                {
                    caseId: 'asc',
                },
                {
                    sortOrder: 'asc',
                },
            ],
        });
    }

    async findOne(id: string) {
        const exercise =
            await this.prisma.exercise.findUnique({
                where: {
                    id,
                },
                select: {
                    id: true,
                    caseId: true,
                    title: true,
                    description: true,
                    difficulty: true,
                    sortOrder: true,
                    isPublished: true,
                    createdAt: true,
                    updatedAt: true,

                    learningCase: {
                        select: {
                            id: true,
                            slug: true,
                            title: true,
                        },
                    },
                },
            });

        if (!exercise) {
            throw new NotFoundException(
                'Упражнение не найдено',
            );
        }

        return exercise;
    }

    async create(dto: CreateExerciseDto) {
        const learningCase =
            await this.prisma.learningCase.findUnique({
                where: {
                    id: dto.caseId,
                },
            });

        if (!learningCase) {
            throw new NotFoundException(
                'Учебный кейс не найден',
            );
        }

        const existingExercise =
            await this.prisma.exercise.findFirst({
                where: {
                    caseId: dto.caseId,
                    sortOrder: dto.sortOrder,
                },
            });

        if (existingExercise) {
            throw new ConflictException(
                'Упражнение с таким порядком уже существует в этом кейсе',
            );
        }

        return this.prisma.exercise.create({
            data: {
                caseId: dto.caseId,
                title: dto.title,
                description: dto.description,
                difficulty: dto.difficulty,
                sortOrder: dto.sortOrder,
                isPublished: dto.isPublished ?? false,
            },
            select: {
                id: true,
                caseId: true,
                title: true,
                description: true,
                difficulty: true,
                sortOrder: true,
                isPublished: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    async update(
        id: string,
        dto: UpdateExerciseDto,
    ) {
        await this.findOne(id);

        if (dto.caseId) {
            const learningCase =
                await this.prisma.learningCase.findUnique({
                    where: {
                        id: dto.caseId,
                    },
                });

            if (!learningCase) {
                throw new NotFoundException(
                    'Учебный кейс не найден',
                );
            }
        }

        const targetCaseId = dto.caseId;

        if (
            targetCaseId !== undefined &&
            dto.sortOrder !== undefined
        ) {
            const existingExercise =
                await this.prisma.exercise.findFirst({
                    where: {
                        caseId: targetCaseId,
                        sortOrder: dto.sortOrder,
                        NOT: {
                            id,
                        },
                    },
                });

            if (existingExercise) {
                throw new ConflictException(
                    'Упражнение с таким порядком уже существует в этом кейсе',
                );
            }
        }

        return this.prisma.exercise.update({
            where: {
                id,
            },
            data: {
                caseId: dto.caseId,
                title: dto.title,
                description: dto.description,
                difficulty: dto.difficulty,
                sortOrder: dto.sortOrder,
                isPublished: dto.isPublished,
            },
            select: {
                id: true,
                caseId: true,
                title: true,
                description: true,
                difficulty: true,
                sortOrder: true,
                isPublished: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    async remove(id: string) {
        await this.findOne(id);

        await this.prisma.exercise.delete({
            where: {
                id,
            },
        });

        return {
            success: true,
            message: 'Упражнение удалено',
        };
    }
}

