// src/app/core/user.service.ts
import { Injectable } from '@angular/core';
import { Auth, User as FirebaseUser, authState } from '@angular/fire/auth';
import {
  Firestore,
  doc,
  docSnapshots,
} from '@angular/fire/firestore';
import { AppUser } from '../models/user.model';
import { Observable, of, firstValueFrom } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class UserService {
  readonly authUser$: Observable<FirebaseUser | null>;
  readonly currentUser$: Observable<AppUser | null>;
  readonly isLoggedIn$: Observable<boolean>;

  constructor(
    private auth: Auth,
    private firestore: Firestore
  ) {
    this.authUser$ = authState(this.auth).pipe(
      // cache latest value for late subscribers
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.currentUser$ = this.authUser$.pipe(
      switchMap(user =>
        user ? this.getUser(user.uid) : of(null)
      ),
      shareReplay({ bufferSize: 1, refCount: true })
    );
    
    this.isLoggedIn$ = this.authUser$.pipe(
      map(u => !!u),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  /**
   * Strongly-typed lookup of a user's Firestore document.
   * Returns null if the document does not exist.
   */
  getUser(uid: string): Observable<AppUser | null> {
    const ref = doc(this.firestore, 'users', uid);

    return docSnapshots(ref).pipe(
      map(snap => {
        if (!snap.exists()) {
          return null;
        }
        const data = snap.data() as Omit<AppUser, 'uid'>;
        return { uid: snap.id, ...data };
      })
    );
  }

  /**
   * Convenience helper for one-off reads (e.g. in guards / resolvers).
   */
  async getCurrentUserOnce(): Promise<AppUser | null> {
    return firstValueFrom(this.currentUser$);
  }
}
