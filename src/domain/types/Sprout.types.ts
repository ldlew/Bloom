// domain/types/Sprout.types.ts
import { BaseModelProps } from "./Common.types";

export interface SproutProps extends BaseModelProps {
    userId: string;
    color: string;
    shapeId: string;
    hatId: string;
}

export interface Affirmation {
    readonly id: string;
    readonly text: string;
    readonly position: number;
}

export interface Trigger {
    readonly id: string;
    readonly text: string;
    readonly position: number;
}

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