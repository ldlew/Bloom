import { BaseModelProps } from './Common.types';

// Properties for Sprout
export interface SproutProps extends BaseModelProps {
    userId: string;
    color: string;
    shapeId: string;
    hatId: string;
}

// Value object for affirmations
export interface Affirmation {
    readonly id: string;
    readonly text: string;
    readonly position: number;
}

// Value object for triggers
export interface Trigger {
    readonly id: string;
    readonly text: string;
    readonly position: number;
}

// Lightweight snapshot for list views
export interface SproutSummary {
    id: string;
    userId: string;
    color: string;
    shapeId: string;
    hatId: string;
    firstAffirmationText: string | null;
    createdAt: Date;
    updatedAt: Date;
}