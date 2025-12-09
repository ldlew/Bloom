import { UserService } from '../../src/application'; 
import { AuthProfile, User, IUserRepository } from '../../src/domain';
import fc from 'fast-check';

jest.mock('expo-crypto', () => ({
    randomUUID: jest.fn(() => 'mock-uuid'),
}));

jest.mock('../../src/domain/models/BaseModel', () => {
    return {
        BaseModel: class MockBaseModel {
            protected props: any;
            public modified: boolean = false;
            public lastSyncedAt: Date | null = null;
            
            constructor(props: any) { this.props = props; }
            
            get id() { return this.props.id; }

            markSynced(date: Date) { this.lastSyncedAt = date; this.modified = false; }
            markModified() { this.modified = true; }
        },
    };
});

describe('UserService', () => {
    let service: UserService;
    let mockRepo: jest.Mocked<IUserRepository>;

    const TEST_PROFILE: AuthProfile = {
        id: 'user-123',
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
        imageUrl: null,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockRepo = {
            create: jest.fn(),
            update: jest.fn(),
            find: jest.fn(),
            findByUsername: jest.fn(),
            findAll: jest.fn(),
            delete: jest.fn(),
        };
        service = new UserService(mockRepo);
    });

    describe('syncUserOnLogin', () => {
        it('should create new user if not found in repository', async () => {
            mockRepo.find.mockResolvedValue(null);

            const result = await service.syncUserOnLogin(TEST_PROFILE);

            expect(mockRepo.find).toHaveBeenCalledWith(TEST_PROFILE.id);
            expect(mockRepo.create).toHaveBeenCalledTimes(1);
            expect(mockRepo.update).not.toHaveBeenCalled();
            
            expect(result).toBeInstanceOf(User);
            expect(result.id).toBe(TEST_PROFILE.id);
            expect(result.email).toBe(TEST_PROFILE.email);
        });

        it('should update existing user if found', async () => {
            const existingUser = User.createFromProfile({
                ...TEST_PROFILE,
                firstName: 'OldName'
            });
            mockRepo.find.mockResolvedValue(existingUser);

            const result = await service.syncUserOnLogin(TEST_PROFILE);

            expect(mockRepo.create).not.toHaveBeenCalled();
            expect(mockRepo.update).toHaveBeenCalledWith(existingUser);
            
            // Should match the profile passed in, not the old data
            expect(result.firstName).toBe(TEST_PROFILE.firstName);
            expect((result as any).lastSyncedAt).toBeInstanceOf(Date);
        });
    });

    describe('Property-Based Robustness', () => {
        it('should handle any valid auth profile structure', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.record({
                        id: fc.string(),
                        email: fc.emailAddress(),
                        firstName: fc.string(),
                        lastName: fc.string(),
                        imageUrl: fc.option(fc.webUrl())
                    }),
                    async (randomProfile) => {
                        mockRepo.find.mockResolvedValue(null);
                        mockRepo.create.mockClear();

                        const result = await service.syncUserOnLogin(randomProfile as AuthProfile);

                        expect(result.id).toBe(randomProfile.id);
                        expect(mockRepo.create).toHaveBeenCalled();
                    }
                )
            );
        });
    });
});