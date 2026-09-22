import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { Dashboard } from './dashboard/dashboard'; 
import { Login } from './login/login'; 
import { PurchaseOrders } from './purchase-orders/purchase-orders'; 
import { Contracts } from './contracts/contracts'; // <-- Naya import yahan hai

export const routes: Routes = [
  // Login route (Bina sidebar ke)
  { path: 'login', component: Login },

  // Main Dashboard Layout (Sidebar ke sath)
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      { path: 'purchase-orders', component: PurchaseOrders }, 
      { path: 'contracts', component: Contracts }, // <-- Naya route yahan hai
    ]
  }
];