import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { AdminLecturesService } from './admin-lectures.service.js';
import { CreateLectureDto, UpdateLectureDto } from './dto/lecture.dto.js';

@Controller('admin/lectures')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminLecturesController {
  constructor(private readonly service: AdminLecturesService) {}
  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Post() create(@Body() dto: CreateLectureDto) { return this.service.create(dto); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateLectureDto) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id); }
}
