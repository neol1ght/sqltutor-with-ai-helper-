import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

@Injectable()
export class AdminUsersService {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    async findAll() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async findOne(id: string) {
        const user = await this.prisma.user.findUnique({
            where: {
                id,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            throw new NotFoundException(
                'Пользователь не найден',
            );
        }

        return user;
    }

    async update(
        id: string,
        dto: UpdateUserDto,
    ) {
        await this.findOne(id);

        if (dto.email) {
            const existingUser =
                await this.prisma.user.findFirst({
                    where: {
                        email: dto.email,
                        NOT: {
                            id,
                        },
                    },
                });

            if (existingUser) {
                throw new ConflictException(
                    'Пользователь с таким email уже существует',
                );
            }
        }

        return this.prisma.user.update({
            where: {
                id,
            },
            data: {
                email: dto.email,
                firstName: dto.firstName,
                lastName: dto.lastName,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    async remove(id: string) {
        await this.findOne(id);

        await this.prisma.user.delete({
            where: {
                id,
            },
        });

        return {
            success: true,
            message: 'Пользователь удалён',
        };
    }
}