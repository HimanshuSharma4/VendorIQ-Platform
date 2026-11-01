import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';

// Chart.js imports (Updated for latest version)
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, Chart, registerables } from 'chart.js';

// Chart.js ko globally register karne ke liye
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule, MatTabsModule, MatCardModule, MatTableModule, BaseChartDirective],
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

  recentPOs: any[] = [];
  poColumns: string[] = ['po_id', 'vendor', 'amount', 'status', 'delivery'];

  vendorPerformance: any[] = [];
  vendorColumns: string[] = ['name', 'score', 'quality', 'risk'];

  vendorsMap: { [key: number]: string } = {};

  // ==========================================
  // CHART CONFIGURATIONS
  // ==========================================
  
  // Bar Chart: Live 6-Month Spend Trend
  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      { 
        data: [], 
        label: 'Approved Spend (₹)', 
        backgroundColor: '#3b82f6', 
        borderRadius: 4 
      }
    ]
  };
  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } }
  };

  // Doughnut Chart: Vendor Risk Distribution
  public doughnutChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Low Risk', 'Medium Risk', 'High Risk'],
    datasets: [
      { 
        data: [0, 0, 0], 
        backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'],
        borderWidth: 0
      }
    ]
  };
  public doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: { legend: { position: 'bottom' } }
  };
  // ==========================================

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.userRole = localStorage.getItem('role') || 'Admin';
    this.fetchDashboardAnalytics();
    this.fetchLiveDashboardData(); 
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

  fetchLiveDashboardData(): void {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get<any[]>('http://127.0.0.1:8000/vendors', { headers }).subscribe({
      next: (vendors) => {
        vendors.forEach(v => this.vendorsMap[v.vendor_id] = v.vendor_name);

        // Fetch Live Purchase Orders & Calculate 6-Month Spend Trend
        this.http.get<any[]>('http://127.0.0.1:8000/purchase-orders', { headers }).subscribe(pos => {
          this.recentPOs = pos.map(po => ({
            po_id: po.po_id,
            vendor: this.vendorsMap[po.vendor_id] || 'Unknown Vendor',
            amount: po.total_amount,
            status: po.order_status,
            delivery: po.actual_delivery_date ? 'Delivered' : 'Awaiting'
          }));

          // Generate Last 6 Months Labels dynamically
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const labels: string[] = [];
          const spendData = [0, 0, 0, 0, 0, 0];
          
          for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            labels.push(monthNames[d.getMonth()]);
          }

          // Map PO amounts to corresponding months (Only Approved Status)
          pos.forEach(po => {
            const dateString = po.created_at || po.order_date || po.po_date || new Date().toISOString(); 
            const poDate = new Date(dateString);
            const monthName = monthNames[poDate.getMonth()];
            const index = labels.indexOf(monthName);
            
            if (index !== -1 && po.order_status === 'Approved') {
               spendData[index] += parseFloat(po.total_amount) || 0;
            }
          });

          // Update Bar Chart Data
          this.barChartData = {
            labels: labels,
            datasets: [{ 
              data: spendData, 
              label: 'Approved Spend (₹)', 
              backgroundColor: '#3b82f6', 
              borderRadius: 4 
            }]
          };

          this.cdr.detectChanges();
        });

        // Fetch Vendor Performance & Calculate Risk Distribution
        this.http.get<any[]>('http://127.0.0.1:8000/vendor-performance', { headers }).subscribe(perfs => {
          let lowRisk = 0, medRisk = 0, highRisk = 0;

          this.vendorPerformance = perfs.map(vp => {
            if(vp.risk_level === 'Low') lowRisk++;
            else if(vp.risk_level === 'Medium') medRisk++;
            else if(vp.risk_level === 'High') highRisk++;

            return {
              name: this.vendorsMap[vp.vendor_id] || 'Unknown Vendor',
              score: vp.reliability_score,
              quality: vp.quality_score,
              risk: vp.risk_level
            };
          });

          // Update Doughnut Chart Data
          this.doughnutChartData = {
            labels: ['Low Risk', 'Medium Risk', 'High Risk'],
            datasets: [
              { 
                data: [lowRisk, medRisk, highRisk], 
                backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'],
                borderWidth: 0
              }
            ]
          };

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