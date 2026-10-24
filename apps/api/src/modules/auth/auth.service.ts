import {
    ConflictException,
    Injectable,
    UnauthorizedException,
    BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../../prisma/prisma.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) {}


    private validatePasswordStrength(password: string): void {
        const normalized = password.toLowerCase().replace(/\s+/g, '');

        const commonPasswords = new Set([
            'qwerty123',
            'qwerty12345',
            '123123123',
            '123456789',
            '1234567890',
            'password123',
            'admin12345',
            'qwertyuiop',
            'пароль123',
            'пароль12345',
        ]);

        const predictableSequences = [
            'qwerty',
            'asdfgh',
            'zxcv',
            'йцукен',
            'фыва',
            'ячсм',
            '12345',
            '23456',
            '34567',
            '45678',
            '56789',
            'abcdef',
            '98765',
            '87654',
        ];

        const onlyRepeatedCharacters = /^(.)\1+$/u.test(normalized);
        const repeatedShortPattern = /^(.{1,4})\1+$/u.test(normalized);

        if (
            commonPasswords.has(normalized) ||
            onlyRepeatedCharacters ||
            repeatedShortPattern ||
            predictableSequences.some((sequence) =>
                normalized.includes(sequence),
            )
        ) {
            throw new BadRequestException(
                'Этот пароль слишком простой. Придумайте более сложный пароль.',
            );
        }
    }


    async register(dto: RegisterDto) {
        this.validatePasswordStrength(dto.password)
        const existingUser = await this.prisma.user.findUnique({
            where: {
                email: dto.email,
            },
        });

        if (existingUser) {
            throw new ConflictException(
                'Пользователь с таким email уже существует',
            );
        }

        const passwordHash = await bcrypt.hash(dto.password, 10);

        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                passwordHash,
                firstName: dto.firstName,
                lastName: dto.lastName,
            },
        });

        const tokens = await this.generateTokens(
            user.id,
            user.email,
            user.role,
        );

        await this.saveRefreshToken(
            user.id,
            tokens.refreshToken,
        );

        return {
            user: this.getPublicUser(user),
            ...tokens,
        };
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email,
            },
        });

        if (!user) {
            throw new UnauthorizedException(
                'Неверный email или пароль',
            );
        }

        const passwordMatches = await bcrypt.compare(
            dto.password,
            user.passwordHash,
        );

        if (!passwordMatches) {
            throw new UnauthorizedException(
                'Неверный email или пароль',
            );
        }

        const tokens = await this.generateTokens(
            user.id,
            user.email,
            user.role,
        );

        await this.saveRefreshToken(
            user.id,
            tokens.refreshToken,
        );

        return {
            user: this.getPublicUser(user),
            ...tokens,
        };
    }

    async refresh(refreshToken: string) {
        try {
            const payload = await this.jwtService.verifyAsync<{
                sub: string;
                email: string;
                type: string;
            }>(refreshToken);

            if (payload.type !== 'refresh') {
                throw new UnauthorizedException(
                    'Недействительный refresh token',
                );
            }

            const tokenHash = await bcrypt.hash(refreshToken, 10);

            const refreshTokens =
                await this.prisma.refreshToken.findMany({
                    where: {
                        userId: payload.sub,
                        revokedAt: null,
                        expiresAt: {
                            gt: new Date(),
                        },
                    },
                });

            let storedToken = null;

            for (const token of refreshTokens) {
                const isMatch = await bcrypt.compare(
                    refreshToken,
                    token.tokenHash,
                );

                if (isMatch) {
                    storedToken = token;
                    break;
                }
            }

            if (!storedToken) {
                throw new UnauthorizedException(
                    'Refresh token недействителен или истёк',
                );
            }

            await this.prisma.refreshToken.update({
                where: {
                    id: storedToken.id,
                },
                data: {
                    revokedAt: new Date(),
                },
            });

            const user = await this.prisma.user.findUnique({
                where: {
                    id: payload.sub,
                },
            });

            if (!user) {
                throw new UnauthorizedException(
                    'Пользователь не найден',
                );
            }

            const tokens = await this.generateTokens(
                user.id,
                user.email,
                user.role,
            );

            await this.saveRefreshToken(
                user.id,
                tokens.refreshToken,
            );

            return tokens;
        } catch {
            throw new UnauthorizedException(
                'Недействительный refresh token',
            );
        }
    }

    async logout(refreshToken: string) {
        try {
            const payload = await this.jwtService.verifyAsync<{
                sub: string;
                email: string;
                type: string;
            }>(refreshToken);

            if (payload.type !== 'refresh') {
                return {
                    message: 'Выход выполнен',
                };
            }

            const tokens =
                await this.prisma.refreshToken.findMany({
                    where: {
                        userId: payload.sub,
                        revokedAt: null,
                    },
                });

            for (const token of tokens) {
                const isMatch = await bcrypt.compare(
                    refreshToken,
                    token.tokenHash,
                );

                if (isMatch) {
                    await this.prisma.refreshToken.update({
                        where: {
                            id: token.id,
                        },
                        data: {
                            revokedAt: new Date(),
                        },
                    });

                    break;
                }
            }

            return {
                message: 'Выход выполнен',
            };
        } catch {
            return {
                message: 'Выход выполнен',
            };
        }
    }

    async getMe(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId,
            },
        });

        if (!user) {
            throw new UnauthorizedException(
                'Пользователь не найден',
            );
        }

        return this.getPublicUser(user);
    }

    private async generateTokens(
        userId: string,
        email: string,
        role: string,
    ) {
        const accessToken = await this.jwtService.signAsync(
            {
                sub: userId,
                email,
                role,
                type: 'access',
            },
            {
                expiresIn: '30m',
            },
        );

        const refreshToken = await this.jwtService.signAsync(
            {
                sub: userId,
                email,
                type: 'refresh',
            },
            {
                expiresIn: '30d',
            },
        );

        return {
            accessToken,
            refreshToken,
        };
    }

    private async saveRefreshToken(
        userId: string,
        refreshToken: string,
    ) {
        const tokenHash = await bcrypt.hash(
            refreshToken,
            10,
        );

        const expiresAt = new Date();

        expiresAt.setDate(
            expiresAt.getDate() + 30,
        );

        await this.prisma.refreshToken.create({
            data: {
                userId,
                tokenHash,
                expiresAt,
            },
        });
    }

    private getPublicUser(user: {
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        role: string;
        createdAt: Date;
        updatedAt: Date;
    }) {
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
}