import {
    IsEmail,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';

export class UpdateProfileDto {
    @IsOptional()
    @IsString()
    @MaxLength(50)
    firstName?: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    lastName?: string;

    @IsEmail()
    @MaxLength(255)
    email!: string;
}