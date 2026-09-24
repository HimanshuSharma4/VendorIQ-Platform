import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

// --- Add Procurement Popup Dialog ---
@Component({
  selector: 'app-procurement-dialog',
  standalone: true,
  imports: [MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, FormsModule, HttpClientModule, CommonModule],
  template: `
    <h2 mat-dialog-title>New Procurement Request</h2>
    <mat-dialog-content>
      <div style="display: flex; flex-direction: column; gap: 15px; margin-top: 10px;">
        <mat-form-field appearance="outline">
          <mat-label>Item Description</mat-label>
          <input matInput [(ngModel)]="requestData.description">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Vendor Name</mat-label>
          <input matInput [(ngModel)]="requestData.vendor_name">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Amount (₹)</mat-label>
          <input matInput type="number" [(ngModel)]="requestData.amount">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Status</mat-label>
          <mat-select [(ngModel)]="requestData.status">
            <mat-option value="Pending">Pending</mat-option>
            <mat-option value="Approved">Approved</mat-option>
            <mat-option value="Ordered">Ordered</mat-option>
            <mat-option value="Delivered">Delivered</mat-option>
            <mat-option value="Completed">Completed</mat-option>
            <mat-option value="Cancelled">Cancelled</mat-option>
          </mat-select>
        </mat-form-field>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="saveRequest()">Submit</button>
    </mat-dialog-actions>
  `
})
export class ProcurementDialog {
  requestData = { description: '', vendor_name: '', amount: null, status: 'Pending' };

  constructor(private http: HttpClient, public dialogRef: MatDialogRef<ProcurementDialog>) {}

  saveRequest(): void {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.post('http://127.0.0.1:8000/procurements', this.requestData, { headers })
      .subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => console.error('Error creating request:', err)
      });
  }
}

// --- Main Procurement Page ---
@Component({
  selector: 'app-procurement',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, HttpClientModule, MatDialogModule],
  templateUrl: './procurement.html',
  styleUrls: ['./procurement.css']
})
export class Procurement implements OnInit {
  displayedColumns: string[] = ['id', 'description', 'vendor_name', 'amount', 'status'];
  dataSource = new MatTableDataSource<any>([]);

  // Live Dashboard Counters updated to new statuses
  pendingCount = 0;
  approvedCount = 0;
  orderedCount = 0;

  constructor(private http: HttpClient, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.fetchProcurements();
  }

  fetchProcurements(): void {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get<any[]>('http://127.0.0.1:8000/procurements', { headers })
      .subscribe({
        next: (data) => {
          this.dataSource.data = data;
          // Calculate live status counts
          this.pendingCount = data.filter(d => d.status === 'Pending').length;
          this.approvedCount = data.filter(d => d.status === 'Approved').length;
          this.orderedCount = data.filter(d => d.status === 'Ordered').length;
        },
        error: (err) => console.error('Error fetching procurements:', err)
      });
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(ProcurementDialog, { width: '400px' });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchProcurements(); // Refresh table & cards after adding
      }
    });
  }
}