import { Body, Controller, Get, Param, Patch, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { LearningContentService } from './learning-content.service.js';

type AuthRequest = { user?: { userId?: string; id?: string; sub?: string } };

@Controller()
@UseGuards(JwtAuthGuard)
export class LearningContentController {
  constructor(private readonly service: LearningContentService) {}

  private userId(req: AuthRequest) {
    const id = req.user?.userId ?? req.user?.id ?? req.user?.sub;
    if (!id) throw new UnauthorizedException('Не удалось определить пользователя из токена');
    return id;
  }

  @Get('learning-paths/:caseSlug')
  roadmap(@Param('caseSlug') slug: string, @Req() req: AuthRequest) {
    return this.service.getRoadmap(slug, this.userId(req));
  }

  @Get('lectures/:slug')
  lecture(@Param('slug') slug: string, @Req() req: AuthRequest) {
    return this.service.getLecture(slug, this.userId(req));
  }

  @Patch('lectures/:id/progress')
  saveProgress(
    @Param('id') id: string,
    @Body() body: { lastPosition?: number; completed?: boolean },
    @Req() req: AuthRequest,
  ) {
    return this.service.saveLectureProgress(id, this.userId(req), body);
  }
}
