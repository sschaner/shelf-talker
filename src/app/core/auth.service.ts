import { Injectable } from '@angular/core';
import {
  Auth,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from '@angular/fire/auth';
import {
  Firestore,
  doc,
  setDoc,
  serverTimestamp,
} from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(
    private auth: Auth,
    private firestore: Firestore
  ) {}

  /**
   * Expose the raw Auth instance (useful for resolvers/guards later)
   */
  get authInstance(): Auth {
    return this.auth;
  }

  /**
   * Email/password registration.
   * - Creates Firebase Auth user
   * - Sets displayName in Auth
   * - Creates the Firestore users/{uid} document
   */
  async registerEmail(
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) {
    const cred = await createUserWithEmailAndPassword(this.auth, email, password);
    const user = cred.user;

    // Update Firebase Auth profile
    const displayName = `${firstName} ${lastName}`.trim();
    await updateProfile(user, { displayName });

    // Create user document in Firestore
    await this.createUserDoc(user, { firstName, lastName });

    return cred;
  }

  /**
   * Email/password login.
   */
  async loginEmail(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  /**
   * Sign out the current user.
   */
  async logout() {
    await signOut(this.auth);
  }

  /**
   * Update first + last name
   */
  async updateProfileNames(firstName: string, lastName: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('No logged-in user.');
    }

    const displayName = `${firstName} ${lastName}`.trim();

    // Update Firebase Auth profile
    await updateProfile(user, { displayName });

    // Update Firestore user document
    const userRef = doc(this.firestore, 'users', user.uid);
    const now = serverTimestamp();

    await setDoc(
      userRef,
      {
        firstName,
        lastName,
        displayName,
        updatedAt: now,
      },
      { merge: true }
    );
  }

    /**
   * Change password for the currently logged-in email/password user.
   * - Reauthenticates with current password
   * - Updates password if reauth succeeds
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const user = this.auth.currentUser;

    if (!user || !user.email) {
      const error: any = new Error('No authenticated user');
      error.code = 'auth/no-current-user';
      throw error;
    }

    // Reauthenticate with current password
    const credential = EmailAuthProvider.credential(user.email, currentPassword);

    await reauthenticateWithCredential(user, credential);
    
    await updatePassword(user, newPassword);
  }


  /*****************
   * PRIVATE METHODS
   *****************/

  /**
   * Create the initial users/{uid} doc in Firestore.
   * This is called only on registration.
   */
  private async createUserDoc(
    user: User,
    extra: { firstName?: string; lastName?: string } = {}
  ) {
    const userRef = doc(this.firestore, 'users', user.uid);
    const now = serverTimestamp();

    await setDoc(
      userRef,
      {
        email: user.email ?? null,
        displayName: user.displayName ?? null,
        firstName: extra.firstName ?? null,
        lastName: extra.lastName ?? null,
        photoURL: user.photoURL ?? null,
        createdAt: now,
        updatedAt: now,
      },
      { merge: true }
    );
  }
}
