import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';

import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class TelegramLinkService {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    async createLinkToken(userId: string) {
        const telegramAccount =
            await this.prisma.telegramAccount.findUnique({
                where: {
                    userId,
                },
            });

        if (telegramAccount) {
            throw new ConflictException(
                'Telegram account is already linked',
            );
        }

        const token = randomBytes(32).toString('hex');

        const tokenHash = createHash('sha256')
            .update(token)
            .digest('hex');

        const expiresAt = new Date(
            Date.now() + 15 * 60 * 1000,
        );

        await this.prisma.telegramLinkToken.create({
            data: {
                userId,
                tokenHash,
                expiresAt,
            },
        });

        const botUsername =
            process.env.TELEGRAM_BOT_USERNAME;

        if (!botUsername) {
            throw new Error(
                'TELEGRAM_BOT_USERNAME is not configured',
            );
        }

        return {
            url: `https://t.me/${botUsername}?start=${token}`,
            expiresAt,
        };
    }

    async findValidToken(token: string) {
        const tokenHash = createHash('sha256')
            .update(token)
            .digest('hex');

        const linkToken =
            await this.prisma.telegramLinkToken.findUnique({
                where: {
                    tokenHash,
                },
            });

        if (!linkToken) {
            throw new NotFoundException(
                'Telegram link token not found',
            );
        }

        if (linkToken.usedAt) {
            throw new ConflictException(
                'Telegram link token has already been used',
            );
        }

        if (linkToken.expiresAt < new Date()) {
            throw new ConflictException(
                'Telegram link token has expired',
            );
        }

        return linkToken;
    }
    async linkTelegramAccount(
        token: string,
        telegramUserId: bigint,
        username?: string,
    ) {
        const linkToken = await this.findValidToken(token);

        const existingTelegramAccount =
            await this.prisma.telegramAccount.findUnique({
                where: {
                    telegramUserId,
                },
            });

        if (existingTelegramAccount) {
            throw new ConflictException(
                'This Telegram account is already linked',
            );
        }

        const telegramAccount =
            await this.prisma.$transaction(async (tx) => {
                const account =
                    await tx.telegramAccount.create({
                        data: {
                            userId: linkToken.userId,
                            telegramUserId,
                            username: username ?? null,
                        },
                    });

                await tx.telegramLinkToken.update({
                    where: {
                        id: linkToken.id,
                    },
                    data: {
                        usedAt: new Date(),
                    },
                });

                return account;
            });

        return telegramAccount;
    }
    async findUserByTelegramId(telegramUserId: bigint) {
        return this.prisma.telegramAccount.findUnique({
            where: {
                telegramUserId,
            },
            select: {
                userId: true,
                username: true,
            },
        });
    }
}