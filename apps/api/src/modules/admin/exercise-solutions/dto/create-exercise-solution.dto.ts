import {
    IsNotEmpty,
    IsString,
} from 'class-validator';

export class CreateExerciseSolutionDto {
    @IsString()
    @IsNotEmpty()
    query: string;
}