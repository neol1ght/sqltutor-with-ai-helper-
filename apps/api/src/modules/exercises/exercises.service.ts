import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class ExercisesService {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    async findByCaseSlug(slug: string) {
        const learningCase =
            await this.prisma.learningCase.findUnique({
                where: {
                    slug,
                },
            });

        if (!learningCase || !learningCase.isPublished) {
            throw new NotFoundException(
                'Учебный кейс не найден',
            );
        }

        return this.prisma.exercise.findMany({
            where: {
                caseId: learningCase.id,
                isPublished: true,
            },
            orderBy: {
                sortOrder: 'asc',
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

    async findById(id: string) {
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
                            title: true,
                            slug: true,
                            difficulty: true,
                        },
                    },
                },
            });

        if (!exercise || !exercise.isPublished) {
            throw new NotFoundException(
                'Задание не найдено',
            );
        }

        return exercise;
    }
}