import { BadRequestException } from '@nestjs/common';

export type LectureContentBlock = Record<string, unknown>;

const ALLOWED_TYPES = ['text', 'code', 'callout', 'quiz', 'video'] as const;
type BlockType = (typeof ALLOWED_TYPES)[number];

const VIDEO_EMBED_HOSTS = new Set([
    'youtube.com',
    'www.youtube.com',
    'm.youtube.com',
    'youtu.be',
    'www.youtu.be',
    'youtube-nocookie.com',
    'www.youtube-nocookie.com',
    'rutube.ru',
    'www.rutube.ru',
]);

const VIDEO_FILE_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.m4v', '.mov'];

function isBlockType(value: unknown): value is BlockType {
    return typeof value === 'string' && (ALLOWED_TYPES as readonly string[]).includes(value);
}

function validateVideoUrl(url: unknown): string {
    if (typeof url !== 'string' || !url.trim()) {
        throw new BadRequestException('Видео-блок должен содержать ссылку (url) на видео.');
    }

    let parsed: URL;

    try {
        parsed = new URL(url.trim());
    } catch {
        throw new BadRequestException('Ссылка на видео не является корректным URL.');
    }

    if (parsed.protocol !== 'https:') {
        throw new BadRequestException('Ссылка на видео должна использовать https.');
    }

    const host = parsed.hostname.toLowerCase();

    if (VIDEO_EMBED_HOSTS.has(host)) {
        return parsed.toString();
    }

    const pathname = parsed.pathname.toLowerCase();

    if (VIDEO_FILE_EXTENSIONS.some((extension) => pathname.endsWith(extension))) {
        return parsed.toString();
    }

    throw new BadRequestException(
        'Для видеоурока разрешены ссылки YouTube, Rutube или прямые ссылки на видеофайлы (.mp4, .webm, .ogg, .m4v, .mov).',
    );
}

function validateBlock(block: unknown, index: number): void {
    if (typeof block !== 'object' || block === null || Array.isArray(block)) {
        throw new BadRequestException(`Блок ${index + 1} должен быть объектом.`);
    }

    const record = block as LectureContentBlock;

    if (!isBlockType(record.type)) {
        throw new BadRequestException(
            `Блок ${index + 1}: тип должен быть одним из ${ALLOWED_TYPES.join(', ')}.`,
        );
    }

    switch (record.type) {
        case 'text':
        case 'callout': {
            if (typeof record.body !== 'string' || !record.body.trim()) {
                throw new BadRequestException(`Блок ${index + 1} (${record.type}): поле body обязательно.`);
            }
            break;
        }

        case 'code': {
            if (typeof record.code !== 'string' || !record.code.trim()) {
                throw new BadRequestException(`Блок ${index + 1} (code): поле code обязательно.`);
            }
            break;
        }

        case 'quiz': {
            const options = record.options;

            if (!Array.isArray(options) || options.length < 2 || options.some((option) => typeof option !== 'string')) {
                throw new BadRequestException(
                    `Блок ${index + 1} (quiz): options должен содержать минимум 2 строки.`,
                );
            }

            const correctOption = record.correctOption;

            if (
                typeof correctOption !== 'number' ||
                !Number.isInteger(correctOption) ||
                correctOption < 0 ||
                correctOption >= options.length
            ) {
                throw new BadRequestException(
                    `Блок ${index + 1} (quiz): correctOption должен быть индексом одного из вариантов.`,
                );
            }
            break;
        }

        case 'video': {
            validateVideoUrl(record.url);
            break;
        }
    }
}

/**
 * Проверяет содержимое лекции перед сохранением.
 * Возвращает проверенные блоки без изменений.
 */
export function validateLectureContent(content: unknown): LectureContentBlock[] {
    if (!Array.isArray(content)) {
        throw new BadRequestException('Содержимое лекции должно быть JSON-массивом блоков.');
    }

    content.forEach(validateBlock);

    return content as LectureContentBlock[];
}
