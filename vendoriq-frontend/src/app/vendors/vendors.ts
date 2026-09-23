import { Component, OnInit, Inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

// --- Vendor Add & Edit Karne Wala Pop-up Dialog ---
@Component({
  selector: 'app-vendor-dialog',
  standalone: true,
  imports: [MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, FormsModule, HttpClientModule, CommonModule],
  template: `
    <h2 mat-dialog-title>{{ isEditMode ? 'Edit Vendor' : 'Add New Vendor' }}</h2>
    <mat-dialog-content>
      <div style="display: flex; flex-direction: column; gap: 15px; margin-top: 10px;">
        <mat-form-field appearance="outline">
          <mat-label>Vendor Name</mat-label>
          <input matInput [(ngModel)]="vendorData.vendor_name">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Category</mat-label>
          <input matInput [(ngModel)]="vendorData.category">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Status</mat-label>
          <mat-select [(ngModel)]="vendorData.status">
            <mat-option value="Active">Active</mat-option>
            <mat-option value="Inactive">Inactive</mat-option>
          </mat-select>
        </mat-form-field>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="saveVendor()">
        {{ isEditMode ? 'Update' : 'Save' }}
      </button>
    </mat-dialog-actions>
  `
})
export class VendorDialog {
  vendorData: any = { vendor_name: '', category: '', status: 'Active' };
  isEditMode: boolean = false;

  constructor(
    private http: HttpClient, 
    public dialogRef: MatDialogRef<VendorDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any // Yahan hum table se bheja hua data catch karte hain
  ) {
    if (data) {
      this.isEditMode = true;
      this.vendorData = { ...data }; // Agar edit kar rahe hain, toh form me pehle se data daal do
    }
  }

  saveVendor(): void {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    if (this.isEditMode) {
      // Edit ke liye PUT request
      this.http.put(`http://127.0.0.1:8000/vendors/${this.vendorData.vendor_id}`, this.vendorData, { headers })
        .subscribe({
          next: () => this.dialogRef.close(true),
          error: (err) => console.error('Error updating vendor:', err)
        });
    } else {
      // Naye vendor ke liye POST request
      this.http.post('http://127.0.0.1:8000/vendors', this.vendorData, { headers })
        .subscribe({
          next: () => this.dialogRef.close(true),
          error: (err) => console.error('Error creating vendor:', err)
        });
    }
  }
}

// --- Main Vendor Page Component ---
@Component({
  selector: 'app-vendors',
  standalone: true,
  imports: [MatTableModule, HttpClientModule, CommonModule, MatButtonModule, MatDialogModule],
  templateUrl: './vendors.html',
  styleUrls: ['./vendors.css']
})
export class VendorsComponent implements OnInit {
  displayedColumns: string[] = ['id', 'vendor_name', 'category', 'status', 'actions'];
  dataSource = new MatTableDataSource<any>([]);

  constructor(private http: HttpClient, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.fetchVendors();
  }

  fetchVendors(): void {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get<any[]>('http://127.0.0.1:8000/vendors', { headers })
      .subscribe({
        next: (data) => this.dataSource.data = data,
        error: (err) => console.error('Error fetching vendors:', err)
      });
  }

  openAddVendorDialog(): void {
    const dialogRef = this.dialog.open(VendorDialog, { width: '400px' });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchVendors();
      }
    });
  }

  editVendor(vendor: any): void {
    // Ab yahan alert nahi balki asli dialog khulega
    const dialogRef = this.dialog.open(VendorDialog, { 
      width: '400px',
      data: vendor // Humne click kiye gaye vendor ka poora data form ko bhej diya
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchVendors(); // Update hone ke baad table refresh
      }
    });
  }

  deleteVendor(vendorId: number): void {
    if (confirm('Are you sure you want to delete this vendor?')) {
      const token = localStorage.getItem('access_token');
      const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

      this.http.delete(`http://127.0.0.1:8000/vendors/${vendorId}`, { headers })
        .subscribe({
          next: () => this.fetchVendors(),
          error: (err) => console.error('Error deleting vendor:', err)
        });
    }
  }
}