import { Component, OnInit, Inject } from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common'; 
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
// NAYA IMPORT: DateAdapter provide karne ke liye
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-po-dialog',
  standalone: true,
  providers: [provideNativeDateAdapter()], // <-- YAHI WOH FIX HAI JISSE CALENDAR KHULEGA
  imports: [
    MatDialogModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, FormsModule, CommonModule,
    MatDatepickerModule, MatNativeDateModule
  ],
  template: `
    <h2 mat-dialog-title>{{ isEditMode ? 'Edit Purchase Order' : 'Create Purchase Order' }}</h2>
    <mat-dialog-content style="display: flex; flex-direction: column; gap: 15px; padding-top: 10px;">
      
      <div style="display: flex; gap: 16px;">
        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>PO Number</mat-label>
          <input matInput [(ngModel)]="poData.po_number" placeholder="e.g. PO-1001" required>
        </mat-form-field>
        
        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Created By (User ID)</mat-label>
          <input matInput type="number" [(ngModel)]="poData.created_by">
        </mat-form-field>
      </div>

      <div style="display: flex; gap: 16px;">
        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Select Vendor</mat-label>
          <mat-select [(ngModel)]="poData.vendor_id" required>
            <mat-option *ngFor="let v of vendors" [value]="v.vendor_id">
              ID: {{v.vendor_id}} - {{ v.vendor_name }}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Order Status</mat-label>
          <mat-select [(ngModel)]="poData.order_status">
            <mat-option value="Pending">Pending</mat-option>
            <mat-option value="Approved">Approved</mat-option>
            <mat-option value="Delivered">Delivered</mat-option>
            <mat-option value="Cancelled">Cancelled</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <mat-form-field appearance="outline">
        <mat-label>Select Product</mat-label>
        <mat-select [(ngModel)]="poData.product_id" (selectionChange)="onProductSelect($event.value)" required>
          <mat-option *ngFor="let p of products" [value]="p.product_id">
            ID: {{p.product_id}} - {{ p.product_name }}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <div style="display: flex; gap: 16px;">
        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Quantity</mat-label>
          <input matInput type="number" [(ngModel)]="poData.quantity" (ngModelChange)="calculateTotal()" required>
        </mat-form-field>

        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Unit Price (₹)</mat-label>
          <input matInput type="number" [(ngModel)]="poData.unit_price" readonly>
        </mat-form-field>
      </div>

      <mat-form-field appearance="outline">
        <mat-label>Total Amount (₹)</mat-label>
        <input matInput type="number" [(ngModel)]="poData.total_amount" readonly style="font-weight: bold; color: green;">
      </mat-form-field>

      <!-- FIXED CALENDARS: Readonly lagaya hai taaki type na ho, aur click karne par popup khule -->
      <div style="display: flex; gap: 16px;">
        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Order Date</mat-label>
          <input matInput [matDatepicker]="orderPicker" [(ngModel)]="poData.order_date" required readonly (click)="orderPicker.open()">
          <mat-datepicker-toggle matSuffix [for]="orderPicker"></mat-datepicker-toggle>
          <mat-datepicker #orderPicker></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Expected Delivery</mat-label>
          <input matInput [matDatepicker]="expPicker" [(ngModel)]="poData.expected_delivery_date" [min]="poData.order_date" readonly (click)="expPicker.open()">
          <mat-datepicker-toggle matSuffix [for]="expPicker"></mat-datepicker-toggle>
          <mat-datepicker #expPicker></mat-datepicker>
        </mat-form-field>
      </div>

      <mat-form-field appearance="outline">
        <mat-label>Actual Delivery Date</mat-label>
        <input matInput [matDatepicker]="actPicker" [(ngModel)]="poData.actual_delivery_date" [min]="poData.order_date" readonly (click)="actPicker.open()">
        <mat-datepicker-toggle matSuffix [for]="actPicker"></mat-datepicker-toggle>
        <mat-datepicker #actPicker></mat-datepicker>
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
export class PurchaseOrderDialog implements OnInit {
  poData: any = {
    po_number: '',
    vendor_id: null,
    product_id: null,
    order_date: new Date(), 
    quantity: null,
    unit_price: null,
    total_amount: 0,
    expected_delivery_date: null,
    actual_delivery_date: null,
    order_status: 'Pending',
    created_by: 1
  };
  
  vendors: any[] = [];
  products: any[] = [];
  isEditMode = false;

  constructor(
    private dialogRef: MatDialogRef<PurchaseOrderDialog>, 
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data && data.po) {
      this.poData = { ...data.po };
      
      if (this.poData.order_date) this.poData.order_date = new Date(this.poData.order_date);
      if (this.poData.expected_delivery_date) this.poData.expected_delivery_date = new Date(this.poData.expected_delivery_date);
      if (this.poData.actual_delivery_date) this.poData.actual_delivery_date = new Date(this.poData.actual_delivery_date);
      
      this.isEditMode = true;
    }
  }

  ngOnInit() {
    this.http.get<any[]>('http://127.0.0.1:8000/vendors').subscribe(data => this.vendors = data);
    this.http.get<any[]>('http://127.0.0.1:8000/products').subscribe(data => this.products = data);
  }

  onProductSelect(productId: number) {
    const selectedProduct = this.products.find(p => p.product_id === productId);
    if (selectedProduct) {
      this.poData.unit_price = selectedProduct.unit_price;
      this.calculateTotal();
    }
  }

  calculateTotal() {
    if (this.poData.quantity && this.poData.unit_price) {
      this.poData.total_amount = this.poData.quantity * this.poData.unit_price;
    } else {
      this.poData.total_amount = 0;
    }
  }

  formatDate(date: any): string | null {
    if (!date) return null;
    const d = new Date(date);
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${d.getFullYear()}-${month}-${day}`;
  }

  savePO() {
    if (!this.poData.po_number || !this.poData.vendor_id || !this.poData.product_id || !this.poData.quantity || !this.poData.order_date) {
      alert("Please fill all required fields (PO Number, Vendor, Product, Quantity, Order Date).");
      return;
    }

    const payload = { ...this.poData };
    payload.order_date = this.formatDate(this.poData.order_date);
    payload.expected_delivery_date = this.formatDate(this.poData.expected_delivery_date);
    payload.actual_delivery_date = this.formatDate(this.poData.actual_delivery_date);

    if (this.isEditMode) {
      this.http.put(`http://127.0.0.1:8000/purchase-orders/${payload.po_id}`, payload).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => alert('Error updating PO')
      });
    } else {
      this.http.post('http://127.0.0.1:8000/purchase-orders', payload).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => alert('Error saving PO')
      });
    }
  }
}

