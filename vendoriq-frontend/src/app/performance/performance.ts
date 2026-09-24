import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

// --- Add Performance Record Dialog ---
@Component({
  selector: 'app-performance-dialog',
  standalone: true,
  imports: [MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, FormsModule, HttpClientModule, CommonModule],
  template: `
    <h2 mat-dialog-title>Add Performance Record</h2>
    <mat-dialog-content>
      <div style="display: flex; flex-direction: column; gap: 15px; margin-top: 10px;">
        <mat-form-field appearance="outline">
          <mat-label>Vendor Name</mat-label>
          <input matInput [(ngModel)]="recordData.vendor_name">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Quality Rating (out of 5)</mat-label>
          <input matInput type="number" [(ngModel)]="recordData.quality_rating">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Delivery Time (Days)</mat-label>
          <input matInput type="number" [(ngModel)]="recordData.delivery_time_days">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Reliability Score (%)</mat-label>
          <input matInput type="number" [(ngModel)]="recordData.reliability_score">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Review Notes (Optional)</mat-label>
          <input matInput [(ngModel)]="recordData.review_notes">
        </mat-form-field>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="saveRecord()">Submit</button>
    </mat-dialog-actions>
  `
})
export class PerformanceDialog {
  recordData = { vendor_name: '', quality_rating: null, delivery_time_days: null, reliability_score: null, review_notes: '' };

  constructor(private http: HttpClient, public dialogRef: MatDialogRef<PerformanceDialog>) {}

  saveRecord(): void {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.post('http://127.0.0.1:8000/performance', this.recordData, { headers })
      .subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => console.error('Error adding record:', err)
      });
  }
}

// --- Main Performance Page ---
@Component({
  selector: 'app-performance',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, HttpClientModule, MatDialogModule],
  templateUrl: './performance.html',
  styleUrls: ['./performance.css']
})
export class Performance implements OnInit {
  displayedColumns: string[] = ['id', 'vendor_name', 'quality_rating', 'delivery_time_days', 'reliability_score', 'review_notes'];
  dataSource = new MatTableDataSource<any>([]);

  // Live Summary Dashboard metrics
  avgQuality = 0;
  avgReliability = 0;
  totalRecords = 0;

  constructor(private http: HttpClient, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.fetchPerformanceRecords();
  }

  fetchPerformanceRecords(): void {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get<any[]>('http://127.0.0.1:8000/performance', { headers })
      .subscribe({
        next: (data) => {
          this.dataSource.data = data;
          this.totalRecords = data.length;
          
          // Averages dynamically calculate ho rahe hain
          if (data.length > 0) {
            const totalQuality = data.reduce((sum, item) => sum + item.quality_rating, 0);
            const totalReliability = data.reduce((sum, item) => sum + item.reliability_score, 0);
            this.avgQuality = parseFloat((totalQuality / data.length).toFixed(1));
            this.avgReliability = parseFloat((totalReliability / data.length).toFixed(1));
          }
        },
        error: (err) => console.error('Error fetching performance records:', err)
      });
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(PerformanceDialog, { width: '400px' });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchPerformanceRecords(); // UI auto-refresh hogi
      }
    });
  }
}