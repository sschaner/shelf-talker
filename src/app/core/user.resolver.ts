import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { UserService } from './user.service';
import { AppUser } from '../models/user.model';
import { Observable, of } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';

/**
 * Resolves the current AppUser before activating the route.
 * - If logged in and Firestore user doc exists → returns AppUser
 * - If not logged in → redirects to home (login) and resolves null
 */
export const currentUserResolver: ResolveFn<AppUser | null> = () => {
  const userService = inject(UserService);
  const router = inject(Router);

  return userService.currentUser$.pipe(
    take(1),
    switchMap(user => {
      if (user) return of(user);

      // Not logged in → send to login page
      router.navigateByUrl('/', { replaceUrl: true });
      return of(null);
    })
  );
};
