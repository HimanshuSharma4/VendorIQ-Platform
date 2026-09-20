import { Component } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-vendor-dialog',
  standalone: true,
  imports: [
    MatDialogModule, MatButtonModule, MatFormFieldModule, 
    MatInputModule, MatSelectModule, FormsModule
  ],
  template: `
    <h2 mat-dialog-title>Add New Vendor</h2>
    <mat-dialog-content style="display: flex; flex-direction: column; gap: 15px; padding-top: 10px;">
      
      <!-- Vendor Name Input -->
      <mat-form-field appearance="outline">
        <mat-label>Vendor Name</mat-label>
        <input matInput [(ngModel)]="vendor.vendor_name" placeholder="Enter company name">
      </mat-form-field>

      <!-- Category Dropdown -->
      <mat-form-field appearance="outline">
        <mat-label>Category</mat-label>
        <mat-select [(ngModel)]="vendor.category">
          <mat-option value="IT">IT</mat-option>
          <mat-option value="Hardware">Hardware</mat-option>
          <mat-option value="Logistics">Logistics</mat-option>
          <mat-option value="Stationery">Stationery</mat-option>
        </mat-select>
      </mat-form-field>

    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="saveVendor()">Save Vendor</button>
    </mat-dialog-actions>
  `
})
export class VendorDialog {
  // Default data structure
  vendor = { vendor_name: '', category: '', status: 'Active' };

  constructor(
    private dialogRef: MatDialogRef<VendorDialog>,
    private http: HttpClient
  ) {}

  /**
   * Securely posts new vendor data to the backend API.
   */
  saveVendor() {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.post('http://127.0.0.1:8000/vendors', this.vendor, { headers })
      .subscribe({
        next: () => {
          // Success hone par dialog band karke true signal bhejega
          this.dialogRef.close(true); 
        },
        error: (err) => {
          console.error('Error creating vendor:', err);
        }
      });
  }
}