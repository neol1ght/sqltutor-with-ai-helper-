import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { LearningContentController } from './learning-content.controller.js';
import { LearningContentService } from './learning-content.service.js';

@Module({
  imports: [AuthModule],
  controllers: [LearningContentController],
  providers: [LearningContentService],
})
export class LearningContentModule {}
