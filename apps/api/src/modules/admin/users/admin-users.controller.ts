import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';

import { AdminUsersService } from './admin-users.service.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminUsersController {
    constructor(
        private readonly adminUsersService: AdminUsersService,
    ) {}

    @Get()
    findAll() {
        return this.adminUsersService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.adminUsersService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() dto: UpdateUserDto,
    ) {
        return this.adminUsersService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.adminUsersService.remove(id);
    }
}