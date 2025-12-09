import { BaseModel, ISqliteAdapter, IBaseRepository, SqlValue } from '../../../domain';

// Implements standard logic so concrete repositories don't have to
export abstract class SqliteBaseRepository<T extends BaseModel> implements IBaseRepository<T> {
    protected readonly db: ISqliteAdapter;
    protected abstract tableName: string;
    
    // Abstract mappers, concrete classes must define how to map their specific data
    protected abstract mapRowToEntity(row: Record<string, SqlValue>): T;
    protected abstract mapEntityToRow(entity: T): Record<string, SqlValue>;

    constructor(database: ISqliteAdapter) {
        this.db = database;
    }

    // INSERT
    public async create(entity: T): Promise<void> {
        const row = this.mapEntityToRow(entity);
        const columns = Object.keys(row);
        const placeholders = columns.map(() => '?').join(', ');
        const values = Object.values(row);
        
        const sql = `INSERT INTO ${this.tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
        await this.db.runAsync(sql, values);
    }

    // SELECT by ID
    public async find(id: string): Promise<T | null> {
        const sql = `SELECT * FROM ${this.tableName} WHERE id = ?`;
        const row = await this.db.getFirstAsync<Record<string, SqlValue>>(sql, [id]);

        return row ? this.mapRowToEntity(row) : null;
    }

    // SELECT ALL
    public async findAll(): Promise<T[]> {
        const sql = `SELECT * FROM ${this.tableName}`;
        const rows = await this.db.getAllAsync<Record<string, SqlValue>>(sql, []);

        return rows.map(row => this.mapRowToEntity(row));
    }

    // UPDATE
    public async update(entity: T): Promise<void> {
        const row = this.mapEntityToRow(entity);
        const { id, ...fieldsToUpdate } = row;
        const setClauses = Object.keys(fieldsToUpdate).map(col => `${col} = ?`).join(', ');
        const values = [...Object.values(fieldsToUpdate), id];
        
        const sql = `UPDATE ${this.tableName} SET ${setClauses} WHERE id = ?`;
        await this.db.runAsync(sql, values);
    }

    // DELETE
    public async delete(id: string): Promise<void> {
        const sql = `DELETE FROM ${this.tableName} WHERE id = ?`;
        
        await this.db.runAsync(sql, [id]);
    } 
}