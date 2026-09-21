import { Component, OnInit } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { VendorDialog } from './vendor-dialog';
import { CommonModule } from '@angular/common'; 

// --- Chart.js Imports ---
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables); // Chart.js ko initialize karne ke liye zaroori hai

@Component({
  selector: 'app-dashboard',
  standalone: true,
  // BaseChartDirective ko imports me add kiya hai
  imports: [MatToolbarModule, MatButtonModule, MatTableModule, HttpClientModule, MatDialogModule, CommonModule, BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  displayedColumns: string[] = ['vendor_id', 'vendor_name', 'category', 'status', 'actions'];
  dataSource = new MatTableDataSource<any>([]); 
  
  analytics: any = {
    total_vendors: 0,
    active_vendors: 0,
    total_purchase_orders: 0,
    total_approved_spend: 0
  };

  // --- CHART VARIABLES ---
  public chartOptions: any = { responsive: true, maintainAspectRatio: false };
  public chartLabels: string[] = ['Total Vendors', 'Active Vendors', 'Total POs'];
  public chartType: any = 'bar';
  public chartData: any[] = [
    { data: [0, 0, 0], label: 'Platform Metrics', backgroundColor: ['#3f51b5', '#4caf50', '#ff9800'] }
  ];

  constructor(private router: Router, private http: HttpClient, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.fetchVendors();
    this.fetchAnalytics(); 
  }

  fetchAnalytics(): void {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get<any>('http://127.0.0.1:8000/analytics', { headers })
      .subscribe({
        next: (data) => {
          this.analytics = data; 
          // Backend se data aate hi Chart ko update kar do
          this.chartData = [
            { 
              data: [data.total_vendors, data.active_vendors, data.total_purchase_orders], 
              label: 'Platform Metrics', 
              backgroundColor: ['#3f51b5', '#4caf50', '#ff9800'] 
            }
          ];
        },
        error: (err) => console.error('Error fetching analytics:', err)
      });
  }

  fetchVendors(): void {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get<any[]>('http://127.0.0.1:8000/vendors', { headers })
      .subscribe({
        next: (data) => this.dataSource.data = data,
        error: (err) => {
          console.error('Error fetching data:', err);
          if (err.status === 401) {
            this.logout();
          }
        }
      });
  }

  openAddVendorDialog(): void {
    const dialogRef = this.dialog.open(VendorDialog, { width: '400px' });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchVendors();
        this.fetchAnalytics(); 
      }
    });
  }

  deleteVendor(id: number): void {
    if (confirm('Are you sure you want to delete this vendor?')) {
      const token = localStorage.getItem('access_token');
      const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

      this.http.delete(`http://127.0.0.1:8000/vendors/${id}`, { headers })
        .subscribe({
          next: () => {
            this.fetchVendors();
            this.fetchAnalytics();
          },
          error: (err) => console.error('Error deleting vendor:', err)
        });
    }
  }

  editVendor(vendor: any): void {
    const dialogRef = this.dialog.open(VendorDialog, {
      width: '400px',
      data: vendor 
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchVendors();
        this.fetchAnalytics();
      }
    });
  }

  logout(): void {
    localStorage.removeItem('access_token');
    this.router.navigate(['/login']);
  }
}