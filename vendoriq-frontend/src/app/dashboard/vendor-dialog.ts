import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // NgIf, NgClass ke liye

@Component({
  selector: 'app-vendor-dialog',
  standalone: true,
  imports: [
    MatDialogModule, MatButtonModule, MatFormFieldModule, 
    MatInputModule, MatSelectModule, FormsModule, CommonModule
  ],
  template: `
    <!-- Title change hoga mode ke hisaab se -->
    <h2 mat-dialog-title>{{ isEditMode ? 'Edit Vendor' : 'Add New Vendor' }}</h2>
    
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

      <!-- Status Dropdown (Sirf Edit mode me dikhega) -->
      <mat-form-field appearance="outline" *ngIf="isEditMode">
        <mat-label>Status</mat-label>
        <mat-select [(ngModel)]="vendor.status">
          <mat-option value="Active">Active</mat-option>
          <mat-option value="Inactive">Inactive</mat-option>
        </mat-select>
      </mat-form-field>

    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <!-- Button ka text change hoga mode ke hisaab se -->
      <button mat-raised-button color="primary" (click)="saveVendor()">
        {{ isEditMode ? 'Update Vendor' : 'Save Vendor' }}
      </button>
    </mat-dialog-actions>
  `
})
export class VendorDialog {
  isEditMode = false;
  // Default data structure
  vendor: any = { vendor_name: '', category: '', status: 'Active' };

  constructor(
    private dialogRef: MatDialogRef<VendorDialog>,
    private http: HttpClient,
    // MAT_DIALOG_DATA inject karke pichle page ka data receive kar rahe hain
    @Inject(MAT_DIALOG_DATA) public data: any 
  ) {
    // Agar data aaya hai matlab Edit mode hai
    if (this.data) {
      this.isEditMode = true;
      // Object ko copy kar rahe hain taaki save hone se pehle hi table me na dikhe
      this.vendor = { ...this.data }; 
    }
  }

  /**
   * Securely posts or puts vendor data to the backend API.
   */
  saveVendor() {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    if (this.isEditMode) {
      // EDIT: PUT Request
      this.http.put(`http://127.0.0.1:8000/vendors/${this.vendor.vendor_id}`, this.vendor, { headers })
        .subscribe({
          next: () => {
            this.dialogRef.close(true); // Table refresh hogi
          },
          error: (err) => {
            console.error('Error updating vendor:', err);
          }
        });
    } else {
      // ADD: POST Request
      this.http.post('http://127.0.0.1:8000/vendors', this.vendor, { headers })
        .subscribe({
          next: () => {
            this.dialogRef.close(true); // Table refresh hogi
          },
          error: (err) => {
            console.error('Error creating vendor:', err);
          }
        });
    }
  }
}