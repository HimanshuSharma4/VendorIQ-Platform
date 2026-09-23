import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { Dashboard } from './dashboard/dashboard'; 
import { Login } from './login/login'; 
import { PurchaseOrders } from './purchase-orders/purchase-orders'; 
import { Contracts } from './contracts/contracts'; 
import { UserManagement } from './user-management/user-management'; 
import { VendorsComponent } from './vendors/vendors'; 
// Ye rahe aapke dono naye imports
import { Procurement } from './procurement/procurement'; 
import { Performance } from './performance/performance';

export const routes: Routes = [
  { path: 'login', component: Login },
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      { path: 'purchase-orders', component: PurchaseOrders }, 
      { path: 'contracts', component: Contracts }, 
      { path: 'user-management', component: UserManagement }, 
      { path: 'vendors', component: VendorsComponent }, 
      // Dono alag-alag pages ke routes
      { path: 'procurement', component: Procurement }, 
      { path: 'performance', component: Performance}, 
    ]
  }
];