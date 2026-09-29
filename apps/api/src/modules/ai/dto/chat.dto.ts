import {
    IsString,
    IsOptional,
    MinLength,
} from 'class-validator';

export class ChatDto {
    @IsString()
    @MinLength(1)
    message: string;

    @IsOptional()
    @IsString()
    exerciseId?: string;

    @IsOptional()
    @IsString()
    conversationId?: string;

    @IsOptional()
    @IsString()
    query?: string;

    @IsOptional()
    @IsString()
    executionResult?: string;
}