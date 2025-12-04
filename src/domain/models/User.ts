import { BaseModel } from "./BaseModel";
import { UserProps, AuthProfile } from "../types/User.types";

export class User extends BaseModel {
    private _firstName: string | null;
    private _lastName: string | null;
    private _displayName: string | null;
    private _email: string | null;
    private _imageUrl: string | null;

    private constructor(props: UserProps) {
        super(props);
        this._firstName = props.firstName;
        this._lastName = props.lastName;
        this._displayName = props.displayName;
        this._email = props.email;
        this._imageUrl = props.imageUrl;
    }

    public get firstName(): string | null { return this._firstName; }
    public get lastName(): string | null { return this._lastName; }
    public get displayName(): string | null { return this._displayName; }
    public get email(): string | null { return this._email; }
    public get imageUrl(): string | null { return this._imageUrl; }

    static createFromProfile(profile: AuthProfile): User {
        return new User({
            ...profile,
            displayName: null,
            syncStatus: 'pending', 
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    static createFromPersistence(props: UserProps): User {
        return new User(props);
    }

    public setFirstName(firstName: string | null): void {
        this._firstName = firstName;
        this.markModified();
    }

    public setLastName(lastName: string | null): void {
        this._lastName = lastName;
        this.markModified();
    }

    public setDisplayName(displayName: string | null): void {
        this._displayName = displayName;
        this.markModified();
    }

    public setImageUrl(imageUrl: string | null): void {
        this._imageUrl = imageUrl;
        this.markModified();
    }

    // On login, updates local state to match the Auth Profile set.
    public syncWithProfile(profile: AuthProfile): void {
        this._firstName = profile.firstName;
        this._lastName = profile.lastName;
        this._imageUrl = profile.imageUrl;
        
        this.markSynced(new Date());
    }
}