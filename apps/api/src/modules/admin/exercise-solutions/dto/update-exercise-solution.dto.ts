import {
    IsNotEmpty,
    IsString,
} from 'class-validator';

export class UpdateExerciseSolutionDto {
    @IsString()
    @IsNotEmpty()
    query: string;
}