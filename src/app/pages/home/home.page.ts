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

  public readonly emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  constructor(private router: Router) {}

  clearError() {
      this.error = '';
    }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onLoginEmail() {
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

    // Stub for now – just log it.
    console.log('Login with email/password (stub):', {
      email: this.email,
      password: this.password,
    });

    // Simulate quick "done"
    setTimeout(() => {
      this.loading = false;
      // later: call AuthService.loginEmail(...) and navigate
      this.router.navigateByUrl('/dashboard', { replaceUrl: true });
    }, 300);
  }

  onGoogle() {
    this.loading = true;
    this.error = '';

    console.log('Google sign-in (stub)');

    setTimeout(() => {
      this.loading = false;
      // later: this.auth.loginWithGoogle() + navigation
    }, 300);
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
}
