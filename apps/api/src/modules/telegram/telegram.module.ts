import { Module } from '@nestjs/common';

import { TelegramService } from './telegram.service.js';
import { TelegramLinkService } from './telegram-link.service.js';
import {PrismaModule} from "../../prisma/prisma.module.js";
import {AuthModule} from "../auth/auth.module.js";
import {TelegramController} from "./telegram.controller.js";
import {CasesModule} from "../cases/cases.module.js";
import {ExercisesModule} from "../exercises/exercises.module.js";
import {TelegramSessionService} from "./telegram-session.service.js";
import {SqlModule} from "../sql/sql.module.js";
import {ProgressModule} from "../progress/progress.module.js";
import {AchievementsModule} from "../achievements/achievements.module.js";
import {HintsModule} from "../hints/hints.module.js";
import {AiModule} from "../ai/ai.module.js";

@Module({
    imports: [
        PrismaModule,
        AuthModule,
        CasesModule,
        ExercisesModule,
        SqlModule,
        ProgressModule,
        AchievementsModule,
        HintsModule,
        AiModule
    ],
    controllers: [TelegramController],
    providers: [
        TelegramService,
        TelegramLinkService,
        TelegramSessionService,

    ],
    exports: [
        TelegramService,
        TelegramLinkService,
    ],
})
export class TelegramModule {}

