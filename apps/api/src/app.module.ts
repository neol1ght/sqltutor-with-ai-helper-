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
import {ProfileModule} from "./modules/profile/profile.module.js";
import {DashboardModule} from "./modules/dashboard/dashboard.module.js";
import { AdminLecturesModule } from './modules/admin/lectures/admin-lectures.module.js';
import { AdminLearningPathNodesModule } from './modules/admin/learning-path-nodes/admin-learning-path-nodes.module.js';
import { LearningContentModule } from './modules/learning-content/learning-content.module.js';

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
    ProfileModule,
    DashboardModule,
    AdminLecturesModule,
    AdminLearningPathNodesModule,
    LearningContentModule

  ],
  controllers: [
    AppController,
  ],
})
export class AppModule {}
