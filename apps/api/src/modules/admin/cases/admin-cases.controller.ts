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

import { AdminCasesService } from './admin-cases.service.js';
import { CreateCaseDto } from './dto/create-case.dto.js';
import { UpdateCaseDto } from './dto/update-case.dto.js';

@Controller('admin/cases')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminCasesController {
    constructor(
        private readonly adminCasesService: AdminCasesService,
    ) {}

    @Get()
    findAll() {
        return this.adminCasesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.adminCasesService.findOne(id);
    }

    @Post()
    create(@Body() dto: CreateCaseDto) {
        return this.adminCasesService.create(dto);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() dto: UpdateCaseDto,
    ) {
        return this.adminCasesService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.adminCasesService.remove(id);
    }
}