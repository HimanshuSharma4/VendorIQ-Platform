import { Routes } from '@angular/router';
import { Login } from './login/login';
// Niche wali line me maine DashboardComponent ko Dashboard kar diya hai
import { Dashboard } from './dashboard/dashboard'; 

export const routes: Routes = [
  { path: 'login', component: Login },
  
  { path: 'dashboard', component: Dashboard }, 
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];