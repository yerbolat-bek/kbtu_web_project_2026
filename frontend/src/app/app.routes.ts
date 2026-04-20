import { Routes } from '@angular/router';
import { AuthComponent } from './components/login/auth.component';
import { RideListComponent } from './components/ride-list/ride-list.component';
import { MyRidesComponent } from './components/my-rides/my-rides.component';

const authGuard = () => {
  const token = localStorage.getItem('token');
  if (token) return true;
  return '/login'; 
};

export const routes: Routes = [
  { path: 'login', component: AuthComponent },

  { path: 'rides', component: RideListComponent, canActivate: [authGuard] },

  { path: 'my-rides', component: MyRidesComponent, canActivate: [authGuard] },

  { path: '', redirectTo: 'login', pathMatch: 'full' }
];