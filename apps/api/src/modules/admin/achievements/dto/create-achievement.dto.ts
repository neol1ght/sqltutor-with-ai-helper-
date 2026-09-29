import {
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';

export class CreateAchievementDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    code: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    icon?: string;
}