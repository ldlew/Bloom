import { User, IUserRepository, SqlValue } from '../../../domain';
import { SqliteBaseRepository } from './BaseRepository';

export class UserRepository extends SqliteBaseRepository<User> implements IUserRepository {
    protected tableName = 'users';

    public async findByUsername(username: string): Promise<User | null> {
        const sql = `SELECT * FROM ${this.tableName} WHERE display_name = ?`;
        const row = await this.db.getFirstAsync<Record<string, SqlValue>>(sql, [username]);
        return row ? this.mapRowToEntity(row) : null;
    }

    protected mapRowToEntity(row: Record<string, SqlValue>): User {
        return User.createFromPersistence({
            id: row.id as string,
            firstName: row.first_name as string,
            lastName: row.last_name as string,
            displayName: row.display_name as string,
            email: row.email as string,
            imageUrl: row.image_url as string,
            syncStatus: row.sync_status as User['syncStatus'], 
            createdAt: new Date(row.created_at as number),
            updatedAt: new Date(row.updated_at as number),
        });
    }

    protected mapEntityToRow(entity: User): Record<string, SqlValue> {
        return {
            id: entity.id,
            first_name: entity.firstName,
            last_name: entity.lastName,
            display_name: entity.displayName,
            email: entity.email,
            image_url: entity.imageUrl,
            sync_status: entity.syncStatus,
            created_at: entity.createdAt.getTime(),
            updated_at: entity.updatedAt.getTime(),
        };
    }
}