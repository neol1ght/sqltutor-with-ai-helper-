import { Module } from '@nestjs/common';

import { AchievementsController } from './achievements.controller.js';
import { AchievementsService } from './achievements.service.js';
import {PrismaModule} from "../../prisma/prisma.module.js";
import {AuthModule} from "../auth/auth.module.js";

@Module({
    imports: [
        PrismaModule,
        AuthModule,
    ],
    controllers: [
        AchievementsController,
    ],

    providers: [
        AchievementsService,
    ],

    exports: [
        AchievementsService,
    ],
})
export class AchievementsModule {}