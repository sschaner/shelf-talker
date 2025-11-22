import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  updateProfile,
  User
} from '@angular/fire/auth';
import {
    Firestore,
    doc,
    setDoc,
    serverTimestamp
} from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(
    private auth: Auth, 
    private firestore: Firestore
  ) {}

  async registerEmail(
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) {
    
    const cred = await createUserWithEmailAndPassword(this.auth, email, password);
    const user = cred.user;
    
    const displayName = `${firstName} ${lastName}`.trim();
    await updateProfile(user, { displayName });

    await this.upsertUserDoc(user, { firstName, lastName });

    return cred;
  }

  // Create or update a document in Firestore for the user - users/{uid}
  private async upsertUserDoc(
    user: User,
    extra: { firstName?: string; lastName?: string } = {}
  ) {
    const userRef = doc(this.firestore, 'users', user.uid);
    const now = serverTimestamp();

    await setDoc(
      userRef,
      {
        email: user.email,
        displayName: user.displayName,
        firstName: extra.firstName ?? null,
        lastName: extra.lastName ?? null,
        photoURL: user.photoURL ?? null,
        createdAt: now,
        updatedAt: now
      },
      { merge: true }
    );
  }
}