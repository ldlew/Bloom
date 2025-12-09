import { DatabaseManager } from '../../../src/infrastructure/database/managers/DbManager';
import { SqliteAdapter } from '../../../src/infrastructure/database/managers/SqliteAdapter';
import { Migrator } from '../../../src/infrastructure/database/managers/Migrator';
import { MIGRATIONS } from '../../../src/infrastructure/database/managers/Migrations';

jest.mock('../../../src/infrastructure/database/managers/SqliteAdapter');
jest.mock('../../../src/infrastructure/database/managers/Migrator');
jest.mock('../../../src/infrastructure/database/managers/Migrations', () => ({
    MIGRATIONS: ['mock-migration-step'],
}));

describe('DatabaseManager', () => {
    const mockDbInstance = { execAsync: jest.fn() };
    const mockRun = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        
        mockRun.mockResolvedValue(undefined);

        // Reset the singleton state
        (DatabaseManager as any).instance = undefined;
        (DatabaseManager as any).initialized = null;

        // Setup mocks
        (SqliteAdapter.initialize as jest.Mock).mockResolvedValue(mockDbInstance);
        
        // Mock the Migrator
        (Migrator as jest.Mock).mockImplementation(() => ({
            run: mockRun,
        }));
    });

    describe('Initialization', () => {
        it('should initialize adapter, run migrations, and return', async () => {
            const result = await DatabaseManager.initialize();

            // Adapter initialization
            expect(SqliteAdapter.initialize).toHaveBeenCalledTimes(1);

            // Migrator instantiation and execution
            expect(Migrator).toHaveBeenCalledWith(mockDbInstance);
            expect(mockRun).toHaveBeenCalledWith(MIGRATIONS);

            expect(result).toBe(mockDbInstance);
        });

        it('should enforce singleton pattern', async () => {
            // First call
            const firstPromise = DatabaseManager.initialize();
            
            // Second call (simultaneous)
            const secondPromise = DatabaseManager.initialize();

            await Promise.all([firstPromise, secondPromise]);

            // Adapter should only be called once
            expect(SqliteAdapter.initialize).toHaveBeenCalledTimes(1);
            expect(mockRun).toHaveBeenCalledTimes(1);
        });

        it('should handle errors during adapter initialization', async () => {
            (SqliteAdapter.initialize as jest.Mock).mockRejectedValue(new Error('Connection failed'));

            await expect(DatabaseManager.initialize())
                .rejects
                .toThrow('Failed to initialize database');

            // Verify state was reset
            expect((DatabaseManager as any).initialized).toBeNull();
        });

        it('should handle errors during migration / reset state', async () => {
            mockRun.mockRejectedValue(new Error('Migration failed'));

            await expect(DatabaseManager.initialize())
                .rejects
                .toThrow('Failed to initialize database');
            
            expect((DatabaseManager as any).initialized).toBeNull();
        });
    });

    describe('getInstance', () => {
        it('should throw error if accessed before initialization', () => {
            expect(() => {
                DatabaseManager.getInstance();
            }).toThrow('Database not initialized.');
        });

        it('should return the instance if initialized successfully', async () => {
            await DatabaseManager.initialize();

            const instance = DatabaseManager.getInstance();

            expect(instance).toBe(mockDbInstance);
        });
    });
});