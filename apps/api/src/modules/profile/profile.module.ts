import { Module } from '@nestjs/common';

import { ProfileController } from './profile.controller.js';
import { ProfileService } from './profile.service.js';

import {AuthModule} from "../auth/auth.module.js";
import {PrismaModule} from "../../prisma/prisma.module.js";

@Module({
    imports: [PrismaModule, AuthModule],
    controllers: [ProfileController],
    providers: [ProfileService],
})
export class ProfileModule {}