import { SqliteAdapter } from '../../../src/infrastructure/database/managers/SqliteAdapter';
import { ISqliteAdapter } from '../../../src/domain/repositories/ISqliteAdapter';
import * as SQLite from 'expo-sqlite';
import { DATABASE_NAME } from '../../../src/domain/constants/database.constants';

// Mock the entire expo-sqlite module
jest.mock('expo-sqlite', () => ({
    openDatabaseAsync: jest.fn(),
}));

describe('SqliteAdapter', () => {
    // Create a mock of the internal Expo database object
    const mockExpoDb = {
        getFirstAsync: jest.fn(),
        getAllAsync: jest.fn(),
        runAsync: jest.fn(),
        execAsync: jest.fn(),
        withExclusiveTransactionAsync: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        // Setup openDatabaseAsync to return our mock object
        (SQLite.openDatabaseAsync as jest.Mock).mockResolvedValue(mockExpoDb);
    });

    describe('Initialization', () => {
        it('should open database with correct name', async () => {
            await SqliteAdapter.initialize();
            expect(SQLite.openDatabaseAsync).toHaveBeenCalledWith(DATABASE_NAME);
        });

        it('should return an instance of SqliteAdapter', async () => {
            const adapter = await SqliteAdapter.initialize();
            expect(adapter).toBeInstanceOf(SqliteAdapter);
        });
    });

    describe('Query Methods', () => {
        let adapter: ISqliteAdapter;

        beforeEach(async () => {
            adapter = await SqliteAdapter.initialize();
        });

        // getFirstAsync
        it('should delegate getFirstAsync with params', async () => {
            const mockResult = { id: 1 };
            mockExpoDb.getFirstAsync.mockResolvedValue(mockResult);

            const result = await adapter.getFirstAsync('SELECT * FROM users WHERE id = ?', [1]);

            expect(mockExpoDb.getFirstAsync).toHaveBeenCalledWith('SELECT * FROM users WHERE id = ?', [1]);
            expect(result).toBe(mockResult);
        });

        it('should delegate getFirstAsync with empty params if undefined', async () => {
            await adapter.getFirstAsync('SELECT * FROM users');
            expect(mockExpoDb.getFirstAsync).toHaveBeenCalledWith('SELECT * FROM users', []);
        });

        // getAllAsync
        it('should delegate getAllAsync with params', async () => {
            const mockResults = [{ id: 1 }, { id: 2 }];
            mockExpoDb.getAllAsync.mockResolvedValue(mockResults);

            const result = await adapter.getAllAsync('SELECT * FROM users', []);

            expect(mockExpoDb.getAllAsync).toHaveBeenCalledWith('SELECT * FROM users', []);
            expect(result).toBe(mockResults);
        });

        it('should delegate getAllAsync with empty params if undefined', async () => {
            mockExpoDb.getAllAsync.mockResolvedValue([]);
            
            await adapter.getAllAsync('SELECT * FROM users');
            
            expect(mockExpoDb.getAllAsync).toHaveBeenCalledWith('SELECT * FROM users', []);
        });

        // runAsync
        it('should delegate runAsync with params', async () => {
            const mockRunResult = { lastInsertRowId: 123, changes: 1 };
            mockExpoDb.runAsync.mockResolvedValue(mockRunResult);

            const result = await adapter.runAsync('INSERT INTO users...', ['John']);

            expect(mockExpoDb.runAsync).toHaveBeenCalledWith('INSERT INTO users...', ['John']);
            expect(result).toBe(mockRunResult);
        });

        it('should delegate runAsync with empty params if undefined', async () => {
            const mockRunResult = { lastInsertRowId: 0, changes: 0 };
            mockExpoDb.runAsync.mockResolvedValue(mockRunResult);

            await adapter.runAsync('DELETE FROM users');

            expect(mockExpoDb.runAsync).toHaveBeenCalledWith('DELETE FROM users', []);
        });

        // execAsync
        it('should delegate execAsync', async () => {
            await adapter.execAsync('CREATE TABLE...');
            expect(mockExpoDb.execAsync).toHaveBeenCalledWith('CREATE TABLE...');
        });
    });

    describe('Transaction Wrapper', () => {
        let adapter: ISqliteAdapter;

        beforeEach(async () => {
            adapter = await SqliteAdapter.initialize();
            
            // Mock implementation
            mockExpoDb.withExclusiveTransactionAsync.mockImplementation(async (callback: Function) => {
                await callback();
            });
        });

        it('should wrap expo transaction and return result', async () => {
            const myCallback = jest.fn().mockResolvedValue('success');
            
            const result = await adapter.withExclusiveTransactionAsync(myCallback);

            expect(mockExpoDb.withExclusiveTransactionAsync).toHaveBeenCalledTimes(1);
            
            expect(myCallback).toHaveBeenCalledWith(adapter);
            
            expect(result).toBe('success');
        });

        it('should propagate errors from inside transaction', async () => {
            const error = new Error('Tx Failed');
            mockExpoDb.withExclusiveTransactionAsync.mockRejectedValue(error);

            await expect(adapter.withExclusiveTransactionAsync(async () => {}))
                .rejects.toThrow('Tx Failed');
        });
    });
});