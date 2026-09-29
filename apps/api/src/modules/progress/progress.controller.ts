import {
    Controller,
    Get,
    Param,
    Req,
    UseGuards,
} from '@nestjs/common';

import { Request } from 'express';

import { ProgressService } from './progress.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

interface AuthenticatedRequest
    extends Request {
    user: {
        id: string;
        email: string;
    };
}

@Controller('progress')
@UseGuards(JwtAuthGuard)
export class ProgressController {
    constructor(
        private readonly progressService: ProgressService,
    ) {}

    @Get()
    async getOverallProgress(
        @Req() req: AuthenticatedRequest,
    ) {
        return this.progressService.getOverallProgress(
            req.user.id,
        );
    }

    @Get('cases/:caseId')
    async getCaseProgress(
        @Param('caseId') caseId: string,
        @Req() req: AuthenticatedRequest,
    ) {
        return this.progressService.getCaseProgress(
            req.user.id,
            caseId,
        );
    }

    @Get('exercises/:exerciseId')
    async getExerciseProgress(
        @Param('exerciseId') exerciseId: string,
        @Req() req: AuthenticatedRequest,
    ) {
        return this.progressService.getExerciseProgress(
            req.user.id,
            exerciseId,
        );
    }
}