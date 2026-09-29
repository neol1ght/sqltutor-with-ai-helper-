import {
    Controller,
    Get,
    Param,
} from '@nestjs/common';

import { CasesService } from './cases.service.js';

@Controller('cases')
export class CasesController {
    constructor(
        private readonly casesService: CasesService,
    ) {}

    @Get()
    async findAll() {
        return this.casesService.findAll();
    }

    @Get(':slug')
    async findBySlug(
        @Param('slug') slug: string,
    ) {
        return this.casesService.findBySlug(slug);
    }
}