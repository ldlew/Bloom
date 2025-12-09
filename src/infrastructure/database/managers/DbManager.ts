import { type ISqliteAdapter } from '../../../domain/'; 
import { SqliteAdapter } from './SqliteAdapter';
import { Migrator } from './Migrator';
import { MIGRATIONS } from './Migrations';

// Singleton manager responsible for the DB connection
export class DatabaseManager {
    private static instance: ISqliteAdapter;
    private static initialized: Promise<ISqliteAdapter> | null = null;

    // Returns the active connection.
    public static getInstance(): ISqliteAdapter {
        if (!this.instance) {
            throw new Error('Database not initialized.');
        }
        return this.instance;
    }

    // Database setup
    public static initialize(): Promise<ISqliteAdapter> {
        if (this.initialized) {return this.initialized;}

        this.initialized = (async () => {
            try {
                // Connect to DB
                const db = await SqliteAdapter.initialize();
                
                // Ensure schema exists
                const migrator = new Migrator(db);
                await migrator.run(MIGRATIONS);
                
                // Cache the instance
                this.instance = db;
                return db;
            }
            catch (error) {
                this.initialized = null;
                throw new Error('Failed to initialize database', { cause: error });
            }
        })();

        return this.initialized;
    }
}