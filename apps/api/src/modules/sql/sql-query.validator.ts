import { BadRequestException } from '@nestjs/common';

export class SqlQueryValidator {
    static validate(query: string): string {
        const normalized = query.trim();

        if (!normalized) {
            throw new BadRequestException(
                'SQL запрос не может быть пустым',
            );
        }

        // Убираем один завершающий ;
        const withoutTrailingSemicolon =
            normalized.endsWith(';')
                ? normalized.slice(0, -1).trim()
                : normalized;

        if (!withoutTrailingSemicolon) {
            throw new BadRequestException(
                'SQL запрос не может быть пустым',
            );
        }

        // Запрещаем несколько SQL statements.
        if (
            withoutTrailingSemicolon.includes(';')
        ) {
            throw new BadRequestException(
                'Разрешён только один SQL запрос',
            );
        }

        const firstKeyword =
            withoutTrailingSemicolon
                .split(/\s+/)[0]
                .toUpperCase();

        if (
            firstKeyword !== 'SELECT' &&
            firstKeyword !== 'WITH'
        ) {
            throw new BadRequestException(
                'Разрешены только SELECT и WITH запросы',
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
            const pattern =
                new RegExp(
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