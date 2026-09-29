import { Module } from '@nestjs/common';

import { HintsController } from './hints.controller.js';
import { HintsService } from './hints.service.js';
import {PrismaModule} from "../../prisma/prisma.module.js";
import {AuthModule} from "../auth/auth.module.js";

@Module({
    imports: [PrismaModule, AuthModule],
    controllers: [HintsController],
    providers: [HintsService],
    exports: [HintsService],
})
export class HintsModule {}