import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonItem,
  IonInput,
  IonButton
} from '@ionic/angular/standalone';
import { Router, RouterLink } from '@angular/router';
import { AuthService, AccountExistsError } from 'src/app/core/auth.service';
import { AuthCredential } from '@angular/fire/auth';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonItem,
    IonInput,
    IonButton,
    FormsModule,
    RouterLink
  ],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage {
  email = '';
  password = '';
  loading = false;
  error = '';
  showPassword = false;

  // Account linking state
  linkingMode = false;
  pendingGoogleCredential: AuthCredential | null = null;
  linkingEmail = '';

  public readonly emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  clearError() {
      this.error = '';
    }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  cancelLinking() {
    this.linkingMode = false;
    this.pendingGoogleCredential = null;
    this.linkingEmail = '';
    this.password = '';
    this.error = '';
  }

  async onLoginEmail() {
    if (this.loading) {
      return;
    }

    const mail = (this.email || '').trim().toLowerCase();
    const pass = (this.password || '').trim();

    if (!mail || !pass) {
      this.error = 'Please enter your email and password.';
      return;
    }

    if (!this.emailPattern.test(mail)) {
      this.error = 'Please enter a valid email address.';
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      await this.auth.loginEmail(mail, pass);

      await this.router.navigateByUrl('/dashboard', { replaceUrl: true });
    } catch (e: any) {
      this.error = this.humanizeError(e);
    } finally {
      this.loading = false;
    }
  }

  async onLinkAccount() {
    if (this.loading || !this.pendingGoogleCredential) {
      return;
    }

    const pass = (this.password || '').trim();

    if (!pass) {
      this.error = 'Please enter your password.';
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      await this.auth.linkGoogleToEmailAccount(
        this.linkingEmail,
        pass,
        this.pendingGoogleCredential
      );

      // Clear linking state
      this.linkingMode = false;
      this.pendingGoogleCredential = null;
      this.linkingEmail = '';
      this.password = '';

      await this.router.navigateByUrl('/dashboard', { replaceUrl: true });
    } catch (e: any) {
      this.error = this.humanizeError(e);
    } finally {
      this.loading = false;
    }
  }

  async onGoogle() {
    this.loading = true;
    this.error = '';

    try {
      await this.auth.loginWithGoogle();
      await this.router.navigateByUrl('/dashboard', { replaceUrl: true });
    } catch (e: any) {
      if (e instanceof AccountExistsError) {
        // Switch to linking mode
        this.linkingMode = true;
        this.linkingEmail = e.email;
        this.pendingGoogleCredential = e.pendingCredential;
        this.password = '';
        this.error = '';
      } else {
        this.error = this.humanizeError(e);
      }
    } finally {
      this.loading = false;
    }
  }

  onMicrosoft() {
    this.loading = true;
    this.error = '';

    console.log('Microsoft sign-in (stub)');

    setTimeout(() => {
      this.loading = false;
      // later: this.auth.loginWithMicrosoft() + navigation
    }, 300);
  }

  /*****************
  PRIVATE METHODS
  *****************/
  private humanizeError(e: any): string {
    const code = e?.code as string | undefined;

    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Invalid email or password.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection and try again.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in cancelled.';
      default:
        console.error('Login error:', code, e);
        return `Error: ${e.message || 'Something went wrong.'}`;
    }
  }
}
