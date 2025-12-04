import { BaseModel } from "../models/BaseModel";

// Standard CRUD operations, every entity must implement these methods.
export interface IBaseRepository<T extends BaseModel> {
    find(id: string): Promise<T | null>;
    findAll(): Promise<T[]>;
    create(entity: T): Promise<void>;
    update(entity: T): Promise<void>;
    delete(id: string): Promise<void>;
}