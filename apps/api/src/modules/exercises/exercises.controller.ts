import {
    Controller,
    Get,
    Param,
} from '@nestjs/common';

import { ExercisesService } from './exercises.service.js';

@Controller()
export class ExercisesController {
    constructor(
        private readonly exercisesService: ExercisesService,
    ) {}

    @Get('cases/:slug/exercises')
    async findByCaseSlug(
        @Param('slug') slug: string,
    ) {
        return this.exercisesService.findByCaseSlug(slug);
    }

    @Get('exercises/:id')
    async findById(
        @Param('id') id: string,
    ) {
        return this.exercisesService.findById(id);
    }
}