@Component({
  selector: 'app-purchase-orders',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, HttpClientModule, CommonModule, MatDialogModule],
  templateUrl: './purchase-orders.html'
})
export class PurchaseOrders implements OnInit {
  displayedColumns: string[] = [
    'po_id', 'po_number', 'vendor_id', 'product_id', 
    'quantity', 'unit_price', 'total_amount', 
    'order_date', 'expected_delivery_date', 'actual_delivery_date', 
    'order_status', 'created_by', 'actions'
  ];
  dataSource = new MatTableDataSource<any>([]);

  constructor(private http: HttpClient, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.fetchPOs();
  }

  fetchPOs(): void {
    this.http.get<any[]>('http://127.0.0.1:8000/purchase-orders').subscribe({
      next: (data) => this.dataSource.data = data
    });
  }

  openAddPODialog(po?: any): void {
    const dialogRef = this.dialog.open(PurchaseOrderDialog, { 
      width: '650px',
      data: { po: po } 
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.fetchPOs();
    });
  }

  deletePO(id: number): void {
    if (confirm('Are you sure you want to delete this PO?')) {
      this.http.delete(`http://127.0.0.1:8000/purchase-orders/${id}`).subscribe({
        next: () => this.fetchPOs(),
        error: (err) => alert('Error deleting PO')
      });
    }
  }
}