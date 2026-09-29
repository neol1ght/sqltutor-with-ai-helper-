import {
    Body,
    Controller,
    Get,
    Post,
    Req,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';

interface AuthenticatedRequest extends Request {
    user: {
        id: string;
        email: string;
    };
}

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) {}

    @Post('register')
    async register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Post('login')
    async login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Post('refresh')
    async refresh(
        @Body('refreshToken') refreshToken: string,
    ) {
        if (!refreshToken) {
            throw new UnauthorizedException(
                'Refresh token не передан',
            );
        }

        return this.authService.refresh(refreshToken);
    }

    @Post('logout')
    async logout(
        @Body('refreshToken') refreshToken: string,
    ) {
        if (!refreshToken) {
            return {
                message: 'Выход выполнен',
            };
        }

        return this.authService.logout(refreshToken);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getMe(
        @Req() req: AuthenticatedRequest,
    ) {
        return this.authService.getMe(req.user.id);
    }
}