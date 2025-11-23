import { Component, Input } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';

import { AuthService } from 'src/app/core/auth.service';  
import { AppUser } from 'src/app/models/user.model';

@Component({
  selector: 'app-main-header',
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle],
  templateUrl: './main-header.component.html',
  styleUrls: ['./main-header.component.scss'],
})
export class MainHeaderComponent {
  @Input() title?: string;
  @Input() user: AppUser | null = null;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  get displayTitle(): string {
    if (this.title) {
      return this.title;
    }
    else {
      return '';
    }
  }

  async logOut() {
    try {
      await this.auth.logout();
    } finally {
      this.router.navigateByUrl('/', { replaceUrl: true });
    }
  }

  goToProfile() {
    this.router.navigateByUrl('/profile');
  }
}
