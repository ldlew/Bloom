import { Sprout } from '../models/Sprout';
import { SproutSummary } from '../types/Sprout.types';

export interface ISproutRepository {
    // Core CRUD (not extended from Base due to aggregate pattern)
    find(id: string): Promise<Sprout | null>;
    create(sprout: Sprout): Promise<void>;
    update(sprout: Sprout): Promise<void>;
    delete(id: string): Promise<void>;
    
    // Lightweightsnapshots for UI
    findSummary(id: string): Promise<SproutSummary | null>;
    findAllSummariesByUserId(userId: string): Promise<SproutSummary[]>; 
}