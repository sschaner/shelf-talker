import { Injectable } from '@angular/core';
import {
  Auth,
  User,
  AuthCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithCredential,
  sendEmailVerification
} from '@angular/fire/auth';
import {
  Firestore,
  doc,
  setDoc,
  serverTimestamp,
  getDoc,
} from '@angular/fire/firestore';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

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
    try {
      await this.createUserDoc(user, { firstName, lastName });
    } catch (e) {
      console.error('Error creating user document:', e);
    }
    
    try {
      await sendEmailVerification(user);
    } catch (e) {
      console.error('Error sending verification email:', e);
    }

    return cred;
  }

  /**
   * Email/password login.
   * Enforces email verification.
   */
  async loginEmail(email: string, password: string) {
    const credential = await signInWithEmailAndPassword(this.auth, email, password);
    
    if (!credential.user.emailVerified) {
      await signOut(this.auth);
      const error: any = new Error('Email not verified');
      error.code = 'auth/email-not-verified';
      throw error;
    }

    return credential;
  }

  /**
   * Google Login (Web & Native)
   * If an email/password account already exists with the same email,
   * throws AccountExistsError with the pending credential for linking.
   */
  async loginWithGoogle() {
    let userCredential;
    let googleCredential: AuthCredential | null = null;

    try {
      if (Capacitor.isNativePlatform()) {
        const result = await FirebaseAuthentication.signInWithGoogle();
        googleCredential = GoogleAuthProvider.credential(result.credential?.idToken);
        userCredential = await signInWithCredential(this.auth, googleCredential);
      } else {
        const provider = new GoogleAuthProvider();
        userCredential = await signInWithPopup(this.auth, provider);
        googleCredential = GoogleAuthProvider.credentialFromResult(userCredential);
      }
    } catch (e: any) {
      throw e;
    }

    const user = userCredential.user;
    const userRef = doc(this.firestore, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const { firstName, lastName } = this.splitName(user.displayName);
      await this.createUserDoc(user, { firstName, lastName });
    }

    return userCredential;
  }

  /**
   * Microsoft Login (Web & Native)
   * If the Microsoft account email is also a Google account, link them.
   */
  async loginWithMicrosoft() {
    let userCredential;

    if (Capacitor.isNativePlatform()) {
      const result = await FirebaseAuthentication.signInWithMicrosoft();
      const provider = new OAuthProvider('microsoft.com');
      const credential = provider.credential({
        idToken: result.credential?.idToken,
        accessToken: result.credential?.accessToken
      });
      userCredential = await signInWithCredential(this.auth, credential);
    } else {
      const provider = new OAuthProvider('microsoft.com');
      userCredential = await signInWithPopup(this.auth, provider);
    }

    const user = userCredential.user;
    const userRef = doc(this.firestore, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const { firstName, lastName } = this.splitName(user.displayName);
      await this.createUserDoc(user, { firstName, lastName });
    }

    // Attempt to link Google account if the email is a Google account
    await this.linkGoogleAccountIfAvailable(user);

    return userCredential;
  }

  /**
   * Sign out the current user.
   */
  async logout() {
    // Attempt to sign out of Google plugin if on native, 
    // but don't block standard logout if it fails or isn't needed.
    try {
        await FirebaseAuthentication.signOut();
    } catch (e) {
        // Ignore error if not signed in with Google
        console.warn('Google logout error:', e);
    }
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

  /**
   * Update the user's profile photo URL in Firestore
   */
  async updateProfilePhoto(photoURL: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) return;

    const userRef = doc(this.firestore, 'users', user.uid);
    await setDoc(
      userRef,
      {
        photoURL,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }


  /*****************
   * PRIVATE METHODS
   *****************/

  /**
   * Helper to split "First Last" into parts.
   */
  private splitName(displayName: string | null): { firstName: string; lastName: string } {
    if (!displayName) return { firstName: '', lastName: '' };
    const parts = displayName.trim().split(' ');
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ') || '';
    return { firstName, lastName };
  }

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

  /**
   * Attempt to link a Google account if the user's email has an existing Google sign-in method.
   * This is used when a Microsoft account email is also a Google account.
   */
  private async linkGoogleAccountIfAvailable(user: User): Promise<void> {
    if (!user.email) {
      return;
    }

    // Check if user already has Google provider linked
    const hasGoogleLinked = user.providerData.some(
      (provider) => provider.providerId === 'google.com'
    );
    if (hasGoogleLinked) {
      return;
    }

    try {
      // Check if this email has a Google sign-in method available
      const signInMethods = await fetchSignInMethodsForEmail(this.auth, user.email);
      if (!signInMethods.includes('google.com')) {
        return;
      }

      // Prompt the user to link their Google account
      if (Capacitor.isNativePlatform()) {
        const result = await FirebaseAuthentication.signInWithGoogle();
        const credential = GoogleAuthProvider.credential(result.credential?.idToken);
        await linkWithCredential(user, credential);
      } else {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ login_hint: user.email });
        await linkWithPopup(user, provider);
      }
    } catch (e: any) {
      // Silently fail if linking isn't possible
      // Common reasons: account already linked, user cancelled popup
      console.warn('Could not link Google account:', e?.code || e?.message);
    }
  }
}
