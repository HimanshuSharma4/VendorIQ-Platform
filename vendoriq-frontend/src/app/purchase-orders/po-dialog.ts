import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-po-dialog',
  standalone: true,
  imports: [
    MatDialogModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, FormsModule, CommonModule
  ],
  template: `
    <h2 mat-dialog-title>Create Purchase Order</h2>
    <mat-dialog-content style="display: flex; flex-direction: column; gap: 15px; padding-top: 10px;">
      
      <mat-form-field appearance="outline">
        <mat-label>PO Number</mat-label>
        <input matInput [(ngModel)]="poData.po_number" placeholder="e.g. PO-1001">
      </mat-form-field>

      <!-- Vendor Dropdown (Database se fetch hoga) -->
      <mat-form-field appearance="outline">
        <mat-label>Select Vendor</mat-label>
        <mat-select [(ngModel)]="poData.vendor_id">
          <mat-option *ngFor="let v of vendors" [value]="v.vendor_id">
            {{ v.vendor_name }}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Total Amount (₹)</mat-label>
        <input matInput type="number" [(ngModel)]="poData.total_amount" placeholder="e.g. 50000">
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Status</mat-label>
        <mat-select [(ngModel)]="poData.status">
          <mat-option value="Pending">Pending</mat-option>
          <mat-option value="Approved">Approved</mat-option>
          <mat-option value="Delivered">Delivered</mat-option>
        </mat-select>
      </mat-form-field>

    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="savePO()">Save PO</button>
    </mat-dialog-actions>
  `
})
export class PODialog implements OnInit {
  poData = { po_number: '', vendor_id: null, total_amount: null, status: 'Pending' };
  vendors: any[] = [];

  constructor(
    private dialogRef: MatDialogRef<PODialog>,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.fetchVendors();
  }

  // Dropdown ke liye Vendors mangwana
  fetchVendors() {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    this.http.get<any[]>('http://127.0.0.1:8000/vendors', { headers }).subscribe({
      next: (data) => this.vendors = data,
      error: (err) => console.error('Error fetching vendors:', err)
    });
  }

  // PO ko database me save karna
  savePO() {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    
    this.http.post('http://127.0.0.1:8000/purchase-orders', this.poData, { headers }).subscribe({
      next: () => this.dialogRef.close(true), // Success pe true bhejo
      error: (err) => {
        console.error(err);
        alert(err.error?.detail || 'Error creating PO');
      }
    });
  }
}