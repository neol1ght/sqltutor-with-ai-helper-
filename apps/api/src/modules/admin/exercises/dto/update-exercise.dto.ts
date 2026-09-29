import {
    IsBoolean,
    IsInt,
    IsOptional,
    IsString,
    IsUUID, Matches,
    MaxLength,
    Min,
} from 'class-validator';

export class UpdateExerciseDto {
    @IsOptional()
    @Matches(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        {
            message: 'exerciseId must be a valid UUID',
        },
    )
    caseId?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    difficulty?: 'EASY' | 'MEDIUM' | 'HARD';

    @IsOptional()
    @IsInt()
    @Min(1)
    sortOrder?: number;

    @IsOptional()
    @IsBoolean()
    isPublished?: boolean;
}