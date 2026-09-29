import {
    IsString,
    MinLength,
} from 'class-validator';

export class SubmitSqlDto {
    @IsString()
    @MinLength(1)
    query: string;
}