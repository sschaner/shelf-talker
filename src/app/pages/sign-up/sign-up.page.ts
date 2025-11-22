import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonGrid, IonRow, IonCol,
  IonItem, IonInput, IonButton
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {}

  clearError() {
      this.error = '';
    }
  
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
  
  get passwordMismatch(): boolean {
    return !!this.password && !!this.confirm && this.password !== this.confirm;
  }

  private isBlank(s: string | null | undefined): boolean {
    return !s || !s.trim();
  }

  async submit() {
    const first = this.firstName.trim();
    const last  = this.lastName.trim();
    const mail  = this.email.trim().toLowerCase();
    const pass  = this.password;
    const conf  = this.confirm;

    if (this.isBlank(first) || this.isBlank(last) ||
        this.isBlank(mail)  || this.isBlank(pass) || this.isBlank(conf)) {
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
      // Stub for now – later we’ll call AuthService.registerEmail(...)
      console.log('SIGNUP PAGE STUB:', { first, last, email: mail });

      await new Promise(resolve => setTimeout(resolve, 400));

      // After "success" go to dashboard (later this will be after real auth)
      await this.router.navigateByUrl('/dashboard', { replaceUrl: true });
    } catch (e) {
      this.error = 'Could not create account. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  backToLogin() {
    this.router.navigateByUrl('/', { replaceUrl: true });
  }
}
