import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module.js';
import { AdminLecturesController } from './admin-lectures.controller.js';
import { AdminLecturesService } from './admin-lectures.service.js';

@Module({
  imports: [AuthModule],
  controllers: [AdminLecturesController],
  providers: [AdminLecturesService],
})
export class AdminLecturesModule {}
