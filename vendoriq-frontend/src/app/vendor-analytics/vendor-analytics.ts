import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { BaseChartDirective } from 'ng2-charts'; 
import { ChartConfiguration, ChartType } from 'chart.js';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-vendor-analytics',
  standalone: true,
  imports: [CommonModule, HttpClientModule, BaseChartDirective, FormsModule], 
  templateUrl: './vendor-analytics.html',
  styleUrls: ['./vendor-analytics.css']
})
export class VendorAnalytics implements OnInit {
  vendors: any[] = [];
  selectedVendorId: number | null = null;
  scoreData: any = null;

  isPageLoading: boolean = true; 
  isChartLoading: boolean = false;

  public radarChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false, 
    layout: {
      padding: 30 
    },
    scales: {
      r: {
        angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        pointLabels: { color: '#a0a5ba', font: { size: 14 } },
        min: 0, 
        max: 30, 
        ticks: { display: false }
      }
    },
    plugins: {
      legend: { labels: { color: 'white' } }
    }
  };
  public radarChartLabels: string[] = ['Quality (30)', 'Delivery (30)', 'Compliance (20)', 'PO Success (20)'];
  public radarChartData: ChartConfiguration['data'] = {
    datasets: [{ data: [], label: 'Metrics Breakdown' }]
  };
  public radarChartType: ChartType = 'radar';

  // Constructor me ChangeDetectorRef add kiya
  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.fetchVendors();
  }

  fetchVendors(): void {
    this.isPageLoading = true;
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get<any>('http://127.0.0.1:8000/vendors', { headers }).subscribe({
      next: (data) => {
        this.vendors = Array.isArray(data) ? data : (data.items || data.data || []);
        this.isPageLoading = false;
        this.cdr.detectChanges(); // UI Update Force kiya
      },
      error: (err) => {
        console.error('Error fetching vendors', err);
        this.isPageLoading = false; 
        this.cdr.detectChanges(); // UI Update Force kiya
      }
    });
  }

  fetchVendorScore(): void {
    if (!this.selectedVendorId) return;

    this.isChartLoading = true; 
    this.scoreData = null; 

    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get<any>(`http://127.0.0.1:8000/vendors/${this.selectedVendorId}/reliability-score`, { headers })
      .subscribe({
        next: (data) => {
          this.scoreData = data;
          this.radarChartData = {
            labels: this.radarChartLabels,
            datasets: [
              {
                data: [
                  data.metrics_breakdown.quality_points,
                  data.metrics_breakdown.delivery_points,
                  data.metrics_breakdown.compliance_points,
                  data.metrics_breakdown.history_points
                ],
                label: 'Vendor Performance',
                backgroundColor: 'rgba(74, 58, 255, 0.4)',
                borderColor: '#4a3aff',
                pointBackgroundColor: '#fff',
                pointBorderColor: '#4a3aff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#4a3aff',
                fill: true
              }
            ]
          };
          this.isChartLoading = false;
          this.cdr.detectChanges(); // UI Update Force kiya
        },
        error: (err) => {
          console.error('Error fetching score', err);
          this.isChartLoading = false; 
          this.cdr.detectChanges(); // UI Update Force kiya
        }
      });
  }
}