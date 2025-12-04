import { BaseModel } from "./BaseModel"; 
import { SproutProps, Affirmation, Trigger } from "../types/Sprout.types";
import { DEFAULT_COLOR, MAX_AFFIRMATIONS, MAX_TRIGGERS } from "../constants/sprout.constants";
import { v4 as uuidv4 } from 'uuid';

export class Sprout extends BaseModel {
    private _userId: string;
    private _color: string;
    private _shapeId: string;
    private _hatId: string;

    // Child collections
    private _affirmations: Affirmation[];
    private _triggers: Trigger[];

    private constructor(props: SproutProps, affirmations: Affirmation[], triggers: Trigger[]) {
        super(props);

        this._userId = props.userId;
        this._color = props.color;
        this._shapeId = props.shapeId;
        this._hatId = props.hatId;
        this._affirmations = affirmations;
        this._triggers = triggers;
    }

    // Getters
    public get userId(): string { return this._userId; }
    public get color(): string { return this._color; }
    public get shapeId(): string { return this._shapeId; }
    public get hatId(): string { return this._hatId; }
    public get affirmations(): readonly Affirmation[] { return this._affirmations; }
    public get triggers(): readonly Trigger[] { return this._triggers; }

    // "Brand new" factory method
    static createNewSprout(userId: string): Sprout {
        return new Sprout({
            id: uuidv4(),
            userId: userId,
            color: DEFAULT_COLOR,
            shapeId: 'rounded',
            hatId: 'leaves',
            syncStatus: 'pending',
            createdAt: new Date(),
            updatedAt: new Date(),            
        }, [], []);
    }

    // Factory method to rehydrate existing sprout from database.
    static createFromPersistence(props: SproutProps, affirmations: Affirmation[], triggers: Trigger[]): Sprout {
        return new Sprout(props, affirmations, triggers);
    }

    // Setters
    public setColor(color: string): void {
        this._color = color;
        this.markModified();
    }

    public setShapeId(shapeId: string): void {
        this._shapeId = shapeId;
        this.markModified();
    }

    public setHatId(hatId: string): void {
        this._hatId = hatId;
        this.markModified();
    }
    
    // --- Affirmation Management ---

    public addAffirmation(text: string): void {
        if (this._affirmations.length >= MAX_AFFIRMATIONS) {
            throw new Error("Maximum # of affirmations reached");
        }

        const newAffirmation: Affirmation = {
            id: uuidv4(),
            text: text.trim(),
            position: this._affirmations.length,
        };

        this._affirmations.push(newAffirmation);
        this.markModified();
    }

    public removeAffirmation(affirmationId: string): void {
        const index = this._affirmations.findIndex(a => a.id === affirmationId);

        if (index === -1) {
            throw new Error('Affirmation not found');
        }

        this._affirmations.splice(index, 1);

        this.reindexAffirmationPositions();
        this.markModified();
    }

    public updateAffirmationText(affirmationId: string, text: string): void {
        const index = this._affirmations.findIndex(a => a.id === affirmationId);

        if (index === -1) {
            throw new Error('Affirmation not found');
        }

        this._affirmations[index] = {
            ...this._affirmations[index],
            text: text.trim(),
        };

        this.markModified();
    }

    public reorderAffirmation(affirmationId: string, newIndex: number): void {
        const currentIndex = this._affirmations.findIndex(a => a.id === affirmationId);

        if (currentIndex === -1) {
            throw new Error('Affirmation not found');
        }

        if (newIndex < 0 || newIndex >= this._affirmations.length) {
            throw new Error('Invalid position');
        }
        
        const [item] = this._affirmations.splice(currentIndex, 1);
        this._affirmations.splice(newIndex, 0, item);

        this.reindexAffirmationPositions();
        this.markModified();
    }

    // --- Trigger Management ---

    public addTrigger(text: string): void {
        if (this._triggers.length >= MAX_TRIGGERS) {
            throw new Error("Maximum # of triggers reached");
        }

        const newTrigger: Trigger = {
            id: uuidv4(),
            text: text.trim(),
            position: this._triggers.length,
        };

        this._triggers.push(newTrigger);
        this.markModified();
    }

    public removeTrigger(triggerId: string): void {
        const index = this._triggers.findIndex(t => t.id === triggerId);

        if (index === -1) {
            throw new Error('Trigger not found');
        }

        this._triggers.splice(index, 1);

        this.reindexTriggerPositions();
        this.markModified();
    }

    public updateTriggerText(triggerId: string, text: string): void {
        const index = this._triggers.findIndex(t => t.id === triggerId);

        if (index === -1) {
            throw new Error('Trigger not found');
        }

        this._triggers[index] = {
            ...this._triggers[index],
            text: text.trim(),
        };

        this.markModified();
    }

    public reorderTrigger(triggerId: string, newIndex: number): void {
        const currentIndex = this._triggers.findIndex(t => t.id === triggerId);

        if (currentIndex === -1) {
            throw new Error('Trigger not found');
        }

        if (newIndex < 0 || newIndex >= this._triggers.length) {
            throw new Error('Invalid position');
        }
        
        const [item] = this._triggers.splice(currentIndex, 1);
        this._triggers.splice(newIndex, 0, item);

        this.reindexTriggerPositions();
        this.markModified();
    }

    // Private helpers for child reindexing.
    private reindexAffirmationPositions(): void {
        this._affirmations = this._affirmations.map((aff, index) => ({
            ...aff,
            position: index,
        }));
    }

    private reindexTriggerPositions(): void {
        this._triggers = this._triggers.map((trig, index) => ({
            ...trig,
            position: index,
        }));
    }
}