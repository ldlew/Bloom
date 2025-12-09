import { User } from '../models/User';
import { IBaseRepository } from './IBaseRepository';

export interface IUserRepository extends IBaseRepository<User> {
    // Basic user-specific method (needed for later, just don't want
    // a member equivalent to its supertype)
    findByUsername(username: string): Promise<User | null>;
}