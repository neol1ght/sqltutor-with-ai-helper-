import { Module } from '@nestjs/common';

import { AiController } from './ai.controller.js';
import { AiService } from './ai.service.js';
import {PrismaModule} from "../../prisma/prisma.module.js";
import {AuthModule} from "../auth/auth.module.js";
import {DatabaseSchemaService} from "./database-shema.service.js";

@Module({
    imports: [
        PrismaModule,
        AuthModule,
    ],
    controllers: [
        AiController,
    ],
    providers: [
        AiService,
        DatabaseSchemaService,
    ],
    exports: [ AiService, ],
})
export class AiModule {}