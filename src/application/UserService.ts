import { IUserRepository, User } from '../domain';
import { AuthProfile } from '../domain/types/User.types'; 

// Handles user identity / syncing, orchestrates repostiory
export class UserService {
    // Constructor injection, accepts any IUserRepository
    constructor(private userRepository: IUserRepository) {}

    // Sync on login
    public async syncUserOnLogin(profile: AuthProfile): Promise<User> {
        const existingUser = await this.userRepository.find(profile.id);

        // Returning User
        if (existingUser) {
            // Update object
            existingUser.syncWithProfile(profile);

            // Persist updates
            await this.userRepository.update(existingUser); 
            return existingUser;
        }

        // Else, new user, creates a new entity
        const newUser = User.createFromProfile(profile);
        
        // Insert into disk
        await this.userRepository.create(newUser); 
        return newUser;
    }
}