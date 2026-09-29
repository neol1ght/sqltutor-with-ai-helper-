import {
    IsEmail,
    IsOptional,
    IsString,
    Length,
    MaxLength,
} from 'class-validator';

export class RegisterDto {
    @IsEmail()
    @MaxLength(255)
    email: string;

    @IsString()
    @Length(8, 100)
    password: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    firstName?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    lastName?: string;
}