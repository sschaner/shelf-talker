import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonItem,
  IonInput,
  IonButton,
  IonLabel,
} from '@ionic/angular/standalone';
import { take } from 'rxjs/operators';
import { Router } from '@angular/router';

import { UserService } from 'src/app/core/user.service';
import { AuthService } from 'src/app/core/auth.service';
import { AppUser } from 'src/app/models/user.model';
import { MainHeaderComponent } from 'src/app/shared/main-header/main-header.component';
import { VALIDATION } from 'src/app/core/constants';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonItem,
    IonInput,
    IonButton,
    IonLabel,
    FormsModule,
    MainHeaderComponent,
  ],
  templateUrl: './profile-edit.page.html',
  styleUrls: ['./profile-edit.page.scss'],
})
export class ProfileEditPage implements OnInit {
  user: AppUser | null = null;

  // Profile fields
  firstName = '';
  lastName = '';
  email = '';

  // Profile state
  loading = false;
  error = '';
  success = '';

  // Password fields
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  // Visibility toggles
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  // Password update state
  passwordLoading = false;

  public readonly minPasswordLength = VALIDATION.PASSWORD_MIN_LENGTH;

  constructor(
    private userService: UserService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userService.currentUser$
      .pipe(take(1))
      .subscribe(user => {
        this.user = user;
        if (user) {
          this.firstName = user.firstName ?? '';
          this.lastName = user.lastName ?? '';
          this.email = user.email ?? '';
        } else {
          this.router.navigateByUrl('/', { replaceUrl: true });
        }
      });
  }

  // --- Visibility toggles ---
  toggleCurrentPassword() {
    this.showCurrentPassword = !this.showCurrentPassword;
  }

  toggleNewPassword() {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  get passwordMismatch(): boolean {
    const pass = (this.newPassword || '').trim();
    const conf = (this.confirmPassword || '').trim();
    return !!pass && !!conf && pass !== conf;
  }

  clearMessages(): void {
    this.error = '';
    this.success = '';
  }

  // --- Save profile (first/last name) ---
  async saveProfile(): Promise<void> {
    if (!this.user || this.loading) {
      return;
    }

    this.clearMessages();

    const first = (this.firstName || '').trim();
    const last = (this.lastName || '').trim();

    if (!first || !last) {
      this.error = 'First and last name are required.';
      return;
    }

    this.loading = true;

    try {
      await this.auth.updateProfileNames(first, last);

      this.user = {
        ...this.user,
        firstName: first,
        lastName: last,
        displayName: `${first} ${last}`.trim(),
      };

      this.success = 'Profile updated.';
    } catch (e: any) {
      this.error = this.humanizeError(e);
    } finally {
      this.loading = false;
    }
  }
  
  async changePassword(): Promise<void> {
    if (!this.user || this.passwordLoading) {
      return;
    }

    this.clearMessages();

    const current = (this.currentPassword || '').trim();
    const next = (this.newPassword || '').trim();
    const confirm = (this.confirmPassword || '').trim();

    if (!current || !next || !confirm) {
      this.error = 'Please fill out all password fields.';
      return;
    }

    if (next.length < this.minPasswordLength) {
      this.error = `New password must be at least ${this.minPasswordLength} characters.`;
      return;
    }

    if (next !== confirm) {
      this.error = 'New passwords do not match.';
      return;
    }

    this.passwordLoading = true;

    try {
      await this.auth.changePassword(current, next);

      // Clear fields on success
      this.currentPassword = '';
      this.newPassword = '';
      this.confirmPassword = '';

      this.success = 'Password updated.';
    } catch (e: any) {
      this.error = this.humanizeError(e);
    } finally {
      this.passwordLoading = false;
    }
  }

  // --- Human-readable Firebase errors ---
  private humanizeError(e: any): string {
    const code = e?.code as string | undefined;

    switch (code) {
      case 'auth/weak-password':
        return `Please use a stronger password (at least ${this.minPasswordLength} characters).`;
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Your current password is incorrect.';
      case 'auth/requires-recent-login':
        return 'Please sign in again and then change your password.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection and try again.';
      default:
        console.error('Profile error:', code, e);
        return 'Something went wrong. Please try again.';
    }
  }
}
