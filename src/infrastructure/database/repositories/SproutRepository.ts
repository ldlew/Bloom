import { SproutProps, SproutSummary, Affirmation,
    Trigger, ISproutRepository, Sprout, ISqliteAdapter, SqlValue } from '../../../domain';

export class SproutRepository implements ISproutRepository {
    constructor(private readonly db: ISqliteAdapter) {}

    public async findSummary(id: string): Promise<SproutSummary | null> {
        const row = await this.db.getFirstAsync<Record<string, SqlValue>>(
            `SELECT s.*, 
                (SELECT text FROM affirmations 
                 WHERE sprout_id = s.id 
                 ORDER BY position ASC LIMIT 1) as first_affirmation_text
             FROM sprouts s 
             WHERE s.id = ?`, 
            [id],
        );
        if (!row) {return null;}
        return this.mapRowToSummary(row);
    }

    public async findAllSummariesByUserId(userId: string): Promise<SproutSummary[]> {
        const rows = await this.db.getAllAsync<Record<string, SqlValue>>(
            `SELECT s.*, 
                (SELECT text FROM affirmations 
                 WHERE sprout_id = s.id 
                 ORDER BY position ASC LIMIT 1) as first_affirmation_text
             FROM sprouts s 
             WHERE s.user_id = ? 
             ORDER BY s.created_at DESC`, 
            [userId],
        );
        return rows.map(row => this.mapRowToSummary(row));
    }

    public async find(id: string): Promise<Sprout | null> {
        const row = await this.db.getFirstAsync<Record<string, SqlValue>>(
            'SELECT * FROM sprouts WHERE id = ?', 
            [id],
        );
        if (!row) {return null;}
        
        const affirmations = await this.loadAffirmations(id);
        const triggers = await this.loadTriggers(id);
        return Sprout.createFromPersistence(
            this.mapRowToProps(row), 
            affirmations, 
            triggers,
        );
    }

    public async create(sprout: Sprout): Promise<void> {
        await this.db.withExclusiveTransactionAsync(async txn => {
            await txn.runAsync(
                `INSERT INTO sprouts 
                (id, user_id, color, shape_id, hat_id, sync_status, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    sprout.id, 
                    sprout.userId, 
                    sprout.color, 
                    sprout.shapeId, 
                    sprout.hatId, 
                    sprout.syncStatus, 
                    sprout.createdAt.getTime(), 
                    sprout.updatedAt.getTime(),
                ],
            );

            for (const aff of sprout.affirmations) {
                await txn.runAsync(
                    `INSERT INTO affirmations (id, sprout_id, text, position) 
                     VALUES (?, ?, ?, ?)`,
                    [aff.id, sprout.id, aff.text, aff.position],
                );
            }

            for (const trig of sprout.triggers) {
                await txn.runAsync(
                    'INSERT INTO triggers (id, sprout_id, text, position) VALUES (?, ?, ?, ?)',
                    [trig.id, sprout.id, trig.text, trig.position],
                );
            }
        });
    }

    public async update(sprout: Sprout): Promise<void> {
        await this.db.withExclusiveTransactionAsync(async txn => {
            await txn.runAsync(
                `UPDATE sprouts SET color = ?, shape_id = ?, hat_id = ?, 
                 sync_status = ?, updated_at = ? WHERE id = ?`,
                [
                    sprout.color, 
                    sprout.shapeId, 
                    sprout.hatId, 
                    sprout.syncStatus, 
                    sprout.updatedAt.getTime(), 
                    sprout.id,
                ],
            );
            
            // Rewrite affirmations
            await txn.runAsync('DELETE FROM affirmations WHERE sprout_id = ?', [sprout.id]);
            for (const aff of sprout.affirmations) {
                await txn.runAsync(
                    `INSERT INTO affirmations (id, sprout_id, text, position) 
                     VALUES (?, ?, ?, ?)`,
                    [aff.id, sprout.id, aff.text, aff.position],
                );
            }

            // Rewrite triggers
            await txn.runAsync('DELETE FROM triggers WHERE sprout_id = ?', [sprout.id]);
            for (const trig of sprout.triggers) {
                await txn.runAsync(
                    'INSERT INTO triggers (id, sprout_id, text, position) VALUES (?, ?, ?, ?)',
                    [trig.id, sprout.id, trig.text, trig.position],
                );
            }
        });
    }

    public async delete(id: string): Promise<void> {
        await this.db.runAsync('DELETE FROM sprouts WHERE id = ?', [id]);
    }

    private async loadAffirmations(sproutId: string): Promise<Affirmation[]> {
        return await this.db.getAllAsync<Affirmation>(
            `SELECT id, text, position FROM affirmations 
             WHERE sprout_id = ? ORDER BY position ASC`, 
            [sproutId],
        );
    }

    private async loadTriggers(sproutId: string): Promise<Trigger[]> {
        return await this.db.getAllAsync<Trigger>(
            `SELECT id, text, position FROM triggers 
             WHERE sprout_id = ? ORDER BY position ASC`, 
            [sproutId],
        );
    }

    private mapRowToProps(row: Record<string, SqlValue>): SproutProps {
        return {
            id: row.id as string,
            userId: row.user_id as string,
            color: row.color as string,
            shapeId: row.shape_id as string,
            hatId: row.hat_id as string,
            syncStatus: row.sync_status as SproutProps['syncStatus'], 
            createdAt: new Date(row.created_at as number),
            updatedAt: new Date(row.updated_at as number),
        };
    }

    private mapRowToSummary(row: Record<string, SqlValue>): SproutSummary {
        return {
            id: row.id as string,
            userId: row.user_id as string,
            color: row.color as string,
            shapeId: row.shape_id as string,
            hatId: row.hat_id as string,
            firstAffirmationText: (row.first_affirmation_text as string) ?? null,
            createdAt: new Date(row.created_at as number),
            updatedAt: new Date(row.updated_at as number),
        };
    } 
}