import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class CasesService {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    async findAll() {
        return this.prisma.learningCase.findMany({
            where: {
                isPublished: true,
            },
            orderBy: {
                createdAt: 'asc',
            },
            select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                difficulty: true,
                databaseName: true,
                isPublished: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    async findBySlug(slug: string) {
        const learningCase =
            await this.prisma.learningCase.findUnique({
                where: {
                    slug,
                },
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    description: true,
                    difficulty: true,
                    databaseName: true,
                    isPublished: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });

        if (!learningCase || !learningCase.isPublished) {
            throw new NotFoundException(
                'Учебный кейс не найден',
            );
        }

        return learningCase;
    }
}