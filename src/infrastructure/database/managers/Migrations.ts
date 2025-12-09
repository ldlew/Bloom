import { type MigrationStep } from './Migrator';

// Defines the schema, the array itself is the history if the structure
export const MIGRATIONS: MigrationStep[] = [
    async (db) => {
        await db.execAsync(
            `CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                first_name TEXT,
                last_name TEXT,
                display_name TEXT,
                email TEXT,
                image_url TEXT,
                sync_status TEXT DEFAULT 'pending',
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            )`,
        );
    },
    async (db) => {
        await db.execAsync(
            `CREATE TABLE IF NOT EXISTS sprouts (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                color TEXT NOT NULL,
                shape_id TEXT NOT NULL,
                hat_id TEXT NOT NULL,
                sync_status TEXT DEFAULT 'pending',
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )`,
        );
    },
    async (db) => {
        await db.execAsync(
            `CREATE TABLE IF NOT EXISTS affirmations (
                id TEXT PRIMARY KEY,
                sprout_id TEXT NOT NULL,
                text TEXT NOT NULL,
                position INTEGER NOT NULL,
                FOREIGN KEY (sprout_id) REFERENCES sprouts(id) ON DELETE CASCADE
            )`,
        );
    },
    async (db) => {
        await db.execAsync(
            `CREATE TABLE IF NOT EXISTS triggers (
                id TEXT PRIMARY KEY,
                sprout_id TEXT NOT NULL,
                text TEXT NOT NULL,
                position INTEGER NOT NULL,
                FOREIGN KEY (sprout_id) REFERENCES sprouts(id) ON DELETE CASCADE
            )`,
        );
    },
];