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
  IonCheckbox,
  AlertController
} from '@ionic/angular/standalone';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from 'src/app/core/auth.service';
import { UserService } from 'src/app/core/user.service';
import { AuthCredential } from '@angular/fire/auth';
import { firstValueFrom } from 'rxjs';

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
    IonCheckbox,
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
  googlePhotoURL: string | null = null;
  useGooglePhoto = false;

  public readonly emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  constructor(
    private auth: AuthService,
    private userService: UserService,
    private router: Router,
    private alertController: AlertController
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
    this.googlePhotoURL = null;
    this.useGooglePhoto = false;
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
        this.pendingGoogleCredential,
        this.useGooglePhoto ? this.googlePhotoURL : null
      );

      // Clear linking state
      this.linkingMode = false;
      this.pendingGoogleCredential = null;
      this.linkingEmail = '';
      this.googlePhotoURL = null;
      this.useGooglePhoto = false;
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
      const credential = await this.auth.loginWithGoogle();
      const user = credential.user;
      console.log('User Provider Data:', user.providerData);

      // Check if we should prompt for photo update
      if (user.photoURL) {
        const appUser = await firstValueFrom(this.userService.getUser(user.uid));
        
        if (appUser && !appUser.photoURL) {
          const confirm = await this.askToUseGooglePhoto();
          if (confirm) {
            await this.auth.updateProfilePhoto(user.photoURL);
          }
        }
      }

      await this.router.navigateByUrl('/dashboard', { replaceUrl: true });
    } catch (e: any) {
      this.error = this.humanizeError(e);
    } finally {
      this.loading = false;
    }
  }

  private async askToUseGooglePhoto(): Promise<boolean> {
    return new Promise(async (resolve) => {
      const alert = await this.alertController.create({
        header: 'Update Profile Photo?',
        message: 'Would you like to use your Google profile photo?',
        buttons: [
          {
            text: 'No',
            role: 'cancel',
            handler: () => resolve(false)
          },
          {
            text: 'Yes',
            handler: () => resolve(true)
          }
        ]
      });

      await alert.present();
    });
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
      case 'auth/email-not-verified':
        return 'Please verify your email address before logging in.';
      default:
        console.error('Login error:', code, e);
        return `Error: ${e.message || 'Something went wrong.'}`;
    }
  }
}
