import * as SQLite from 'expo-sqlite';
import { ISqliteAdapter, RunResult, SqlValue } from '../../../domain';
import { DATABASE_NAME } from '../../../domain/constants/database.constants';

export class SqliteAdapter implements ISqliteAdapter {
    private db: SQLite.SQLiteDatabase;

    private constructor(db: SQLite.SQLiteDatabase) {
        this.db = db;
    }

    public static async initialize(): Promise<ISqliteAdapter> {
        const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
        return new SqliteAdapter(db);
    }

    public async getFirstAsync<T = unknown>(
        sql: string, 
        params?: SqlValue[],
    ): Promise<T | null> {
        return this.db.getFirstAsync<T>(sql, params ?? []);
    }

    public async getAllAsync<T = unknown>(
        sql: string, 
        params?: SqlValue[],
    ): Promise<T[]> {
        return this.db.getAllAsync<T>(sql, params ?? []);
    }

    public async runAsync(
        sql: string, 
        params?: SqlValue[],
    ): Promise<RunResult> {
        return this.db.runAsync(sql, params ?? []);
    }

    public async execAsync(sql: string): Promise<void> {
        return this.db.execAsync(sql);
    }

    public async withExclusiveTransactionAsync<T>(
        callback: (txn: ISqliteAdapter) => Promise<T>,
    ): Promise<T> {
        let result: T | undefined;

        await this.db.withExclusiveTransactionAsync(async () => {
            result = await callback(this);
        });

        return result as T;
    }
}