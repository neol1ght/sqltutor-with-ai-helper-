import {
    Controller,
    Get,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';

import { AdminSubmissionsService } from './admin-submissions.service.js';
import { SubmissionsFilterDto } from './dto/submission-filter.dto.js';

@Controller('admin/submissions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminSubmissionsController {
    constructor(
        private readonly adminSubmissionsService: AdminSubmissionsService,
    ) {}

    @Get()
    findAll(
        @Query() filters: SubmissionsFilterDto,
    ) {
        return this.adminSubmissionsService.findAll(
            filters,
        );
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.adminSubmissionsService.findOne(id);
    }
}