import { User } from "../models/User";
import { IBaseRepository } from "./IBaseRepository";

export interface IUserRepository extends IBaseRepository<User> {
    // Any specific user-methods, can add in later...
}