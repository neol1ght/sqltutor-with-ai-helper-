import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import {RolesGuard} from "./guards/roles.guard.js";

@Module({
    imports: [
        PassportModule.register({
            defaultStrategy: 'jwt',
        }),

        JwtModule.register({
            secret: process.env.JWT_ACCESS_SECRET,
            signOptions: {
                expiresIn: '15m',
            },
        }),
    ],

    controllers: [
        AuthController,
    ],

    providers: [
        AuthService,
        JwtStrategy,
        RolesGuard,
    ],

    exports: [
        AuthService,
        JwtModule,
        PassportModule,
        RolesGuard,
    ],
})
export class AuthModule {}