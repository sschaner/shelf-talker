import { Component, OnInit } from '@angular/core';
import {
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonItem,
  IonButton,
  IonLabel,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';

import { UserService } from 'src/app/core/user.service';
import { AppUser } from 'src/app/models/user.model';
import { MainHeaderComponent } from 'src/app/shared/main-header/main-header.component';

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonItem,
    IonButton,
    IonLabel,
    MainHeaderComponent,
  ],
  templateUrl: './profile-view.page.html',
  styleUrls: ['./profile-view.page.scss'],
})
export class ProfileViewPage implements OnInit {
  user: AppUser | null = null;

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userService.currentUser$
      .pipe(take(1))
      .subscribe(user => {
        this.user = user;
        if (!user) {
          this.router.navigateByUrl('/', { replaceUrl: true });
        }
      });
  }

  editProfile(): void {
    this.router.navigateByUrl('/profile-edit');
  }
}
