import {
    IsInt,
    IsNotEmpty,
    IsString,
    Matches,
    Min,
} from 'class-validator';

export class CreateHintDto {
    @Matches(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        {
            message: 'exerciseId must be a valid UUID',
        },
    )
    exerciseId: string;

    @IsInt()
    @Min(1)
    level: number;

    @IsString()
    @IsNotEmpty()
    content: string;
}