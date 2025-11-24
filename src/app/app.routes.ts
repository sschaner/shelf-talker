import { Routes } from '@angular/router';
import { currentUserResolver } from './core/user.resolver';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage),
  },
  {
    path: 'sign-up',
    loadComponent: () => import('./pages/sign-up/sign-up.page').then( m => m.SignUpPage)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.page').then( m => m.DashboardPage),
    resolve: { user: currentUserResolver}
  },
  {
    path: 'profile-view',
    loadComponent: () => import('./pages/profile-view/profile-view.page').then(m => m.ProfileViewPage),
    resolve: { user: currentUserResolver },
  },
  {
    path: 'profile-view',
    loadComponent: () => import('./pages/profile-view/profile-view.page').then(m => m.ProfileViewPage),
    resolve: { user: currentUserResolver },
  },
  {
    path: 'profile-edit',
    loadComponent: () => import('./pages/profile-edit/profile-edit.page').then(m => m.ProfileEditPage),
    resolve: { user: currentUserResolver },
  },
  // Wildcard route for a 404 page (Should always be last)
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  }  
];
