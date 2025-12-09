import { Sprout } from '../domain/models/Sprout';
import { SproutSummary } from '../domain/types/Sprout.types';
import { ISproutRepository } from '../domain/repositories/ISproutRepository';

// Orchestrates data flow for Sprouts between the presentation layer / repositories.
export class SproutService {
    
    constructor(private readonly sproutRepository: ISproutRepository) {}
    
    public async createSprout(userId: string): Promise<Sprout> {
        // Creates a new Sprout with defaults
        const sprout = Sprout.createNewSprout(userId);
        
        await this.sproutRepository.create(sprout);
        
        return sprout;
    }
    
    public async getUserSproutSummaries(userId: string): Promise<SproutSummary[]> {
        // Returns lighter-weight summaries for lists + snapshots
        return this.sproutRepository.findAllSummariesByUserId(userId);
    }
    
    public async getSprout(sproutId: string): Promise<Sprout | null> {
        // Returns full Sprout aggregate
        return this.sproutRepository.find(sproutId);
    }
    
    public async deleteSprout(sproutId: string): Promise<void> {
        // Deletes sprout + cascades
        await this.sproutRepository.delete(sproutId);
    }
    
    public async addAffirmation(sproutId: string, text: string): Promise<void> {
        // Affirmation handling (loads Sprouts, adds affirmation)
        const sprout = await this.requireSprout(sproutId);
        
        sprout.addAffirmation(text);
        
        await this.sproutRepository.update(sprout);
    }

    public async removeAffirmation(sproutId: string, affirmationId: string): Promise<void> {
        // Removes specific affirmation
        const sprout = await this.requireSprout(sproutId);
        
        sprout.removeAffirmation(affirmationId);
        
        await this.sproutRepository.update(sprout);
    }
    
    public async updateAffirmationText(
        sproutId: string, 
        affirmationId: string, 
        text: string,
    ): Promise<void> {
        // Updates affirmation text
        const sprout = await this.requireSprout(sproutId);
        
        sprout.updateAffirmationText(affirmationId, text);
        
        await this.sproutRepository.update(sprout);
    }

    public async addTrigger(sproutId: string, text: string): Promise<void> {
        // Trigger handling (loads Sprouts, adds trigger)
        const sprout = await this.requireSprout(sproutId);
        
        sprout.addTrigger(text);
        
        await this.sproutRepository.update(sprout);
    }

    public async removeTrigger(sproutId: string, triggerId: string): Promise<void> {
        // Removes specific trigger
        const sprout = await this.requireSprout(sproutId);
        
        sprout.removeTrigger(triggerId);
        
        await this.sproutRepository.update(sprout);
    }
    
    public async updateTriggerText(
        sproutId: string, 
        triggerId: string, 
        text: string,
    ): Promise<void> {
        // Updates trigger text
        const sprout = await this.requireSprout(sproutId);
        
        sprout.updateTriggerText(triggerId, text);
        
        await this.sproutRepository.update(sprout);
    }

    public async updateSproutAppearance(
        sproutId: string, 
        updates: { color?: string; shapeId?: string; hatId?: string },
    ): Promise<void> {
        // Updates visual props (color/shape/hat) if defined
        const sprout = await this.requireSprout(sproutId);
        
        if (updates.color !== undefined) {
            sprout.setColor(updates.color);
        }
        if (updates.shapeId !== undefined) {
            sprout.setShapeId(updates.shapeId);
        }
        if (updates.hatId !== undefined) {
            sprout.setHatId(updates.hatId);
        }
        
        await this.sproutRepository.update(sprout);
    }

    private async requireSprout(sproutId: string): Promise<Sprout> {
        // Helpers to fetch sprout
        const sprout = await this.sproutRepository.find(sproutId);
        if (!sprout) {
            throw new Error('Sprout not found');
        }
        return sprout;
    }
}