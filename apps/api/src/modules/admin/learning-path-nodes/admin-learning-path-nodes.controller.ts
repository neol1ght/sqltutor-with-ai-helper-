import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { AdminLearningPathNodesService } from './admin-learning-path-nodes.service.js';
import { CreateLearningPathNodeDto, UpdateLearningPathNodeDto } from './dto/learning-path-node.dto.js';

@Controller('admin/learning-path-nodes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminLearningPathNodesController {
  constructor(private readonly service: AdminLearningPathNodesService) {}
  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Post() create(@Body() dto: CreateLearningPathNodeDto) { return this.service.create(dto); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateLearningPathNodeDto) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id); }
}
