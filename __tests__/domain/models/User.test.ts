import { User } from "../../../src/domain";
import { AuthProfile } from "../../../src/domain/types/User.types";

jest.mock('../../../src/domain/models/BaseModel', () => {
    return {
        BaseModel: class MockBaseModel {
            protected props: any;
            public modified: boolean = false;
            public lastSyncedAt: Date | null = null;

            constructor(props: any) { 
                this.props = props; 
            }
            
            public markModified() { 
                this.modified = true; 
            }

            public resetModified() {
                this.modified = false;
            }

            // User-specific requirement:
            public markSynced(date: Date) {
                this.modified = false;
                this.lastSyncedAt = date;
            }
        }
    };
});

describe('User Domain Entity', () => {
    const TEST_PROFILE: AuthProfile = {
        //example user information
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        imageUrl: 'https://example.com/avatar.jpg'
    };

    let user: User;

    //created a new User instace before profile factory
    beforeEach(() => {
        jest.clearAllMocks();
        user = User.createFromProfile(TEST_PROFILE);
    });

    //test creating a new user before login 
    describe('Instantiation', () => {
        it('should create a new user from auth profile with defaults', () => {
            expect(user.firstName).toBe('John');
            expect(user.email).toBe('test@example.com');
            expect(user.displayName).toBeNull();
        });

        it('should create from persistence correctly', () => {
            const props: any = {
                //test loading a saved User from database
                ...TEST_PROFILE,
                displayName: 'Johnny',
                syncStatus: 'synced',
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            const existingUser = User.createFromPersistence(props);
            
            expect(existingUser.displayName).toBe('Johnny');
            expect(existingUser.email).toBe('test@example.com');
        });
    });

    describe('Setters (Modification)', () => {
        it('should update firstName and mark modified', () => {
            user.setFirstName('Jane');
            expect(user.firstName).toBe('Jane');
            expect((user as any).modified).toBe(true);
        });

        it('should update lastName and mark modified', () => {
            user.setLastName('Smith');
            expect(user.lastName).toBe('Smith');
            expect((user as any).modified).toBe(true);
        });

        it('should update displayName and mark modified', () => {
            user.setDisplayName('TheBoss');
            expect(user.displayName).toBe('TheBoss');
            expect((user as any).modified).toBe(true);
        });

        it('should update imageUrl and mark modified', () => {
            user.setImageUrl('new.jpg');
            expect(user.imageUrl).toBe('new.jpg');
            expect((user as any).modified).toBe(true);
        });
    });

    //ensures that user modifications are being synced with profile
    describe('Sync Logic', () => {
        it('should update fields from profile and MARK SYNCED (Clean)', () => {
            // Setup: Make user dirty first
            user.setFirstName('DirtyName'); 
            expect((user as any).modified).toBe(true);

            const newProfile = {
                ...TEST_PROFILE,
                firstName: 'CleanName',
                lastName: 'CleanLast'
            };

            user.syncWithProfile(newProfile);

            expect(user.firstName).toBe('CleanName');
            expect(user.lastName).toBe('CleanLast');
            
            //modified should be FALSE, because we just synced
            expect((user as any).modified).toBe(false); 
            expect((user as any).lastSyncedAt).toBeInstanceOf(Date);
        });

        it('should not overwrite local fields that are not in AuthProfile', () => {
            user.setDisplayName('MyNickname');

            user.syncWithProfile(TEST_PROFILE);

            expect(user.displayName).toBe('MyNickname');
        });
    });
});