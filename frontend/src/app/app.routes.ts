import { Routes } from '@angular/router';
import { AuthComponent } from './components/login/auth.component';
import { RideListComponent } from './components/ride-list/ride-list.component'

export const routes: Routes = [
    {path: 'login', component: AuthComponent },
    {path: 'rides', component: RideListComponent },
    { path: '', redirectTo: 'login', pathMatch: 'full' }

];
