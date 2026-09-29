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

import { AdminExercisesService } from './admin-exercises.service.js';
import { CreateExerciseDto } from './dto/create-exercise.dto.js';
import { UpdateExerciseDto } from './dto/update-exercise.dto.js';

@Controller('admin/exercises')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminExercisesController {
    constructor(
        private readonly adminExercisesService: AdminExercisesService,
    ) {}

    @Get()
    findAll() {
        return this.adminExercisesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.adminExercisesService.findOne(id);
    }

    @Post()
    create(@Body() dto: CreateExerciseDto) {
        return this.adminExercisesService.create(dto);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() dto: UpdateExerciseDto,
    ) {
        return this.adminExercisesService.update(
            id,
            dto,
        );
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.adminExercisesService.remove(id);
    }
}