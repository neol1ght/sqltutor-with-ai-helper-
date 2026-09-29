import { Module } from '@nestjs/common';

import { SqlController } from './sql.controller.js';
import { SqlService } from './sql.service.js';

import { AchievementsModule } from '../achievements/achievements.module.js';
import {PrismaModule} from "../../prisma/prisma.module.js";
import {AuthModule} from "../auth/auth.module.js";

@Module({
    imports: [
        PrismaModule,
        AuthModule,
        AchievementsModule,
    ],

    controllers: [
        SqlController,
    ],

    providers: [
        SqlService,
    ],
    exports: [SqlService],
})
export class SqlModule {}