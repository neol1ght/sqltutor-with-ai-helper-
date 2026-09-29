import {
    Controller,
    Get,
    Param,
} from '@nestjs/common';

import { HintsService } from './hints.service.js';

@Controller('exercises')
export class HintsController {
    constructor(
        private readonly hintsService: HintsService,
    ) {}

    @Get(':id/hints')
    async getExerciseHints(
        @Param('id') exerciseId: string,
    ) {
        return this.hintsService.getExerciseHints(
            exerciseId,
        );
    }
}