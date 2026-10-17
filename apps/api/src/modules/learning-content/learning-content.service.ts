import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class LearningContentService {
  constructor(private readonly prisma: PrismaService) {}

  async getRoadmap(caseSlug: string, userId: string) {
    const learningCase = await this.prisma.learningCase.findFirst({
      where: { slug: caseSlug, isPublished: true },
      select: { id: true, slug: true, title: true, description: true, difficulty: true },
    });
    if (!learningCase) throw new NotFoundException('Учебный блок не найден или не опубликован');

    const nodes = await this.prisma.learningPathNode.findMany({
      where: { caseId: learningCase.id, isPublished: true },
      include: {
        lecture: { select: { id: true, slug: true, title: true, estimatedMinutes: true, difficulty: true, isPublished: true } },
        exercise: { select: { id: true, title: true, difficulty: true, isPublished: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });

    const lectureIds = nodes.flatMap((n) => n.type === 'LECTURE' && n.lectureId ? [n.lectureId] : []);
    const exerciseIds = nodes.flatMap((n) => n.type === 'EXERCISE' && n.exerciseId ? [n.exerciseId] : []);
    const [lectureProgress, exerciseProgress] = await Promise.all([
      this.prisma.lectureProgress.findMany({ where: { userId, lectureId: { in: lectureIds } } }),
      this.prisma.userExerciseProgress.findMany({ where: { userId, exerciseId: { in: exerciseIds } } }),
    ]);
    const lectures = new Map(lectureProgress.map((p) => [p.lectureId, p]));
    const exercises = new Map(exerciseProgress.map((p) => [p.exerciseId, p]));

    let previousCompleted = true;
    const mapped = nodes.map((node, index) => {
      const completed = node.type === 'LECTURE'
        ? Boolean(node.lectureId && lectures.get(node.lectureId)?.completedAt)
        : Boolean(node.exerciseId && exercises.get(node.exerciseId)?.status === 'SOLVED');
      const unlocked = index === 0 || previousCompleted;
      previousCompleted = completed;
      return {
        id: node.id, type: node.type, title: node.title, description: node.description,
        sortOrder: node.sortOrder, unlocked, completed,
        lecture: node.lecture?.isPublished ? node.lecture : null,
        exercise: node.exercise?.isPublished ? node.exercise : null,
      };
    });
    const completedCount = mapped.filter((n) => n.completed).length;
    return {
      learningCase,
      nodes: mapped,
      progress: {
        completed: completedCount,
        total: mapped.length,
        percent: mapped.length ? Math.round((completedCount / mapped.length) * 100) : 0,
      },
    };
  }

  async getLecture(slug: string, userId: string) {
    const lecture = await this.prisma.lecture.findFirst({
      where: { slug, isPublished: true },
      select: {
        id: true, slug: true, title: true, summary: true, content: true,
        estimatedMinutes: true, difficulty: true,
      },
    });
    if (!lecture) throw new NotFoundException('Лекция не найдена или не опубликована');
    const progress = await this.prisma.lectureProgress.findUnique({
      where: { userId_lectureId: { userId, lectureId: lecture.id } },
    });
    return { ...lecture, progress: progress ? { lastPosition: progress.lastPosition, completedAt: progress.completedAt } : { lastPosition: 0, completedAt: null } };
  }

  async saveLectureProgress(lectureId: string, userId: string, input: { lastPosition?: number; completed?: boolean }) {
    const lecture = await this.prisma.lecture.findFirst({ where: { id: lectureId, isPublished: true } });
    if (!lecture) throw new NotFoundException('Лекция не найдена или не опубликована');
    const current = await this.prisma.lectureProgress.findUnique({ where: { userId_lectureId: { userId, lectureId } } });
    const completedAt = input.completed ? (current?.completedAt ?? new Date()) : current?.completedAt ?? null;
    return this.prisma.lectureProgress.upsert({
      where: { userId_lectureId: { userId, lectureId } },
      create: { userId, lectureId, lastPosition: Math.max(0, input.lastPosition ?? 0), completedAt },
      update: { lastPosition: Math.max(0, input.lastPosition ?? current?.lastPosition ?? 0), completedAt },
    });
  }
}
