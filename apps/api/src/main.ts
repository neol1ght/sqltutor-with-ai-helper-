import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module.js';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.setGlobalPrefix('api');

    const allowedOrigins = [
        'http://localhost:3000',
        ...(process.env.FRONTEND_URL ?? '')
            .split(',')
            .map((url) => url.trim().replace(/\/$/, ''))
            .filter(Boolean),
    ];

    app.enableCors({
        origin: allowedOrigins,
        methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
        }),
    );

    await app.listen(process.env.PORT ?? 3500, '0.0.0.0');
}

await bootstrap();