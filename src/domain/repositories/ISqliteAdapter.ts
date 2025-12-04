// Receipt of changes.
export interface RunResult {
    lastInsertRowId: number;
    changes: number;
}

// Contract for Sqlite Adapter. 
export interface ISqliteAdapter {
    getFirstAsync<T = any>(sql: string, params?: any[]): Promise<T | null>;
    getAllAsync<T = any>(sql: string, params?: any[]): Promise<T[]>;
    runAsync(sql: string, params?: any[]): Promise<RunResult>;
    execAsync(sql: string): Promise<void>;
    withExclusiveTransactionAsync<T>(callback: (txn: ISqliteAdapter) => Promise<T>): Promise<T>;
}