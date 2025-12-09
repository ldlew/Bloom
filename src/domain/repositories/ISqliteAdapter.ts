// Receipt of changes.
export interface RunResult {
    lastInsertRowId: number;
    changes: number;
}

// Valid types for SQLite parameters
export type SqlValue = string | number | null | boolean | Uint8Array;

// Contract for Sqlite Adapter. 
export interface ISqliteAdapter {
    getFirstAsync<T = unknown>(sql: string, params?: SqlValue[]): Promise<T | null>;
    
    getAllAsync<T = unknown>(sql: string, params?: SqlValue[]): Promise<T[]>;
    
    runAsync(sql: string, params?: SqlValue[]): Promise<RunResult>;
    
    execAsync(sql: string): Promise<void>;
    
    withExclusiveTransactionAsync<T>(callback: (txn: ISqliteAdapter) => Promise<T>): Promise<T>;
}