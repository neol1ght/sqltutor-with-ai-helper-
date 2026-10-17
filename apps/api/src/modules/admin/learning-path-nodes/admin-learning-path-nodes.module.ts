import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module.js';
import { AdminLearningPathNodesController } from './admin-learning-path-nodes.controller.js';
import { AdminLearningPathNodesService } from './admin-learning-path-nodes.service.js';

@Module({
  imports: [AuthModule],
  controllers: [AdminLearningPathNodesController],
  providers: [AdminLearningPathNodesService],
})
export class AdminLearningPathNodesModule {}
