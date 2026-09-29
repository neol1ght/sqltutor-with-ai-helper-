import { Module } from '@nestjs/common';

import { AppController } from './app.controller.js';
import { HealthModule } from './modules/health/health.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import {CasesModule} from "./modules/cases/cases.module.js";
import {ExercisesModule} from "./modules/exercises/exercises.module.js";
import {SqlModule} from "./modules/sql/sql.module.js";
import {ProgressModule} from "./modules/progress/progress.module.js";
import {AchievementsModule} from "./modules/achievements/achievements.module.js";
import {AiModule} from "./modules/ai/ai.module.js";
import {HintsModule} from "./modules/hints/hints.module.js";
import {TelegramModule} from "./modules/telegram/telegram.module.js";
import {AdminModule} from "./modules/admin/admin.module.js";

@Module({
  imports: [
    PrismaModule,
    HealthModule,
    AuthModule,
    CasesModule,
    ExercisesModule,
    SqlModule,
    ProgressModule,
    AchievementsModule,
    AiModule,
    HintsModule,
    TelegramModule,
    AdminModule,

  ],
  controllers: [
    AppController,
  ],
})
export class AppModule {}