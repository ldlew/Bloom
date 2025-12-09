// Executes data schema changes, uses user_version to track state.

import { type ISqliteAdapter } from '../../../domain/repositories/ISqliteAdapter';

export type MigrationStep = (db: ISqliteAdapter) => Promise<void>;

export class Migrator {
    constructor(private db: ISqliteAdapter) {}

    public async run(steps: MigrationStep[]): Promise<void> {
        if (!steps || steps.length === 0) {
            throw new Error('No migration steps');
        }
        
        // If migration fails, rolls back to previous valid state (locked in exclusive transaction)
        try {
            await this.db.withExclusiveTransactionAsync(async (txn) => {
                // Grabs current version
                const result = await txn.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
                const currentVersion = result?.user_version ?? 0;

                const newSteps = steps.slice(currentVersion);
                
                if (newSteps.length === 0) {
                    return;
                }
                
                // Execute the migrations sequentially
                for (const step of newSteps) {
                    await step(txn);
                }
                
                // Update version #
                const newVersion = currentVersion + newSteps.length;
                await txn.execAsync(`PRAGMA user_version = ${newVersion}`);
            });
        } catch (error) {
            throw new Error('Failed to run migrations', { cause: error });
        }
    }
}