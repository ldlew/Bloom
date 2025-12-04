// Sync status for updates, not sure if it's best-practice yet.
export type SyncStatus = 'synced' | 'pending' | 'unsynced';

// Common properties for all models
export interface BaseModelProps {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    syncStatus: SyncStatus;
}
