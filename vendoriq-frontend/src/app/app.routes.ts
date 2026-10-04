import { Products } from './products/products';
import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { Dashboard } from './dashboard/dashboard'; 
import { Login } from './login/login'; 
import { PurchaseOrders } from './purchase-orders/purchase-orders'; 
import { Contracts } from './contracts/contracts'; 
import { UserManagement } from './user-management/user-management'; 
import { VendorsComponent } from './vendors/vendors'; 
import { Procurement } from './procurement/procurement'; 
import { VendorAnalytics } from './vendor-analytics/vendor-analytics'; 
import { DeliveriesComponent } from './deliveries/deliveries';

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
      
      // NAYA ROUTE YAHAN ADD KIYA HAI
      { path: 'products', component: Products }, 
      
      // NAYA DELIVERIES ROUTE YAHAN ADD KIYA HAI
      { path: 'deliveries', component: DeliveriesComponent },
      
      { path: 'procurement', component: Procurement }, 
      { path: 'performance', component: VendorAnalytics }, 
    ]
  }
];