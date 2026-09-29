import {
    IsBoolean,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Matches,
    MaxLength,
    Min,
} from 'class-validator';

export class CreateExerciseDto {
    @Matches(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        {
            message: 'caseId must be a valid UUID',
        },
    )
    caseId: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsNotEmpty()
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';

    @IsInt()
    @Min(1)
    sortOrder: number;

    @IsOptional()
    @IsBoolean()
    isPublished?: boolean;
}