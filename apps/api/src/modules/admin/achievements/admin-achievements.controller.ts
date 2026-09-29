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

import { AdminAchievementsService } from './admin-achievements.service.js';
import { CreateAchievementDto } from './dto/create-achievement.dto.js';
import { UpdateAchievementDto } from './dto/update-achievement.dto.js';

@Controller('admin/achievements')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminAchievementsController {
    constructor(
        private readonly adminAchievementsService: AdminAchievementsService,
    ) {}

    @Get()
    findAll() {
        return this.adminAchievementsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.adminAchievementsService.findOne(id);
    }

    @Post()
    create(@Body() dto: CreateAchievementDto) {
        return this.adminAchievementsService.create(dto);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() dto: UpdateAchievementDto,
    ) {
        return this.adminAchievementsService.update(
            id,
            dto,
        );
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.adminAchievementsService.remove(id);
    }
}