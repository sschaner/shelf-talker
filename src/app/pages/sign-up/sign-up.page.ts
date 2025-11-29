import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonItem,
  IonInput,
  IonButton,
  AlertController
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    FormsModule,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonItem,
    IonInput,
    IonButton,
  ],
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})
export class SignUpPage {
  firstName = '';
  lastName  = '';
  email     = '';
  password  = '';
  confirm   = '';

  loading   = false;
  error     = '';

  showPassword = false;
  showConfirmPassword = false;

  public readonly emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  constructor(
    private auth: AuthService,
    private router: Router,
    private alertController: AlertController
  ) {}

  get passwordMismatch(): boolean {
    const pass = (this.password || '').trim();
    const conf = (this.confirm || '').trim();
    return !!pass && !!conf && pass !== conf;
  }
  
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  clearError() {
    this.error = '';
  }

  private isBlank(s: string | null | undefined): boolean {
    return !s || !s.trim();
  }

  private humanizeError(e: any): string {
    const code = e?.code as string | undefined;

    switch (code) {
      case 'auth/email-already-in-use':
        return 'That email is already in use.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Please use a stronger password.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection and try again.';
      default:
        console.error('Sign-up error:', code, e);
        return 'Could not create account. Please try again.';
    }
  }

  async submit() {
    if (this.loading) {
        return;
    }

    const first = (this.firstName || '').trim();
    const last  = (this.lastName  || '').trim();
    const mail  = (this.email     || '').trim().toLowerCase();
    const pass  = (this.password  || '').trim();
    const conf  = (this.confirm   || '').trim();

    if (
      this.isBlank(first) ||
      this.isBlank(last)  ||
      this.isBlank(mail)  ||
      this.isBlank(pass)  ||
      this.isBlank(conf)
    ) {
      this.error = 'Please fill out all fields.';
      return;
    }

    if (!this.emailPattern.test(mail)) {
      this.error = 'Please enter a valid email address.';
      return;
    }

    if (pass.length < 8) {
      this.error = 'Password must be at least 8 characters.';
      return;
    }

    if (this.passwordMismatch) {
      this.error = 'Passwords do not match.';
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      await this.auth.registerEmail(mail, pass, first, last);

      const alert = await this.alertController.create({
        header: 'Account Created',
        message: 'We have sent a verification email to your inbox. Please verify your email to secure your account.',
        buttons: ['OK']
      });
      await alert.present();
      await alert.onDidDismiss();

      // Sign out and redirect to login
      await this.auth.logout();
      await this.router.navigateByUrl('/home', { replaceUrl: true });
    } catch (e: any) {
      this.error = this.humanizeError(e);
    } finally {
      this.loading = false;
    }
  }

  backToLogin() {
    this.router.navigateByUrl('/', { replaceUrl: true });
  }
}
