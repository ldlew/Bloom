import { Migrator, MigrationStep } from '../../../src/infrastructure/database/managers/Migrator';
import { ISqliteAdapter } from '../../../src/domain/repositories/ISqliteAdapter';

describe('Migrator', () => {
    let mockDb: jest.Mocked<ISqliteAdapter>;
    let migrator: Migrator;

    beforeEach(() => {
        // Create a Mock DB Adapter
        mockDb = {
            execAsync: jest.fn(),
            getFirstAsync: jest.fn(),
            getAllAsync: jest.fn(),
            runAsync: jest.fn(),
            // This executes the transaction passing the mockDb itself as the "txn"
            withExclusiveTransactionAsync: jest.fn(async (callback) => {
                await callback(mockDb);
            }),
        } as unknown as jest.Mocked<ISqliteAdapter>;

        migrator = new Migrator(mockDb);
    });

    it('should throw error if steps are empty or null', async () => {
        await expect(migrator.run([])).rejects.toThrow('No migration steps');
        await expect(migrator.run(null as any)).rejects.toThrow('No migration steps');
    });

    it('should run ALL migrations if current version is 0', async () => {
        mockDb.getFirstAsync.mockResolvedValue({ user_version: 0 });

        const step1 = jest.fn();
        const step2 = jest.fn();
        const steps: MigrationStep[] = [step1, step2];

        await migrator.run(steps);

        // Transaction wrapper
        expect(mockDb.withExclusiveTransactionAsync).toHaveBeenCalledTimes(1);

        // Both steps ran
        expect(step1).toHaveBeenCalledTimes(1);
        expect(step2).toHaveBeenCalledTimes(1);

        // Version update (0 + 2 = 2)
        expect(mockDb.execAsync).toHaveBeenCalledWith('PRAGMA user_version = 2');
    });

    it('should skip migrations that have already run', async () => {
        // Current version is 1
        mockDb.getFirstAsync.mockResolvedValue({ user_version: 1 });

        const step1 = jest.fn(); // Should NOT run
        const step2 = jest.fn(); // Should run
        const steps: MigrationStep[] = [step1, step2];

        await migrator.run(steps);

        expect(step1).not.toHaveBeenCalled();
        expect(step2).toHaveBeenCalledTimes(1);

        // Version update (start 1 + 1 new step = 2)
        expect(mockDb.execAsync).toHaveBeenCalledWith('PRAGMA user_version = 2');
    });

    it('should do nothing if current version matches steps length', async () => {
        // Up to date
        mockDb.getFirstAsync.mockResolvedValue({ user_version: 3 });

        const steps = [jest.fn(), jest.fn(), jest.fn()]; // 3 steps

        await migrator.run(steps);

        // Should check version
        expect(mockDb.getFirstAsync).toHaveBeenCalledWith('PRAGMA user_version');
        
        // Should NOT update version or run steps
        steps.forEach(s => expect(s).not.toHaveBeenCalled());
        expect(mockDb.execAsync).not.toHaveBeenCalledWith(expect.stringContaining('PRAGMA user_version ='));
    });

    it('should handle missing version info gracefully (default to 0)', async () => {
        // getFirstAsync returns null
        mockDb.getFirstAsync.mockResolvedValue(null);

        const step1 = jest.fn();
        await migrator.run([step1]);

        expect(step1).toHaveBeenCalled();
        expect(mockDb.execAsync).toHaveBeenCalledWith('PRAGMA user_version = 1');
    });

    it('should propagate errors and fail the migration', async () => {
        mockDb.getFirstAsync.mockResolvedValue({ user_version: 0 });

        const step1 = jest.fn();
        const step2 = jest.fn().mockRejectedValue(new Error('SQL Error')); // Step 2 fails
        
        await expect(migrator.run([step1, step2]))
            .rejects
            .toThrow('Failed to run migrations');
        
        // Ideally step 1 ran, step 2 failed
        expect(step1).toHaveBeenCalled();
        expect(step2).toHaveBeenCalled();

        // Version should not be updated if an error occurred
        expect(mockDb.execAsync).not.toHaveBeenCalledWith(expect.stringContaining('PRAGMA user_version ='));
    });
});