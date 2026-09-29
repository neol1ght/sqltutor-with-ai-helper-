import { Module } from '@nestjs/common';

import { AdminHintsController } from './admin-hints.controller.js';
import { AdminHintsService } from './admin-hints.service.js';

@Module({
    controllers: [AdminHintsController],
    providers: [AdminHintsService],
})
export class AdminHintsModule {}