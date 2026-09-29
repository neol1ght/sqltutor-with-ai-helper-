import {
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common';

import { Client } from 'pg';

@Injectable()
export class DatabaseSchemaService {
    async getSchema(
        databaseName: string,
    ): Promise<string> {
        const baseUrl = process.env.DATABASE_URL;

        if (!baseUrl) {
            throw new Error(
                'DATABASE_URL is not configured',
            );
        }

        const url = new URL(baseUrl);

        url.pathname = `/${databaseName}`;

        const client = new Client({
            connectionString: url.toString(),
        });

        try {
            await client.connect();

            /*
             * Получаем таблицы и колонки.
             */
            const columnsResult = await client.query(`
                SELECT
                    table_name,
                    column_name,
                    data_type,
                    is_nullable
                FROM information_schema.columns
                WHERE table_schema = 'public'
                ORDER BY
                    table_name,
                    ordinal_position;
            `);

            /*
             * Получаем внешние ключи.
             */
            const foreignKeysResult = await client.query(`
                SELECT
                    tc.table_name AS table_name,
                    kcu.column_name AS column_name,
                    ccu.table_name AS foreign_table_name,
                    ccu.column_name AS foreign_column_name
                FROM information_schema.table_constraints AS tc
                JOIN information_schema.key_column_usage AS kcu
                    ON tc.constraint_name = kcu.constraint_name
                    AND tc.table_schema = kcu.table_schema
                JOIN information_schema.constraint_column_usage AS ccu
                    ON ccu.constraint_name = tc.constraint_name
                    AND ccu.table_schema = tc.table_schema
                WHERE
                    tc.constraint_type = 'FOREIGN KEY'
                    AND tc.table_schema = 'public'
                ORDER BY
                    tc.table_name,
                    kcu.column_name;
            `);

            return this.formatSchema(
                columnsResult.rows,
                foreignKeysResult.rows,
            );
        } catch (error) {
            console.error(
                'Database schema error:',
                error,
            );

            throw new InternalServerErrorException(
                'Unable to read training database schema',
            );
        } finally {
            await client.end();
        }
    }

    private formatSchema(
        columns: {
            table_name: string;
            column_name: string;
            data_type: string;
            is_nullable: string;
        }[],
        foreignKeys: {
            table_name: string;
            column_name: string;
            foreign_table_name: string;
            foreign_column_name: string;
        }[],
    ): string {
        const tables = new Map<
            string,
            {
                column_name: string;
                data_type: string;
                is_nullable: string;
            }[]
        >();

        for (const column of columns) {
            if (!tables.has(column.table_name)) {
                tables.set(column.table_name, []);
            }

            tables.get(column.table_name)!.push(column);
        }

        const lines: string[] = [
            'DATABASE SCHEMA',
            '',
        ];

        for (const [tableName, tableColumns] of tables) {
            lines.push(`${tableName}`);

            for (const column of tableColumns) {
                const nullable =
                    column.is_nullable === 'YES'
                        ? 'NULL'
                        : 'NOT NULL';

                lines.push(
                    `  ${column.column_name} ${column.data_type} ${nullable}`,
                );
            }

            lines.push('');
        }

        if (foreignKeys.length > 0) {
            lines.push('RELATIONSHIPS');
            lines.push('');

            for (const foreignKey of foreignKeys) {
                lines.push(
                    `${foreignKey.table_name}.${foreignKey.column_name} -> ${foreignKey.foreign_table_name}.${foreignKey.foreign_column_name}`,
                );
            }
        }

        return lines.join('\n');
    }
}