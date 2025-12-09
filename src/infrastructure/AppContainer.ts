import { IUserRepository, ISproutRepository } from '../domain';
import { UserRepository, SproutRepository } from './database/repositories';
import { DatabaseManager } from './database/managers';
import { UserService, SproutService } from '../application';

// Facade interface
export interface IAppContainer {
    readonly sproutService: SproutService;
    readonly userService: UserService;
    init(): Promise<void>;
}

export class AppContainer implements IAppContainer {
    private static _instance: AppContainer;
    private _initialized = false;
    
    private _userService?: UserService;
    private _sproutService?: SproutService;

    private constructor() {
        if (AppContainer._instance) {
            throw new Error('AppContainer already exists.');
        }
    }

    public static getInstance(): AppContainer {
        if (!AppContainer._instance) {
            AppContainer._instance = new AppContainer();
        }
        return AppContainer._instance;
    }

    public async init(): Promise<void> {
        if (this._initialized) {return;}

        try {
            // Initialize database
            const db = await DatabaseManager.initialize();
            
            // Create repositories
            const userRepo: IUserRepository = new UserRepository(db);
            const sproutRepo: ISproutRepository = new SproutRepository(db);
            
            // Create services
            this._userService = new UserService(userRepo);
            this._sproutService = new SproutService(sproutRepo);
            
            this._initialized = true;
        } catch (_error) {
            throw new Error('Failed to initialize AppContainer');
        }
    }

    public get sproutService(): SproutService {
        if (!this._sproutService) {
            throw new Error('SproutService not initialized. Call init() first.');
        }
        return this._sproutService;
    }

    public get userService(): UserService {
        if (!this._userService) {
            throw new Error('UserService not initialized. Call init() first.');
        }
        return this._userService;
    }
}

export const appContainer = AppContainer.getInstance();