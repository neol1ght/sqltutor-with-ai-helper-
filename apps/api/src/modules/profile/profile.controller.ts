import {
    Body,
    Controller,
    Get,
    Patch,
    Req,
    UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ProfileService } from './profile.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
    constructor(
        private readonly profileService: ProfileService,
    ) {}

    @Get()
    getProfile(@Req() req: any) {
        return this.profileService.getProfile(
            req.user.id,
        );
    }

    @Patch()
    updateProfile(
        @Req() req: any,
        @Body() dto: UpdateProfileDto,
    ) {
        return this.profileService.updateProfile(
            req.user.id,
            dto,
        );
    }
}