import {
    Controller,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { TelegramLinkService } from './telegram-link.service.js';

interface AuthenticatedRequest extends Request {
    user: {
        id: string;
        email: string;
    };
}

@Controller('telegram')
export class TelegramController {
    constructor(
        private readonly telegramLinkService: TelegramLinkService,
    ) {}

    @UseGuards(JwtAuthGuard)
    @Post('link')
    async createLink(
        @Req() req: AuthenticatedRequest,
    ) {
        return this.telegramLinkService.createLinkToken(
            req.user.id,
        );
    }
}