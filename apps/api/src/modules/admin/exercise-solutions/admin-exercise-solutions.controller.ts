import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';

import { AdminExerciseSolutionsService } from './admin-exercise-solutions.service.js';
import { CreateExerciseSolutionDto } from './dto/create-exercise-solution.dto.js';
import { UpdateExerciseSolutionDto } from './dto/update-exercise-solution.dto.js';

@Controller('admin/exercises')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminExerciseSolutionsController {
    constructor(
        private readonly adminExerciseSolutionsService: AdminExerciseSolutionsService,
    ) {}

    @Get(':exerciseId/solution')
    findOne(
        @Param('exerciseId') exerciseId: string,
    ) {
        return this.adminExerciseSolutionsService.findOne(
            exerciseId,
        );
    }

    @Post(':exerciseId/solution')
    create(
        @Param('exerciseId') exerciseId: string,
        @Body() dto: CreateExerciseSolutionDto,
    ) {
        return this.adminExerciseSolutionsService.create(
            exerciseId,
            dto,
        );
    }

    @Patch(':exerciseId/solution')
    update(
        @Param('exerciseId') exerciseId: string,
        @Body() dto: UpdateExerciseSolutionDto,
    ) {
        return this.adminExerciseSolutionsService.update(
            exerciseId,
            dto,
        );
    }

    @Delete(':exerciseId/solution')
    remove(
        @Param('exerciseId') exerciseId: string,
    ) {
        return this.adminExerciseSolutionsService.remove(
            exerciseId,
        );
    }
}