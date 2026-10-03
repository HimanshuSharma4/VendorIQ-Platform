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

@Component({
  selector: 'app-product-dialog',
  standalone: true,
  imports: [
    MatDialogModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, FormsModule, CommonModule
  ],
  template: `
    <h2 mat-dialog-title>{{ isEditMode ? 'Edit Product' : 'Add New Product' }}</h2>
    <mat-dialog-content style="display: flex; flex-direction: column; gap: 15px; padding-top: 10px;">
      
      <mat-form-field appearance="outline">
        <mat-label>Select Vendor</mat-label>
        <mat-select [(ngModel)]="productData.vendor_id" required>
          <mat-option *ngFor="let v of vendors" [value]="v.vendor_id">
            ID: {{v.vendor_id}} - {{ v.vendor_name }}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <div style="display: flex; gap: 16px;">
        <mat-form-field appearance="outline" style="flex: 2;">
          <mat-label>Product Name</mat-label>
          <input matInput [(ngModel)]="productData.product_name" placeholder="e.g. Server Rack">
        </mat-form-field>

        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Category</mat-label>
          <input matInput [(ngModel)]="productData.category" placeholder="e.g. Hardware">
        </mat-form-field>
      </div>

      <div style="display: flex; gap: 16px;">
        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Unit Price (₹)</mat-label>
          <input matInput type="number" [(ngModel)]="productData.unit_price">
        </mat-form-field>

        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Stock Unit</mat-label>
          <input matInput [(ngModel)]="productData.stock_unit" placeholder="e.g. Pieces">
        </mat-form-field>
      </div>

      <div style="display: flex; gap: 16px;">
        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Lead Time (Days)</mat-label>
          <input matInput type="number" [(ngModel)]="productData.lead_time_days">
        </mat-form-field>

        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Warranty (Months)</mat-label>
          <input matInput type="number" [(ngModel)]="productData.warranty_months">
        </mat-form-field>
      </div>

    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="saveProduct()">
        {{ isEditMode ? 'Update' : 'Save' }}
      </button>
    </mat-dialog-actions>
  `
})
export class ProductDialog implements OnInit {
  productData: any = {
    vendor_id: null,
    product_name: '',
    category: '',
    unit_price: null,
    stock_unit: 'Pieces',
    lead_time_days: 7,
    warranty_months: 12
  };
  vendors: any[] = [];
  isEditMode = false;

  constructor(
    private dialogRef: MatDialogRef<ProductDialog>, 
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // Agar edit ke liye data aaya hai, toh usko form me fill kar do
    if (data && data.product) {
      this.productData = { ...data.product };
      this.isEditMode = true;
    }
  }

  ngOnInit() {
    this.http.get<any[]>('http://127.0.0.1:8000/vendors').subscribe({
      next: (data) => this.vendors = data
    });
  }

  saveProduct() {
    if (this.isEditMode) {
      this.http.put(`http://127.0.0.1:8000/products/${this.productData.product_id}`, this.productData).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => alert('Error updating product')
      });
    } else {
      this.http.post('http://127.0.0.1:8000/products', this.productData).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => alert('Error saving product')
      });
    }
  }
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, HttpClientModule, CommonModule, MatDialogModule],
  templateUrl: './products.html'
})
export class Products implements OnInit {
  // Yahan 'actions' column add kiya gaya hai
  displayedColumns: string[] = ['product_id', 'vendor_id', 'product_name', 'category', 'unit_price', 'stock_unit', 'lead_time', 'warranty', 'actions'];
  dataSource = new MatTableDataSource<any>([]);

  constructor(private http: HttpClient, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.fetchProducts();
  }

  fetchProducts(): void {
    this.http.get<any[]>('http://127.0.0.1:8000/products').subscribe({
      next: (data) => this.dataSource.data = data
    });
  }

  openAddProductDialog(product?: any): void {
    const dialogRef = this.dialog.open(ProductDialog, { 
      width: '600px',
      data: { product: product } // Product data bhej rahe hain (agar edit mode hai)
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.fetchProducts();
    });
  }

  deleteProduct(id: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.http.delete(`http://127.0.0.1:8000/products/${id}`).subscribe({
        next: () => this.fetchProducts(),
        error: (err) => alert('Error deleting product')
      });
    }
  }
}