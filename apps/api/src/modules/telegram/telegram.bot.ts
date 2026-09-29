import { Injectable } from '@nestjs/common';

import { Context } from 'telegraf';

@Injectable()
export class TelegramBot {
    async handleStart(ctx: Context) {
        await ctx.reply(
            [
                '👋 Привет! Я SQLTutor Bot.',
                '',
                'Я помогу тебе изучать SQL прямо из Telegram.',
                '',
                'Чтобы начать, привяжи свой аккаунт SQLTutor.',
            ].join('\n'),
        );
    }
}