import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service.js';

import { SubmissionsFilterDto } from './dto/submission-filter.dto.js';

@Injectable()
export class AdminSubmissionsService {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    async findAll(filters: SubmissionsFilterDto) {
        const {
            userId,
            exerciseId,
            isCorrect,
            limit = 100,
        } = filters;

        return this.prisma.submission.findMany({
            where: {
                ...(userId && {
                    userId,
                }),

                ...(exerciseId && {
                    exerciseId,
                }),

                ...(isCorrect !== undefined && {
                    isCorrect: isCorrect === 'true',
                }),
            },

            orderBy: {
                createdAt: 'desc',
            },

            take: Number(limit),

            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },

                exercise: {
                    select: {
                        id: true,
                        title: true,
                        difficulty: true,

                        learningCase: {
                            select: {
                                id: true,
                                title: true,
                            },
                        },
                    },
                },
            },
        });
    }

    async findOne(id: string) {
        const submission =
            await this.prisma.submission.findUnique({
                where: {
                    id,
                },

                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                        },
                    },

                    exercise: {
                        select: {
                            id: true,
                            title: true,
                            description: true,
                            difficulty: true,

                            learningCase: {
                                select: {
                                    id: true,
                                    title: true,
                                    slug: true,
                                },
                            },
                        },
                    },
                },
            });

        if (!submission) {
            throw new NotFoundException(
                'Submission not found',
            );
        }

        return submission;
    }
}