import { AppContainer } from '../../src/infrastructure/AppContainer';
import { DatabaseManager } from '../../src/infrastructure/database/managers';
import { UserRepository, SproutRepository } from '../../src/infrastructure/database/repositories';
import { UserService, SproutService } from '../../src/application';
import fc from 'fast-check';

jest.mock('../../src/infrastructure/database/managers', () => ({
    DatabaseManager: {
        initialize: jest.fn(),
    },
}));

jest.mock('../../src/infrastructure/database/repositories', () => ({
    UserRepository: jest.fn(),
    SproutRepository: jest.fn(),
}));

jest.mock('../../src/application', () => ({
    UserService: jest.fn(),
    SproutService: jest.fn(),
}));

describe('AppContainer', () => {
    const mockDb = { execAsync: jest.fn() };

    beforeEach(() => {
        jest.clearAllMocks();
        
        // Reset Singleton
        (AppContainer as any)._instance = undefined;

        (DatabaseManager.initialize as jest.Mock).mockResolvedValue(mockDb);
    });

    describe('Singleton Pattern', () => {
        it('getInstance() should create instance if none exists', () => {
            const instance = AppContainer.getInstance();
            expect(instance).toBeInstanceOf(AppContainer);
        });

        it('getInstance() should return the same instance on subsequent calls', () => {
            const instance1 = AppContainer.getInstance();
            const instance2 = AppContainer.getInstance();
            expect(instance1).toBe(instance2);
        });

        it('constructor should throw if instance already exists', () => {
            // Create the valid instance
            AppContainer.getInstance();

            // Try to force a second creation
            expect(() => {
                new (AppContainer as any)();
            }).toThrow('AppContainer already exists.');
        });
    });

    describe('Initialization Flow', () => {
        it('init() should initialize DB, Repos, and Services in order', async () => {
            const container = AppContainer.getInstance();

            await container.init();

            // Database
            expect(DatabaseManager.initialize).toHaveBeenCalledTimes(1);

            // Repositories
            expect(UserRepository).toHaveBeenCalledWith(mockDb);
            expect(SproutRepository).toHaveBeenCalledWith(mockDb);

            // Services
            expect(UserService).toHaveBeenCalled();
            expect(SproutService).toHaveBeenCalled();
        });

        it('init() should be idempotent', async () => {
            const container = AppContainer.getInstance();

            await container.init();
            await container.init();
            await container.init();

            expect(DatabaseManager.initialize).toHaveBeenCalledTimes(1);
            expect(UserRepository).toHaveBeenCalledTimes(1);
        });

        it('should throw error if DatabaseManager fails', async () => {
            const container = AppContainer.getInstance();
            (DatabaseManager.initialize as jest.Mock).mockRejectedValue(new Error('DB Fail'));

            await expect(container.init()).rejects.toThrow('Failed to initialize AppContainer');
        });
    });

    describe('Service Accessors', () => {
        it('should throw if accessing userService before init', () => {
            const container = AppContainer.getInstance();
            expect(() => container.userService).toThrow('UserService not initialized');
        });

        it('should throw if accessing sproutService before init', () => {
            const container = AppContainer.getInstance();
            expect(() => container.sproutService).toThrow('SproutService not initialized');
        });

        it('should return services after init', async () => {
            const container = AppContainer.getInstance();
            await container.init();

            expect(container.userService).toBeInstanceOf(UserService);
            expect(container.sproutService).toBeInstanceOf(SproutService);
        });
    });

    describe('Property-Based Robustness', () => {
        it('should always return identical reference regardless of call count', () => {
            fc.assert(
                fc.property(fc.nat({ max: 100 }), (callCount) => {
                    // Reset
                    (AppContainer as any)._instance = undefined;
                    
                    const first = AppContainer.getInstance();
                    
                    for (let i = 0; i < callCount; i++) {
                        const next = AppContainer.getInstance();
                        expect(next).toBe(first);
                    }
                })
            );
        });
    });
});