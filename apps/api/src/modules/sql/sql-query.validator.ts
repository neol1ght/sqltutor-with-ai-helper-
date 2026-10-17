import { BadRequestException } from '@nestjs/common';

export class SqlQueryValidator {
    static validate(query: string): string {
        if (typeof query !== 'string') {
            throw new BadRequestException(
                'SQL запрос должен быть строкой',
            );
        }

        // Убираем пробелы и BOM, который иногда появляется
        // при передаче текста между редактором и API.
        const normalized = query
            .replace(/^\uFEFF/, '')
            .trim();

        if (!normalized) {
            throw new BadRequestException(
                'SQL запрос не может быть пустым',
            );
        }

        // Удаляем один завершающий символ ;
        const withoutTrailingSemicolon =
            normalized.endsWith(';')
                ? normalized.slice(0, -1).trim()
                : normalized;

        if (!withoutTrailingSemicolon) {
            throw new BadRequestException(
                'SQL запрос не может быть пустым',
            );
        }

        // Разрешаем только один SQL statement.
        if (withoutTrailingSemicolon.includes(';')) {
            throw new BadRequestException(
                'Разрешён только один SQL запрос',
            );
        }

        // Убираем обычные SQL-комментарии перед запросом,
        // чтобы определить первое реальное ключевое слово.
        const withoutLeadingComments =
            withoutTrailingSemicolon
                .replace(/^(?:\s|--[^\n]*(?:\n|$)|\/\*[\s\S]*?\*\/)+/, '')
                .trim();

        const firstKeyword =
            withoutLeadingComments
                .match(/^[a-zA-Z]+/)?.[0]
                ?.toUpperCase();

        if (
            firstKeyword !== 'SELECT' &&
            firstKeyword !== 'WITH'
        ) {
            throw new BadRequestException(
                `Разрешены только SELECT и WITH запросы. Получено начало: "${withoutLeadingComments.slice(0, 40)}"`,
            );
        }

        const dangerousKeywords = [
            'INSERT',
            'UPDATE',
            'DELETE',
            'DROP',
            'ALTER',
            'TRUNCATE',
            'CREATE',
            'GRANT',
            'REVOKE',
            'COPY',
            'VACUUM',
            'ANALYZE',
            'CALL',
            'DO',
            'LOCK',
            'COMMENT',
            'REINDEX',
            'CLUSTER',
            'REFRESH',
        ];

        const upperQuery =
            withoutTrailingSemicolon.toUpperCase();

        for (const keyword of dangerousKeywords) {
            const pattern = new RegExp(
                `\\b${keyword}\\b`,
            );

            if (pattern.test(upperQuery)) {
                throw new BadRequestException(
                    `SQL запрос содержит запрещённую конструкцию: ${keyword}`,
                );
            }
        }

        return withoutTrailingSemicolon;
    }
}