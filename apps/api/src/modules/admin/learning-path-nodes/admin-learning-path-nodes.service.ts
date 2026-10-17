import { ConflictException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { CreateLearningPathNodeDto, UpdateLearningPathNodeDto } from './dto/learning-path-node.dto.js';

@Injectable()
export class AdminLearningPathNodesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.learningPathNode.findMany({
      include: {
        learningCase: { select: { id: true, title: true, slug: true } },
        lecture: { select: { id: true, title: true, slug: true, isPublished: true } },
        exercise: { select: { id: true, title: true, isPublished: true } },
      },
      orderBy: [{ caseId: 'asc' }, { sortOrder: 'asc' }],
    });
  }

  async findOne(id: string) {
    const node = await this.prisma.learningPathNode.findUnique({ where: { id } });
    if (!node) throw new NotFoundException('Этап роадмапа не найден');
    return node;
  }

  private async validateReferences(data: {
    caseId: string; type: 'LECTURE' | 'EXERCISE'; lectureId?: string | null; exerciseId?: string | null;
  }) {
    const learningCase = await this.prisma.learningCase.findUnique({ where: { id: data.caseId } });
    if (!learningCase) throw new NotFoundException('Учебный блок не найден');
    if (data.type === 'LECTURE') {
      if (!data.lectureId) throw new BadRequestException('Для этапа типа LECTURE выберите лекцию');
      const lecture = await this.prisma.lecture.findUnique({ where: { id: data.lectureId } });
      if (!lecture) throw new NotFoundException('Лекция не найдена');
    } else {
      if (!data.exerciseId) throw new BadRequestException('Для этапа типа EXERCISE выберите упражнение');
      const exercise = await this.prisma.exercise.findUnique({ where: { id: data.exerciseId } });
      if (!exercise || exercise.caseId !== data.caseId) throw new BadRequestException('Упражнение должно принадлежать выбранному учебному блоку');
    }
  }

  async create(dto: CreateLearningPathNodeDto) {
    await this.validateReferences(dto);
    const duplicate = await this.prisma.learningPathNode.findFirst({ where: { caseId: dto.caseId, sortOrder: dto.sortOrder } });
    if (duplicate) throw new ConflictException('Этап с таким порядком уже существует в этом блоке');
    return this.prisma.learningPathNode.create({
      data: {
        caseId: dto.caseId, type: dto.type, title: dto.title.trim(), description: dto.description,
        sortOrder: dto.sortOrder, lectureId: dto.type === 'LECTURE' ? dto.lectureId : null,
        exerciseId: dto.type === 'EXERCISE' ? dto.exerciseId : null, isPublished: dto.isPublished ?? false,
      },
      include: { learningCase: { select: { title: true, slug: true } }, lecture: { select: { title: true } }, exercise: { select: { title: true } } },
    });
  }

  async update(id: string, dto: UpdateLearningPathNodeDto) {
    const current = await this.findOne(id);
    const merged = {
      caseId: dto.caseId ?? current.caseId,
      type: dto.type ?? current.type,
      lectureId: dto.lectureId === undefined ? current.lectureId : dto.lectureId,
      exerciseId: dto.exerciseId === undefined ? current.exerciseId : dto.exerciseId,
    };
    await this.validateReferences(merged);
    const targetOrder = dto.sortOrder ?? current.sortOrder;
    const duplicate = await this.prisma.learningPathNode.findFirst({
      where: { caseId: merged.caseId, sortOrder: targetOrder, NOT: { id } },
    });
    if (duplicate) throw new ConflictException('Этап с таким порядком уже существует в этом блоке');
    return this.prisma.learningPathNode.update({
      where: { id },
      data: {
        caseId: dto.caseId, type: dto.type, title: dto.title?.trim(), description: dto.description,
        sortOrder: dto.sortOrder, lectureId: merged.type === 'LECTURE' ? merged.lectureId : null,
        exerciseId: merged.type === 'EXERCISE' ? merged.exerciseId : null, isPublished: dto.isPublished,
      },
      include: { learningCase: { select: { title: true, slug: true } }, lecture: { select: { title: true } }, exercise: { select: { title: true } } },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.learningPathNode.delete({ where: { id } });
    return { success: true, message: 'Этап роадмапа удалён' };
  }
}
