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
import { InvoicesComponent } from './invoices/invoices';
import { QualityInspectionComponent } from './quality-inspection/quality-inspection';
import { CommunicationsComponent } from './communications/communications'; // NAYA IMPORT

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
      { path: 'products', component: Products }, 
      { path: 'deliveries', component: DeliveriesComponent },
      { path: 'invoices', component: InvoicesComponent },
      { path: 'quality-inspection', component: QualityInspectionComponent },
      
      // NAYA COMMUNICATIONS ROUTE
      { path: 'communications', component: CommunicationsComponent },
      
      { path: 'procurement', component: Procurement }, 
      { path: 'performance', component: VendorAnalytics }, 
    ]
  }
];