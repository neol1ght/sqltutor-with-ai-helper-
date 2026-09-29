import {
    Controller,
    Get,
    Req,
    UseGuards,
} from '@nestjs/common';

import { Request } from 'express';

import { AchievementsService } from './achievements.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

interface AuthenticatedRequest extends Request {
    user: {
        id: string;
        email: string;
    };
}

@Controller('achievements')
@UseGuards(JwtAuthGuard)
export class AchievementsController {
    constructor(
        private readonly achievementsService: AchievementsService,
    ) {}

    @Get()
    async getUserAchievements(
        @Req() req: AuthenticatedRequest,
    ) {
        return this.achievementsService.getUserAchievements(
            req.user.id,
        );
    }
}