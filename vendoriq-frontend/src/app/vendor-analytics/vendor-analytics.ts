import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-vendor-analytics',
  standalone: true,
  imports: [CommonModule, HttpClientModule, MatTableModule, MatProgressBarModule, MatButtonModule],
  templateUrl: './vendor-analytics.html',
  styleUrls: ['./vendor-analytics.css']
})
export class VendorAnalytics implements OnInit {
  displayedColumns: string[] = [
    'vendor_id', 'orders', 'on_time_delivery', 'quality_score', 'response_time', 'reliability_score', 'risk_level'
  ];
  dataSource = new MatTableDataSource<any>([]);

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchPerformanceData();
  }

  fetchPerformanceData(): void {
    this.http.get<any[]>('http://127.0.0.1:8000/vendor-performance').subscribe({
      next: (data) => this.dataSource.data = data,
      error: (err) => console.error("Error fetching data", err)
    });
  }

  recalculateScore(): void {
    const vendorId = prompt("Enter Vendor ID to recalculate scores from database:");
    if (vendorId) {
      this.http.post(`http://127.0.0.1:8000/vendor-performance/${vendorId}/calculate`, {}).subscribe({
        next: () => {
          alert('Scores calculated & updated successfully!');
          this.fetchPerformanceData();
        },
        error: () => alert('Error calculating score. Make sure Vendor ID exists.')
      });
    }
  }

  exportToCSV(): void {
    const data = this.dataSource.data;
    if (data.length === 0) return alert("No data to export!");
    
    const headers = ['Vendor ID', 'Completed Orders', 'Total Orders', 'On-Time Delivery (%)', 'Quality Score', 'Avg Response (hrs)', 'Final Score', 'Risk Level'];
    const csvRows = [headers.join(',')];
    
    data.forEach(row => {
      const values = [
        row.vendor_id, row.completed_orders, row.total_orders, 
        row.on_time_delivery_percentage, row.quality_score, 
        row.average_response_time_hours, row.reliability_score, row.risk_level
      ];
      csvRows.push(values.join(','));
    });
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Vendor_Reliability_Report.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  exportToPDF(): void {
    window.print(); // Browser ka native PDF generator open karega
  }

  getRiskStyle(risk: string) {
    if (risk === 'Low') return { 'background-color': '#4caf50' }; 
    if (risk === 'Medium') return { 'background-color': '#ff9800' }; 
    if (risk === 'High') return { 'background-color': '#f44336' }; 
    return { 'background-color': '#9e9e9e' }; 
  }
}