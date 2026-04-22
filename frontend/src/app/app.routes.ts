import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Routes } from '@angular/router';
import { AuthComponent } from './components/login/auth.component';
import { RideListComponent } from './components/ride-list/ride-list.component';
import { MyRidesComponent } from './components/my-rides/my-rides.component';
import { RideDetailComponent } from './components/detail/ride-detail.component';

const authGuard = () => {
  const platformId = inject(PLATFORM_ID);
  if (!isPlatformBrowser(platformId)) return true; // SSR: пропускаем
  const token = localStorage.getItem('token');
  if (token) return true;
  return '/login';
};

export const routes: Routes = [
  { path: 'login', component: AuthComponent },
  { path: 'rides', component: RideListComponent, canActivate: [authGuard] },
  { path: 'rides/:id', component: RideDetailComponent, canActivate: [authGuard] },
  { path: 'my-rides', component: MyRidesComponent, canActivate: [authGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];