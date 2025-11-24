import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol
} from '@ionic/angular/standalone';
import { UserService } from 'src/app/core/user.service';
import { AppUser } from 'src/app/models/user.model';
import { MainHeaderComponent } from 'src/app/shared/main-header/main-header.component';
import { AsyncPipe } from '@angular/common';
import { UserDisplayNamePipe } from 'src/app/shared/user-display-name.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonGrid,
    IonRow,
    IonCol,
    MainHeaderComponent,
    UserDisplayNamePipe,
    AsyncPipe
  ],
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage {
  readonly user$ = this.userService.currentUser$;

  constructor(
    private userService: UserService,
  ) {}
}
