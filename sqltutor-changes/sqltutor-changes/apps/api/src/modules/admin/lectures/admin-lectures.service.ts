import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, exercise_difficulty } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { CreateLectureDto, UpdateLectureDto } from './dto/lecture.dto.js';
import { validateLectureContent } from './lecture-content.validator.js';

@Injectable()
export class AdminLecturesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.lecture.findMany({
      select: {
        id: true, slug: true, title: true, summary: true, content: true,
        estimatedMinutes: true, difficulty: true, isPublished: true,
        createdAt: true, updatedAt: true,
        _count: { select: { roadmapNodes: true, lectureProgress: true } },
      },
      orderBy: [{ updatedAt: 'desc' }],
    });
  }

  async findOne(id: string) {
    const lecture = await this.prisma.lecture.findUnique({ where: { id } });
    if (!lecture) throw new NotFoundException('Лекция не найдена');
    return lecture;
  }

  async create(dto: CreateLectureDto) {
    const exists = await this.prisma.lecture.findUnique({ where: { slug: dto.slug } });
    if (exists) throw new ConflictException('Лекция с таким slug уже существует');
    const content = validateLectureContent(dto.content);
    return this.prisma.lecture.create({
      data: {
        slug: dto.slug.trim(),
        title: dto.title.trim(),
        summary: dto.summary,
        content: content as Prisma.InputJsonValue,
        estimatedMinutes: dto.estimatedMinutes ?? 10,
        difficulty: (dto.difficulty ?? 'EASY') as exercise_difficulty,
        isPublished: dto.isPublished ?? false,
      },
    });
  }

  async update(id: string, dto: UpdateLectureDto) {
    await this.findOne(id);
    if (dto.slug) {
      const exists = await this.prisma.lecture.findFirst({ where: { slug: dto.slug, NOT: { id } } });
      if (exists) throw new ConflictException('Лекция с таким slug уже существует');
    }
    const data: Prisma.LectureUpdateInput = {
      slug: dto.slug?.trim(),
      title: dto.title?.trim(),
      summary: dto.summary,
      estimatedMinutes: dto.estimatedMinutes,
      difficulty: dto.difficulty as exercise_difficulty | undefined,
      isPublished: dto.isPublished,
    };
    if (dto.content !== undefined) data.content = validateLectureContent(dto.content) as Prisma.InputJsonValue;
    return this.prisma.lecture.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.lecture.delete({ where: { id } });
    return { success: true, message: 'Лекция удалена' };
  }
}
