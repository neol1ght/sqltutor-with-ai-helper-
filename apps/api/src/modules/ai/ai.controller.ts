import {
    Body,
    Controller,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { AiService } from './ai.service.js';
import { ChatDto } from './dto/chat.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

interface AuthenticatedRequest extends Request {
    user: {
        id: string;
        email: string;
    };
}

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
    constructor(
        private readonly aiService: AiService,
    ) {}

    @Post('chat')
    async chat(
        @Req() req: AuthenticatedRequest,
        @Body() dto: ChatDto,
    ) {
        return this.aiService.chat(
            req.user.id,
            dto.message,
            dto.exerciseId,
            dto.conversationId,
            dto.query,
            dto.executionResult,
        );
    }
}