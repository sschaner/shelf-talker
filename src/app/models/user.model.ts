export interface AppUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    firstName: string | null;
    lastName: string | null;
    photoURL: string | null;

    createdAt: any;
    updatedAt: any;
}