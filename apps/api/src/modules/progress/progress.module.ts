import { Module } from '@nestjs/common';

import { ProgressController } from './progress.controller.js';
import { ProgressService } from './progress.service.js';
import {PrismaModule} from "../../prisma/prisma.module.js";
import {AuthModule} from "../auth/auth.module.js";

@Module({
    imports: [
        PrismaModule,
        AuthModule,
    ],
    controllers: [ProgressController],
    providers: [ProgressService],
    exports: [
        ProgressService,
    ],
})
export class ProgressModule {}