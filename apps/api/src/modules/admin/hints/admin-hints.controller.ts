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

import { AdminHintsService } from './admin-hints.service.js';
import { CreateHintDto } from './dto/create-hint.dto.js';
import { UpdateHintDto } from './dto/update-hint.dto.js';

@Controller('admin/hints')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminHintsController {
    constructor(
        private readonly adminHintsService: AdminHintsService,
    ) {}

    @Get()
    findAll() {
        return this.adminHintsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.adminHintsService.findOne(id);
    }

    @Post()
    create(@Body() dto: CreateHintDto) {
        return this.adminHintsService.create(dto);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() dto: UpdateHintDto,
    ) {
        return this.adminHintsService.update(
            id,
            dto,
        );
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.adminHintsService.remove(id);
    }
}