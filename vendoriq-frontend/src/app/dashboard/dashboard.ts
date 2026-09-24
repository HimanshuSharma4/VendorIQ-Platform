import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'] 
})
export class Dashboard implements OnInit {
  stats = {
    total_vendors: 0,
    active_vendors: 0,
    total_purchase_orders: 0,
    total_approved_spend: 0
  };

  // ChangeDetectorRef ko inject kiya hai
  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.fetchDashboardAnalytics();
  }

  fetchDashboardAnalytics(): void {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get<any>('http://127.0.0.1:8000/analytics', { headers })
      .subscribe({
        next: (data) => {
          this.stats = data;
          // Ye line Angular ko batati hai ki data aa gaya hai, abhi ke abhi screen update karo
          this.cdr.detectChanges(); 
        },
        error: (err) => console.error('Error fetching dashboard analytics:', err)
      });
  }
}