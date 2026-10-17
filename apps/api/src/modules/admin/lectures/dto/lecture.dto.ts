import {
  IsArray, IsBoolean, IsIn, IsInt, IsNotEmpty, IsObject,
  IsOptional, IsString, Max, MaxLength, Min,
} from 'class-validator';

export class CreateLectureDto {
  @IsString() @IsNotEmpty() @MaxLength(255)
  slug: string;

  @IsString() @IsNotEmpty() @MaxLength(255)
  title: string;

  @IsOptional() @IsString()
  summary?: string;

  @IsArray()
  content: Record<string, unknown>[];

  @IsOptional() @IsInt() @Min(1) @Max(240)
  estimatedMinutes?: number;

  @IsOptional() @IsIn(['EASY', 'MEDIUM', 'HARD'])
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';

  @IsOptional() @IsBoolean()
  isPublished?: boolean;
}

export class UpdateLectureDto {
  @IsOptional() @IsString() @IsNotEmpty() @MaxLength(255)
  slug?: string;

  @IsOptional() @IsString() @IsNotEmpty() @MaxLength(255)
  title?: string;

  @IsOptional() @IsString()
  summary?: string;

  @IsOptional() @IsArray()
  content?: Record<string, unknown>[];

  @IsOptional() @IsInt() @Min(1) @Max(240)
  estimatedMinutes?: number;

  @IsOptional() @IsIn(['EASY', 'MEDIUM', 'HARD'])
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';

  @IsOptional() @IsBoolean()
  isPublished?: boolean;
}
