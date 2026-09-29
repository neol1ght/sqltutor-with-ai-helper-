import {
    IsEmail,
    IsOptional,
    IsString,
    MinLength,
} from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    @MinLength(1)
    firstName?: string;

    @IsOptional()
    @IsString()
    @MinLength(1)
    lastName?: string;
}