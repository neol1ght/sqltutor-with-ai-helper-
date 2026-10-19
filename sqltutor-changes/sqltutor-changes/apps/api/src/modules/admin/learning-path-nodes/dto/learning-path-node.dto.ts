import { IsBoolean, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class CreateLearningPathNodeDto {
  @IsUUID("loose") caseId: string;
  @IsIn(['LECTURE', 'EXERCISE']) type: 'LECTURE' | 'EXERCISE';
  @IsString() @IsNotEmpty() @MaxLength(255) title: string;
  @IsOptional() @IsString() description?: string;
  @IsInt() @Min(1) sortOrder: number;
  @IsOptional() @IsUUID("loose") lectureId?: string;
  @IsOptional() @IsUUID("loose") exerciseId?: string;
  @IsOptional() @IsBoolean() isPublished?: boolean;
}
export class UpdateLearningPathNodeDto {
  @IsOptional() @IsUUID("loose") caseId?: string;
  @IsOptional() @IsIn(['LECTURE', 'EXERCISE']) type?: 'LECTURE' | 'EXERCISE';
  @IsOptional() @IsString() @IsNotEmpty() @MaxLength(255) title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsInt() @Min(1) sortOrder?: number;
  @IsOptional() @IsUUID("loose") lectureId?: string | null;
  @IsOptional() @IsUUID("loose") exerciseId?: string | null;
  @IsOptional() @IsBoolean() isPublished?: boolean;
}
