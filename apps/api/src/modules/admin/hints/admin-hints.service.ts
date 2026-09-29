import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service.js';

import { CreateHintDto } from './dto/create-hint.dto.js';
import { UpdateHintDto } from './dto/update-hint.dto.js';

@Injectable()
export class AdminHintsService {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    async findAll() {
        return this.prisma.exerciseHint.findMany({
            orderBy: [
                {
                    exerciseId: 'asc',
                },
                {
                    level: 'asc',
                },
            ],
            include: {
                exercise: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
        });
    }

    async findOne(id: string) {
        const hint = await this.prisma.exerciseHint.findUnique({
            where: { id },
            include: {
                exercise: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
        });

        if (!hint) {
            throw new NotFoundException(
                'Hint not found',
            );
        }

        return hint;
    }

    async create(dto: CreateHintDto) {
        const exercise =
            await this.prisma.exercise.findUnique({
                where: {
                    id: dto.exerciseId,
                },
            });

        if (!exercise) {
            throw new NotFoundException(
                'Exercise not found',
            );
        }

        const existingHint =
            await this.prisma.exerciseHint.findUnique({
                where: {
                    exerciseId_level: {
                        exerciseId: dto.exerciseId,
                        level: dto.level,
                    },
                },
            });

        if (existingHint) {
            throw new ConflictException(
                'Hint with this level already exists for this exercise',
            );
        }

        return this.prisma.exerciseHint.create({
            data: {
                exerciseId: dto.exerciseId,
                level: dto.level,
                content: dto.content,
            },
        });
    }

    async update(
        id: string,
        dto: UpdateHintDto,
    ) {
        const hint =
            await this.prisma.exerciseHint.findUnique({
                where: { id },
            });

        if (!hint) {
            throw new NotFoundException(
                'Hint not found',
            );
        }

        if (
            dto.exerciseId !== undefined ||
            dto.level !== undefined
        ) {
            const exerciseId =
                dto.exerciseId ?? hint.exerciseId;

            const level =
                dto.level ?? hint.level;

            const duplicate =
                await this.prisma.exerciseHint.findFirst({
                    where: {
                        exerciseId,
                        level,
                        NOT: {
                            id,
                        },
                    },
                });

            if (duplicate) {
                throw new ConflictException(
                    'Hint with this level already exists for this exercise',
                );
            }
        }

        return this.prisma.exerciseHint.update({
            where: { id },
            data: {
                ...(dto.exerciseId !== undefined && {
                    exerciseId: dto.exerciseId,
                }),

                ...(dto.level !== undefined && {
                    level: dto.level,
                }),

                ...(dto.content !== undefined && {
                    content: dto.content,
                }),
            },
        });
    }

    async remove(id: string) {
        const hint =
            await this.prisma.exerciseHint.findUnique({
                where: { id },
            });

        if (!hint) {
            throw new NotFoundException(
                'Hint not found',
            );
        }

        return this.prisma.exerciseHint.delete({
            where: { id },
        });
    }
}