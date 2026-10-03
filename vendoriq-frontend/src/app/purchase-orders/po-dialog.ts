import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core'; 
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-po-dialog',
  standalone: true,
  providers: [provideNativeDateAdapter()], 
  imports: [
    MatDialogModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, FormsModule, CommonModule,
    MatDatepickerModule, MatNativeDateModule
  ],
  template: `
    <h2 mat-dialog-title>{{ isEditMode ? 'Edit Purchase Order' : 'Create Purchase Order' }}</h2>
    <mat-dialog-content style="display: flex; flex-direction: column; gap: 15px; padding-top: 10px;">
      
      <mat-form-field appearance="outline">
        <mat-label>PO Number</mat-label>
        <input matInput [(ngModel)]="poData.po_number" placeholder="e.g. PO-1001" [disabled]="isEditMode">
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Select Vendor</mat-label>
        <mat-select [(ngModel)]="poData.vendor_id">
          <mat-option *ngFor="let v of vendors" [value]="v.vendor_id">
            {{ v.vendor_name }}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Select Product</mat-label>
        <mat-select [(ngModel)]="poData.product_id">
          <mat-option *ngFor="let p of products" [value]="p.product_id">
            {{ p.product_name }}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <div style="display: flex; gap: 16px;">
        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Quantity</mat-label>
          <input matInput type="number" [(ngModel)]="poData.quantity" (ngModelChange)="calculateTotal()">
        </mat-form-field>

        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Unit Price (₹)</mat-label>
          <input matInput type="number" [(ngModel)]="poData.unit_price" (ngModelChange)="calculateTotal()">
        </mat-form-field>
      </div>

      <mat-form-field appearance="outline">
        <mat-label>Total Amount (₹)</mat-label>
        <input matInput type="number" [(ngModel)]="poData.total_amount" readonly style="background-color: #f5f5f5;">
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Expected Delivery Date</mat-label>
        <input matInput [matDatepicker]="expectedPicker" [(ngModel)]="poData.expected_delivery_date" readonly (click)="expectedPicker.open()" style="cursor: pointer;">
        <mat-datepicker-toggle matIconSuffix [for]="expectedPicker"></mat-datepicker-toggle>
        <mat-datepicker #expectedPicker></mat-datepicker>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Status</mat-label>
        <mat-select [(ngModel)]="poData.order_status">
          <mat-option value="Pending">Pending</mat-option>
          <mat-option value="Approved">Approved</mat-option>
          <mat-option value="Ordered">Ordered</mat-option>
          <mat-option value="In Transit">In Transit</mat-option>
          <mat-option value="Delivered">Delivered</mat-option>
          <mat-option value="Cancelled">Cancelled</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" *ngIf="poData.order_status === 'Delivered' || isEditMode">
        <mat-label>Actual Delivery Date</mat-label>
        <input matInput [matDatepicker]="actualPicker" [(ngModel)]="poData.actual_delivery_date" readonly (click)="actualPicker.open()" style="cursor: pointer;">
        <mat-datepicker-toggle matIconSuffix [for]="actualPicker"></mat-datepicker-toggle>
        <mat-datepicker #actualPicker></mat-datepicker>
      </mat-form-field>

    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="savePO()">
        {{ isEditMode ? 'Update PO' : 'Save PO' }}
      </button>
    </mat-dialog-actions>
  `
})
export class PODialog implements OnInit {
  poData: any = { 
    po_number: '', 
    vendor_id: null,
    product_id: null,
    quantity: null,
    unit_price: null,
    total_amount: null, 
    order_status: 'Pending',
    expected_delivery_date: null,
    actual_delivery_date: null
  };
  
  vendors: any[] = [];
  products: any[] = [];
  isEditMode = false;
  
  constructor(
    private dialogRef: MatDialogRef<PODialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient
  ) {
    if (this.data) {
      this.isEditMode = true;
      this.poData = { ...this.data }; 
    }
  }

  ngOnInit() {
    this.fetchVendors();
    this.fetchProducts();
  }

  fetchVendors() {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    this.http.get<any[]>('http://127.0.0.1:8000/vendors', { headers }).subscribe({
      next: (data) => this.vendors = data,
      error: (err) => console.error('Error fetching vendors:', err)
    });
  }

  fetchProducts() {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    this.http.get<any[]>('http://127.0.0.1:8000/products', { headers }).subscribe({
      next: (data) => this.products = data,
      error: (err) => console.error('Error fetching products:', err)
    });
  }

  calculateTotal() {
    if (this.poData.quantity && this.poData.unit_price) {
      this.poData.total_amount = this.poData.quantity * this.poData.unit_price;
    } else {
      this.poData.total_amount = 0;
    }
  }

  savePO() {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    
    if (this.isEditMode) {
      // PUT API for Update
      this.http.put(`http://127.0.0.1:8000/purchase-orders/${this.poData.po_id}`, this.poData, { headers }).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => {
          console.error(err);
          alert(err.error?.detail || 'Error updating PO');
        }
      });
    } else {
      // POST API for Create
      this.http.post('http://127.0.0.1:8000/purchase-orders', this.poData, { headers }).subscribe({
        next: () => this.dialogRef.close(true), 
        error: (err) => {
          console.error(err);
          alert(err.error?.detail || 'Error creating PO');
        }
      });
    }
  }
}