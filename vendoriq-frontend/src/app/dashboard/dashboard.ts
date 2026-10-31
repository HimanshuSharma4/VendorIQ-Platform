import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule, MatTabsModule, MatCardModule, MatTableModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'] 
})
export class Dashboard implements OnInit {
  userRole: string = 'Admin'; 

  stats = {
    total_vendors: 0,
    active_vendors: 0,
    total_purchase_orders: 0,
    approved_spend: 0
  };

  // Arrays ko empty kar diya hai, ab data API se live aayega
  recentPOs: any[] = [];
  poColumns: string[] = ['po_id', 'vendor', 'amount', 'status', 'delivery'];

  vendorPerformance: any[] = [];
  vendorColumns: string[] = ['name', 'score', 'quality', 'risk'];

  // Vendor ID se Vendor Name map karne ke liye object
  vendorsMap: { [key: number]: string } = {};

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.userRole = localStorage.getItem('role') || 'Admin';
    this.fetchDashboardAnalytics();
    this.fetchLiveDashboardData(); // Real data fetch trigger
  }

  fetchDashboardAnalytics(): void {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get<any>('http://127.0.0.1:8000/analytics', { headers })
      .subscribe({
        next: (data) => {
          this.stats = data;
          this.cdr.detectChanges(); 
        },
        error: (err) => console.error('Error fetching dashboard analytics:', err)
      });
  }

  // NAYA FUNCTION: Real PO aur Performance data fetch karne ke liye
  fetchLiveDashboardData(): void {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    // Step 1: Vendors fetch karo taaki table me ID ki jagah Name dikha sakein
    this.http.get<any[]>('http://127.0.0.1:8000/vendors', { headers }).subscribe({
      next: (vendors) => {
        // Vendors ka mapping bana lo (jaise ID 1 = TCS)
        vendors.forEach(v => this.vendorsMap[v.vendor_id] = v.vendor_name);

        // Step 2: Live Purchase Orders fetch karo aur format karo
        this.http.get<any[]>('http://127.0.0.1:8000/purchase-orders', { headers }).subscribe(pos => {
          this.recentPOs = pos.map(po => ({
            po_id: po.po_id,
            vendor: this.vendorsMap[po.vendor_id] || 'Unknown Vendor', // Asli naam map ho raha hai
            amount: po.total_amount,
            status: po.order_status,
            delivery: po.actual_delivery_date ? 'Delivered' : 'Awaiting'
          }));
          this.cdr.detectChanges();
        });

        // Step 3: Live Vendor Performance fetch karo aur format karo
        this.http.get<any[]>('http://127.0.0.1:8000/vendor-performance', { headers }).subscribe(perfs => {
          this.vendorPerformance = perfs.map(vp => ({
            name: this.vendorsMap[vp.vendor_id] || 'Unknown Vendor',
            score: vp.reliability_score,
            quality: vp.quality_score,
            risk: vp.risk_level
          }));
          this.cdr.detectChanges();
        });
      },
      error: (err) => console.error('Error fetching live dashboard data:', err)
    });
  }

  getRiskStyle(risk: string) {
    if (risk === 'Low') return { color: 'green', fontWeight: 'bold' }; 
    if (risk === 'Medium') return { color: 'orange', fontWeight: 'bold' }; 
    if (risk === 'High') return { color: 'red', fontWeight: 'bold' }; 
    return {}; 
  }
}