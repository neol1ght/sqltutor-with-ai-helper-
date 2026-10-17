import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module.js';

import { AdminController } from './admin.controller.js';

import { AdminUsersController } from './users/admin-users.controller.js';
import { AdminUsersService } from './users/admin-users.service.js';

import { AdminCasesController } from './cases/admin-cases.controller.js';
import { AdminCasesService } from './cases/admin-cases.service.js';

import { AdminExercisesController } from './exercises/admin-exercises.controller.js';
import { AdminExercisesService } from './exercises/admin-exercises.service.js';

import { AdminHintsController } from './hints/admin-hints.controller.js';
import { AdminHintsService } from './hints/admin-hints.service.js';

import { AdminAchievementsController } from './achievements/admin-achievements.controller.js';
import { AdminAchievementsService } from './achievements/admin-achievements.service.js';

import { AdminSubmissionsController } from './submissions/admin-submissions.controller.js';
import { AdminSubmissionsService } from './submissions/admin-submissions.service.js';
import {AdminDashboardController} from "./dashboard/admin-dashboard.controller.js";
import {AdminDashboardService} from "./dashboard/admin-dashboard.service.js";
import {AdminExerciseSolutionsController} from "./exercise-solutions/admin-exercise-solutions.controller.js";
import {AdminExerciseSolutionsService} from "./exercise-solutions/admin-exercise-solutions.service.js";

@Module({
    imports: [
        AuthModule,
    ],

    controllers: [
        AdminController,
        AdminUsersController,
        AdminCasesController,
        AdminExercisesController,
        AdminHintsController,
        AdminAchievementsController,
        AdminSubmissionsController,
        AdminDashboardController,
        AdminExerciseSolutionsController,
    ],

    providers: [
        AdminUsersService,
        AdminCasesService,
        AdminExercisesService,
        AdminHintsService,
        AdminAchievementsService,
        AdminSubmissionsService,
        AdminDashboardService,
        AdminExerciseSolutionsService
    ],
})
export class AdminModule {}