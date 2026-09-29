import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service.js';

import { CreateAchievementDto } from './dto/create-achievement.dto.js';
import { UpdateAchievementDto } from './dto/update-achievement.dto.js';

@Injectable()
export class AdminAchievementsService {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    async findAll() {
        return this.prisma.achievement.findMany({
            orderBy: {
                createdAt: 'asc',
            },
            include: {
                _count: {
                    select: {
                        userAchievements: true,
                    },
                },
            },
        });
    }

    async findOne(id: string) {
        const achievement =
            await this.prisma.achievement.findUnique({
                where: { id },
                include: {
                    _count: {
                        select: {
                            userAchievements: true,
                        },
                    },
                },
            });

        if (!achievement) {
            throw new NotFoundException(
                'Achievement not found',
            );
        }

        return achievement;
    }

    async create(dto: CreateAchievementDto) {
        const existing =
            await this.prisma.achievement.findUnique({
                where: {
                    code: dto.code,
                },
            });

        if (existing) {
            throw new ConflictException(
                'Achievement with this code already exists',
            );
        }

        return this.prisma.achievement.create({
            data: {
                code: dto.code,
                title: dto.title,
                description: dto.description,
                icon: dto.icon,
            },
        });
    }

    async update(
        id: string,
        dto: UpdateAchievementDto,
    ) {
        const achievement =
            await this.prisma.achievement.findUnique({
                where: { id },
            });

        if (!achievement) {
            throw new NotFoundException(
                'Achievement not found',
            );
        }

        if (
            dto.code !== undefined &&
            dto.code !== achievement.code
        ) {
            const existing =
                await this.prisma.achievement.findUnique({
                    where: {
                        code: dto.code,
                    },
                });

            if (existing) {
                throw new ConflictException(
                    'Achievement with this code already exists',
                );
            }
        }

        return this.prisma.achievement.update({
            where: {
                id,
            },
            data: {
                ...(dto.code !== undefined && {
                    code: dto.code,
                }),

                ...(dto.title !== undefined && {
                    title: dto.title,
                }),

                ...(dto.description !== undefined && {
                    description: dto.description,
                }),

                ...(dto.icon !== undefined && {
                    icon: dto.icon,
                }),
            },
        });
    }

    async remove(id: string) {
        const achievement =
            await this.prisma.achievement.findUnique({
                where: { id },
            });

        if (!achievement) {
            throw new NotFoundException(
                'Achievement not found',
            );
        }

        return this.prisma.achievement.delete({
            where: {
                id,
            },
        });
    }
}