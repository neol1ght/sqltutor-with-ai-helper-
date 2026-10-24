
import { Transform } from 'class-transformer';
import {
    IsEmail,
    IsString,
    Length,
    Matches,
    MaxLength,
} from 'class-validator';

const NAME_PATTERN =
    /^[\p{L}\p{M}]+(?:[ '-][\p{L}\p{M}]+)*$/u;

export class RegisterDto {
    @Transform(({ value }) =>
        typeof value === 'string' ? value.trim().toLowerCase() : value,
    )
    @IsEmail({}, { message: 'Введите корректный email' })
    @MaxLength(255, { message: 'Email слишком длинный' })
    email: string;

    @IsString({ message: 'Пароль должен быть строкой' })
    @Length(10, 100, {
        message: 'Пароль должен содержать от 10 до 100 символов',
    })
    @Matches(/^(?=.*\p{L})(?=.*\d).+$/u, {
        message: 'Пароль должен содержать хотя бы одну букву и одну цифру',
    })
    password: string;

    @Transform(({ value }) =>
        typeof value === 'string'
            ? value.trim().replace(/\s+/g, ' ')
            : value,
    )
    @IsString({ message: 'Имя должно быть строкой' })
    @Length(2, 50, {
        message: 'Имя должно содержать от 2 до 50 символов',
    })
    @Matches(NAME_PATTERN, {
        message:
            'Имя может содержать только буквы, пробелы, дефис и апостроф',
    })
    firstName: string;

    @Transform(({ value }) =>
        typeof value === 'string'
            ? value.trim().replace(/\s+/g, ' ')
            : value,
    )
    @IsString({ message: 'Фамилия должна быть строкой' })
    @Length(2, 50, {
        message: 'Фамилия должна содержать от 2 до 50 символов',
    })
    @Matches(NAME_PATTERN, {
        message:
            'Фамилия может содержать только буквы, пробелы, дефис и апостроф',
    })
    lastName: string;
}
