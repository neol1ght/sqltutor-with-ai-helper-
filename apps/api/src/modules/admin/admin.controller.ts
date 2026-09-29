import {
    Controller,
    Get,
    UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {

    @Get('test')
    @Roles('ADMIN')
    test() {
        return {
            success: true,
            message: 'Admin access granted',
        };
    }
}