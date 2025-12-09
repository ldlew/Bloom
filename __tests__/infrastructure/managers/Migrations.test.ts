import { MIGRATIONS } from "../../../src/infrastructure/database/managers";

describe('Database Migrations', () => {
    let mockDb: { execAsync: jest.Mock };

    beforeEach(() => {
        mockDb = {
            execAsync: jest.fn().mockResolvedValue(undefined),
        };
    });

    it('should define exactly 4 migration steps', () => {
        expect(MIGRATIONS).toHaveLength(4);
    });

    describe('Schema Definitions', () => {
        it('step 0: should create users table with correct columns', async () => {
            const migration = MIGRATIONS[0];
            await migration(mockDb as any);

            expect(mockDb.execAsync).toHaveBeenCalledTimes(1);
            const sql = mockDb.execAsync.mock.calls[0][0];
            
            expect(sql).toContain('CREATE TABLE IF NOT EXISTS users');
            expect(sql).toContain('id TEXT PRIMARY KEY');
            expect(sql).toContain('first_name TEXT');
            expect(sql).toContain('sync_status TEXT DEFAULT \'pending\'');
        });

        it('step 1: should create sprouts table with foreign key', async () => {
            const migration = MIGRATIONS[1];
            await migration(mockDb as any);

            expect(mockDb.execAsync).toHaveBeenCalledTimes(1);
            const sql = mockDb.execAsync.mock.calls[0][0];

            expect(sql).toContain('CREATE TABLE IF NOT EXISTS sprouts');
            expect(sql).toContain('user_id TEXT NOT NULL');
            expect(sql).toContain('FOREIGN KEY (user_id) REFERENCES users(id)');
        });

        it('step 2: should create affirmations table with cascade', async () => {
            const migration = MIGRATIONS[2];
            await migration(mockDb as any);

            expect(mockDb.execAsync).toHaveBeenCalledTimes(1);
            const sql = mockDb.execAsync.mock.calls[0][0];

            expect(sql).toContain('CREATE TABLE IF NOT EXISTS affirmations');
            expect(sql).toContain('sprout_id TEXT NOT NULL');
            expect(sql).toContain('FOREIGN KEY (sprout_id) REFERENCES sprouts(id) ON DELETE CASCADE');
        });

        it('step 3: should create triggers table with cascade', async () => {
            const migration = MIGRATIONS[3];
            await migration(mockDb as any);

            expect(mockDb.execAsync).toHaveBeenCalledTimes(1);
            const sql = mockDb.execAsync.mock.calls[0][0];

            expect(sql).toContain('CREATE TABLE IF NOT EXISTS triggers');
            expect(sql).toContain('sprout_id TEXT NOT NULL');
            expect(sql).toContain('FOREIGN KEY (sprout_id) REFERENCES sprouts(id) ON DELETE CASCADE');
        });
    });

    describe('Execution Robustness', () => {
        it('should execute all migrations sequentially without error', async () => {
            for (const migration of MIGRATIONS) {
                await migration(mockDb as any);
            }

            expect(mockDb.execAsync).toHaveBeenCalledTimes(4);
        });
    });
});