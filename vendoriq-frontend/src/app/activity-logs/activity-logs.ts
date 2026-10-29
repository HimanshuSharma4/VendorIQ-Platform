
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ActivityLog {
  timestamp: string;
  user: string;
  action: string;
  module: string;
  severity: 'Info' | 'Warning' | 'Critical';
  status: 'Success' | 'Failed';
}

@Component({
  selector: 'app-activity-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './activity-logs.html',
  styleUrl: './activity-logs.css'
})
export class ActivityLogs {
  searchText = '';
  selectedSeverity = 'All';
  selectedStatus = 'All';

  // Sample data for the initial page design.
  // Later, we will load real records from FastAPI.
  logs: ActivityLog[] = [
    {
      timestamp: '2026-10-15 09:24:18',
      user: 'Admin User',
      action: 'User logged in',
      module: 'Authentication',
      severity: 'Info',
      status: 'Success'
    },
    {
      timestamp: '2026-10-15 09:17:32',
      user: 'Sneha Verma',
      action: 'Updated vendor profile',
      module: 'Vendors',
      severity: 'Info',
      status: 'Success'
    },
    {
      timestamp: '2026-10-15 09:12:11',
      user: 'Finance Manager',
      action: 'Approved purchase order',
      module: 'Purchase Orders',
      severity: 'Info',
      status: 'Success'
    },
    {
      timestamp: '2026-10-15 08:45:56',
      user: 'Admin User',
      action: 'Changed user role',
      module: 'User Management',
      severity: 'Warning',
      status: 'Success'
    },
    {
      timestamp: '2026-10-15 08:21:03',
      user: 'Raj Kumar',
      action: 'Failed login attempt',
      module: 'Authentication',
      severity: 'Critical',
      status: 'Failed'
    },
    {
      timestamp: '2026-10-15 08:10:29',
      user: 'Anjali Joshi',
      action: 'Created new contract',
      module: 'Contracts',
      severity: 'Info',
      status: 'Success'
    }
  ];

  get filteredLogs(): ActivityLog[] {
    const query = this.searchText.trim().toLowerCase();

    return this.logs.filter(log => {
      const matchesSearch =
        !query ||
        log.user.toLowerCase().includes(query) ||
        log.action.toLowerCase().includes(query) ||
        log.module.toLowerCase().includes(query);

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
    return this.logs.filter(log => log.status === 'Success').length;
  }

  get warningCount(): number {
    return this.logs.filter(log => log.severity === 'Warning').length;
  }

  get criticalCount(): number {
    return this.logs.filter(log => log.severity === 'Critical').length;
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedSeverity = 'All';
    this.selectedStatus = 'All';
  }

  exportCsv(): void {
    const headers = [
      'Timestamp', 'User', 'Action',
      'Module', 'Severity', 'Status'
    ];

    const escapeCsv = (value: string) =>
      '"' + value.replace(/"/g, '""') + '"';

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
