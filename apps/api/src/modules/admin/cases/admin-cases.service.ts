import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service.js';

import { CreateCaseDto } from './dto/create-case.dto.js';
import { UpdateCaseDto } from './dto/update-case.dto.js';

@Injectable()
export class AdminCasesService {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    async findAll() {
        return this.prisma.learningCase.findMany({
            select: {
                id: true,
                slug: true,
                title: true,
                description: true,
                difficulty: true,
                databaseName: true,
                isPublished: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async findOne(id: string) {
        const learningCase =
            await this.prisma.learningCase.findUnique({
                where: {
                    id,
                },
                select: {
                    id: true,
                    slug: true,
                    title: true,
                    description: true,
                    difficulty: true,
                    databaseName: true,
                    isPublished: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });

        if (!learningCase) {
            throw new NotFoundException(
                'Учебный кейс не найден',
            );
        }

        return learningCase;
    }

    async create(dto: CreateCaseDto) {
        const existingCase =
            await this.prisma.learningCase.findUnique({
                where: {
                    slug: dto.slug,
                },
            });

        if (existingCase) {
            throw new ConflictException(
                'Кейс с таким slug уже существует',
            );
        }

        return this.prisma.learningCase.create({
            data: {
                slug: dto.slug,
                title: dto.title,
                description: dto.description,
                difficulty: dto.difficulty,
                databaseName: dto.databaseName,
                isPublished: dto.published ?? false,
            },
            select: {
                id: true,
                slug: true,
                title: true,
                description: true,
                difficulty: true,
                databaseName: true,
                isPublished: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    async update(
        id: string,
        dto: UpdateCaseDto,
    ) {
        await this.findOne(id);

        if (dto.slug) {
            const existingCase =
                await this.prisma.learningCase.findFirst({
                    where: {
                        slug: dto.slug,
                        NOT: {
                            id,
                        },
                    },
                });

            if (existingCase) {
                throw new ConflictException(
                    'Кейс с таким slug уже существует',
                );
            }
        }

        return this.prisma.learningCase.update({
            where: {
                id,
            },
            data: {
                slug: dto.slug,
                title: dto.title,
                description: dto.description,
                difficulty: dto.difficulty,
                databaseName: dto.databaseName,
                isPublished: dto.published,
            },
            select: {
                id: true,
                slug: true,
                title: true,
                description: true,
                difficulty: true,
                databaseName: true,
                isPublished: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    async remove(id: string) {
        await this.findOne(id);

        await this.prisma.learningCase.delete({
            where: {
                id,
            },
        });

        return {
            success: true,
            message: 'Учебный кейс удалён',
        };
    }
}