import {
    IsBoolean,
    IsIn,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';

export class CreateCaseDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    slug: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsString()
    @IsIn(['EASY', 'MEDIUM', 'HARD'])
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';

    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    databaseName: string;

    @IsOptional()
    @IsBoolean()
    published?: boolean;
}