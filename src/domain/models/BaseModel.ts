import { SyncStatus, BaseModelProps  } from '../types/Common.types';

export abstract class BaseModel {
    private readonly _id: string;
    private readonly _createdAt: Date;
    private _updatedAt: Date;
    private _syncStatus: SyncStatus;

    constructor(props: BaseModelProps) {
        this._id = props.id;
        this._createdAt = props.createdAt;
        this._updatedAt = props.updatedAt;
        this._syncStatus = props.syncStatus;
    }

    // Accessors
    public get id(): string { return this._id; }
    public get createdAt(): Date { return this._createdAt; }
    public get updatedAt(): Date { return this._updatedAt; }
    public get syncStatus(): SyncStatus { return this._syncStatus; }

    // State Management Methods
    protected markModified(): void {
        this._updatedAt = new Date();
        this._syncStatus = 'pending';
    }

    protected markSynced(serverTimestamp: Date): void {
        this._updatedAt = serverTimestamp;
        this._syncStatus = 'synced';
    }
}