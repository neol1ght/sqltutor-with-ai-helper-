import {
    IsString,
    MinLength,
} from 'class-validator';

export class ExecuteSqlDto {
    @IsString()
    @MinLength(1)
    query: string;
}