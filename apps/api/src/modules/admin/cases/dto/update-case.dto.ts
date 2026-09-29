import {
    IsBoolean,
    IsIn,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';

export class UpdateCaseDto {
    @IsOptional()
    @IsString()
    @MaxLength(100)
    slug?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    @IsIn(['EASY', 'MEDIUM', 'HARD'])
    difficulty?: 'EASY' | 'MEDIUM' | 'HARD';

    @IsOptional()
    @IsString()
    @MaxLength(255)
    databaseName?: string;

    @IsOptional()
    @IsBoolean()
    published?: boolean;
}