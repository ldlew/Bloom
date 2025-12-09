import { UserRepository } from '../../../src/infrastructure/database/repositories'; 
import { User, SqlValue, ISqliteAdapter } from '../../../src/domain'; 

const TEST_USERNAME = 'john.doe';
const TEST_USER_ID = 'u-987';
const TEST_USER_EMAIL = 'john.doe@example.com';
const TEST_TIMESTAMP = 1678886400000;

const mockDbRow = {
    id: TEST_USER_ID,
    first_name: 'John',
    last_name: 'Doe',
    display_name: TEST_USERNAME,
    email: TEST_USER_EMAIL,
    image_url: 'http://example.com/img.jpg',
    sync_status: 'synced',
    created_at: TEST_TIMESTAMP,
    updated_at: TEST_TIMESTAMP,
} as Record<string, SqlValue>;

const mockUserEntity = User.createFromPersistence({
    id: TEST_USER_ID,
    firstName: 'John',
    lastName: 'Doe',
    displayName: TEST_USERNAME,
    email: TEST_USER_EMAIL,
    imageUrl: 'http://example.com/img.jpg',
    syncStatus: 'synced',
    createdAt: new Date(TEST_TIMESTAMP),
    updatedAt: new Date(TEST_TIMESTAMP),
});

const mockDbAdapter: jest.Mocked<ISqliteAdapter> = {
    getFirstAsync: jest.fn(),
    getAllAsync: jest.fn(),
    runAsync: jest.fn(),
    execAsync: jest.fn(),
    withExclusiveTransactionAsync: jest.fn(),
};

const userRepository = new UserRepository(mockDbAdapter as any);

beforeEach(() => {
    jest.clearAllMocks();
});


describe('UserRepository - Custom Queries and Mapping', () => {

    describe('findByUsername', () => {
        it('should return a User entity if found and call getFirstAsync correctly', async () => {
            mockDbAdapter.getFirstAsync.mockResolvedValue(mockDbRow);
            
            const result = await userRepository.findByUsername(TEST_USERNAME);

            expect(mockDbAdapter.getFirstAsync).toHaveBeenCalledTimes(1);
            expect(mockDbAdapter.getFirstAsync).toHaveBeenCalledWith(
                'SELECT * FROM users WHERE display_name = ?',
                [TEST_USERNAME]
            );
            
            expect(result).toBeInstanceOf(User);
            expect(result?.id).toBe(TEST_USER_ID);
            expect(result?.displayName).toBe(TEST_USERNAME);
        });

        it('should return null if no user is found', async () => {
            mockDbAdapter.getFirstAsync.mockResolvedValue(undefined);
            
            const result = await userRepository.findByUsername(TEST_USERNAME);
            
            expect(mockDbAdapter.getFirstAsync).toHaveBeenCalledTimes(1);
            expect(result).toBeNull();
        });
    });

    describe('Mapping Logic', () => {
        
        it('mapRowToEntity should correctly map a database row to a User entity', () => {
            const result = (userRepository as any).mapRowToEntity(mockDbRow);

            expect(result).toBeInstanceOf(User);
            expect(result.id).toBe(TEST_USER_ID);
            expect(result.firstName).toBe('John');
            expect(result.displayName).toBe(TEST_USERNAME);
            expect(result.createdAt.getTime()).toBe(TEST_TIMESTAMP);
        });

        it('mapEntityToRow should correctly map a User entity to a database row', () => {
            const result = (userRepository as any).mapEntityToRow(mockUserEntity);

            expect(result.id).toBe(TEST_USER_ID);
            expect(result.display_name).toBe(TEST_USERNAME);
            expect(result.first_name).toBe('John');
            expect(result.created_at).toBe(TEST_TIMESTAMP);
            expect(result.sync_status).toBe('synced');
        });
    });
});