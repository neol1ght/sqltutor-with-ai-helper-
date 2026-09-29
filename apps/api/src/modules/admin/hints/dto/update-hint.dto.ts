import {
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Matches,
    Min,
} from 'class-validator';

export class UpdateHintDto {
    @IsOptional()
    @Matches(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        {
            message: 'exerciseId must be a valid UUID',
        },
    )
    exerciseId?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    level?: number;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    content?: string;
}