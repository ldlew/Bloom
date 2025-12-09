import { BaseModelProps } from './Common.types';

// Shape of the data we're (currently) expecting from authentication
// provider, right now Clerk.
export interface AuthProfile {
    id: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
}

// Any fields for the user that do not cross over with authentication
// fields (right now just display name).
export interface UserProps extends BaseModelProps, AuthProfile {
    displayName: string | null;
}