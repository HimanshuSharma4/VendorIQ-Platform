import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';

interface ActivityLog {
  id?: number;
  timestamp: string;
  user: string;
  action: string;
  module: string;
  severity: string;
  status: string;
}

@Component({
  selector: 'app-activity-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './activity-logs.html',
  styleUrl: './activity-logs.css'
})
export class ActivityLogs implements OnInit {
  searchText = '';
  selectedSeverity = 'All';
  selectedStatus = 'All';

  logs: ActivityLog[] = [];

  // 1. Yahan ChangeDetectorRef inject kiya gaya hai
  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.fetchActivityLogs();
  }

  fetchActivityLogs(): void {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get<any>('http://127.0.0.1:8000/activity-logs', { headers })
      .subscribe({
        next: (data) => {
          // SMART CHECK: Ye backend ke dono formats (list ya dictionary) ko handle kar lega
          const logData = data.items ? data.items : data;
          
          this.logs = Array.isArray(logData) ? logData : [];
          
          // 2. YAHAN UI KO INSTANT REFRESH KARNE KA COMMAND HAI
          this.cdr.detectChanges(); 
        },
        error: (err) => {
          console.error('Error fetching activity logs:', err);
          this.logs = []; 
          this.cdr.detectChanges(); 
        }
      });
  }

  get filteredLogs(): ActivityLog[] {
    const query = this.searchText.trim().toLowerCase();
    
    // Extra safety: ensure this.logs is iterable
    const safeLogs = Array.isArray(this.logs) ? this.logs : [];

    return safeLogs.filter(log => {
      const matchesSearch =
        !query ||
        (log.user && log.user.toLowerCase().includes(query)) ||
        (log.action && log.action.toLowerCase().includes(query)) ||
        (log.module && log.module.toLowerCase().includes(query));

      const matchesSeverity =
        this.selectedSeverity === 'All' ||
        log.severity === this.selectedSeverity;

      const matchesStatus =
        this.selectedStatus === 'All' ||
        log.status === this.selectedStatus;

      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }

  get successfulCount(): number {
    const safeLogs = Array.isArray(this.logs) ? this.logs : [];
    return safeLogs.filter(log => log.status === 'Success').length;
  }

  get warningCount(): number {
    const safeLogs = Array.isArray(this.logs) ? this.logs : [];
    return safeLogs.filter(log => log.severity === 'Warning').length;
  }

  get criticalCount(): number {
    const safeLogs = Array.isArray(this.logs) ? this.logs : [];
    return safeLogs.filter(log => log.severity === 'Critical').length;
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedSeverity = 'All';
    this.selectedStatus = 'All';
  }

  exportCsv(): void {
    const safeLogs = Array.isArray(this.logs) ? this.logs : [];
    if (safeLogs.length === 0) {
      alert("No data to export!");
      return;
    }

    const headers = [
      'Timestamp', 'User', 'Action',
      'Module', 'Severity', 'Status'
    ];

    const escapeCsv = (value: string) =>
      '"' + (value || '').replace(/"/g, '""') + '"';

    const rows = this.filteredLogs.map(log => [
      log.timestamp,
      log.user,
      log.action,
      log.module,
      log.severity,
      log.status
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(escapeCsv).join(','))
      .join('\r\n');

    const blob = new Blob(['\uFEFF' + csv], {
      type: 'text/csv;charset=utf-8;'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'vendoriq-activity-logs.csv';
    link.click();
    URL.revokeObjectURL(url);
  }
}