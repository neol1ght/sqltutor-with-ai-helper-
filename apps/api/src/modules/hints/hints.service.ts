import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class HintsService {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    async getExerciseHints(exerciseId: string) {
        const exercise =
            await this.prisma.exercise.findUnique({
                where: {
                    id: exerciseId,
                },
                select: {
                    id: true,
                    isPublished: true,
                },
            });

        if (!exercise || !exercise.isPublished) {
            throw new NotFoundException(
                'Exercise not found',
            );
        }

        return this.prisma.exerciseHint.findMany({
            where: {
                exerciseId,
            },
            select: {
                id: true,
                level: true,
                content: true,
            },
            orderBy: {
                level: 'asc',
            },
        });
    }
}