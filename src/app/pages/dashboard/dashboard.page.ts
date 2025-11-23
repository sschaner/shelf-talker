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
import { AppUser } from 'src/app/models/user.model';
import { MainHeaderComponent } from 'src/app/shared/main-header/main-header.component';
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
    UserDisplayNamePipe
  ],
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage {
  user: AppUser | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.user = this.route.snapshot.data['user'] ?? null;
  }
}
