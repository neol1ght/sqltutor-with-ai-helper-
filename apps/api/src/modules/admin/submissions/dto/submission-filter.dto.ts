import {
    IsBooleanString,
    IsInt,
    IsOptional,
    IsString,
    Max,
    Min,
} from 'class-validator';

export class SubmissionsFilterDto {
    @IsOptional()
    @IsString()
    userId?: string;

    @IsOptional()
    @IsString()
    exerciseId?: string;

    @IsOptional()
    @IsBooleanString()
    isCorrect?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number;
}