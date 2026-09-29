import {
    Body,
    Controller,
    Param,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';

import { Request } from 'express';

import { SqlService } from './sql.service.js';
import { ExecuteSqlDto } from './dto/execute-sql.dto.js';
import { SubmitSqlDto } from './dto/submit-sql.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

interface AuthenticatedRequest extends Request {
    user: {
        id: string;
        email: string;
    };
}

@Controller('exercises')
export class SqlController {
    constructor(
        private readonly sqlService: SqlService,
    ) {}

    @Post(':id/execute')
    async execute(
        @Param('id') exerciseId: string,
        @Body() dto: ExecuteSqlDto,
    ) {
        return this.sqlService.execute(
            exerciseId,
            dto.query,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/submit')
    async submit(
        @Param('id') exerciseId: string,
        @Body() dto: SubmitSqlDto,
        @Req() req: AuthenticatedRequest,
    ) {
        return this.sqlService.submit(
            exerciseId,
            dto.query,
            req.user.id,
        );
    }
}