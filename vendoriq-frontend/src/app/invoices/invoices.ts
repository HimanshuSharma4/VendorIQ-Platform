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
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-invoice-dialog',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    MatDialogModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, FormsModule, CommonModule,
    MatDatepickerModule, MatNativeDateModule
  ],
  template: `
    <h2 mat-dialog-title>{{ isEditMode ? 'Edit Invoice' : 'Create New Invoice' }}</h2>
    <mat-dialog-content style="display: flex; flex-direction: column; gap: 15px; padding-top: 10px;">
      
      <div style="display: flex; gap: 16px;">
        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Invoice Number</mat-label>
          <input matInput [(ngModel)]="invoiceData.invoice_number" required placeholder="INV-2026-001">
        </mat-form-field>

        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Select Purchase Order</mat-label>
          <mat-select [(ngModel)]="invoiceData.po_id" (selectionChange)="onPOSelect($event.value)" required>
            <mat-option *ngFor="let po of purchaseOrders" [value]="po.po_id">
              {{po.po_number}} (Amt: ₹{{po.total_amount}})
            </mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <div style="display: flex; gap: 16px;">
        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Vendor ID (Auto-filled)</mat-label>
          <input matInput type="number" [(ngModel)]="invoiceData.vendor_id" readonly>
        </mat-form-field>

        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Invoice Amount (₹)</mat-label>
          <input matInput type="number" [(ngModel)]="invoiceData.invoice_amount" style="font-weight: bold; color: #1976d2;" required>
        </mat-form-field>
      </div>

      <div style="display: flex; gap: 16px;">
        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Invoice Date</mat-label>
          <input matInput [matDatepicker]="invPicker" [(ngModel)]="invoiceData.invoice_date" readonly (click)="invPicker.open()">
          <mat-datepicker-toggle matSuffix [for]="invPicker"></mat-datepicker-toggle>
          <mat-datepicker #invPicker></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Due Date</mat-label>
          <input matInput [matDatepicker]="duePicker" [(ngModel)]="invoiceData.due_date" readonly (click)="duePicker.open()">
          <mat-datepicker-toggle matSuffix [for]="duePicker"></mat-datepicker-toggle>
          <mat-datepicker #duePicker></mat-datepicker>
        </mat-form-field>
      </div>

      <div style="display: flex; gap: 16px;">
        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Payment Status</mat-label>
          <mat-select [(ngModel)]="invoiceData.payment_status">
            <mat-option value="Pending">Pending</mat-option>
            <mat-option value="Paid">Paid</mat-option>
            <mat-option value="Overdue">Overdue</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" style="flex: 1;" *ngIf="invoiceData.payment_status === 'Paid'">
          <mat-label>Payment Date</mat-label>
          <input matInput [matDatepicker]="payPicker" [(ngModel)]="invoiceData.payment_date" readonly (click)="payPicker.open()">
          <mat-datepicker-toggle matSuffix [for]="payPicker"></mat-datepicker-toggle>
          <mat-datepicker #payPicker></mat-datepicker>
        </mat-form-field>
      </div>

    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="saveInvoice()">
        {{ isEditMode ? 'Update' : 'Save' }}
      </button>
    </mat-dialog-actions>
  `
})
export class InvoiceDialog implements OnInit {
  invoiceData: any = {
    po_id: null,
    vendor_id: null,
    invoice_number: '',
    invoice_date: null,
    due_date: null,
    invoice_amount: 0,
    payment_date: null,
    payment_status: 'Pending'
  };
  
  purchaseOrders: any[] = [];
  isEditMode = false;

  constructor(
    private dialogRef: MatDialogRef<InvoiceDialog>, 
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data && data.invoice) {
      this.invoiceData = { ...data.invoice };
      if (this.invoiceData.invoice_date) this.invoiceData.invoice_date = new Date(this.invoiceData.invoice_date);
      if (this.invoiceData.due_date) this.invoiceData.due_date = new Date(this.invoiceData.due_date);
      if (this.invoiceData.payment_date) this.invoiceData.payment_date = new Date(this.invoiceData.payment_date);
      this.isEditMode = true;
    }
  }

  ngOnInit() {
    this.http.get<any[]>('http://127.0.0.1:8000/purchase-orders').subscribe(data => {
      this.purchaseOrders = data;
    });
  }

  onPOSelect(poId: number) {
    const selectedPO = this.purchaseOrders.find(po => po.po_id === poId);
    if (selectedPO && !this.isEditMode) {
      this.invoiceData.vendor_id = selectedPO.vendor_id;
      this.invoiceData.invoice_amount = selectedPO.total_amount;
    }
  }

  formatDate(date: any): string | null {
    if (!date) return null;
    const d = new Date(date);
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${d.getFullYear()}-${month}-${day}`;
  }

  saveInvoice() {
    if (!this.invoiceData.po_id || !this.invoiceData.invoice_number || !this.invoiceData.invoice_date || !this.invoiceData.due_date) {
      alert("Please fill all required fields.");
      return;
    }

    const payload = { ...this.invoiceData };
    payload.invoice_date = this.formatDate(this.invoiceData.invoice_date);
    payload.due_date = this.formatDate(this.invoiceData.due_date);
    payload.payment_date = this.invoiceData.payment_status === 'Paid' ? this.formatDate(this.invoiceData.payment_date) : null;

    if (this.isEditMode) {
      this.http.put(`http://127.0.0.1:8000/invoices/${payload.invoice_id}`, payload).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => alert('Error updating invoice')
      });
    } else {
      this.http.post('http://127.0.0.1:8000/invoices', payload).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => alert('Error saving invoice')
      });
    }
  }
}

// --- MAIN INVOICES TABLE COMPONENT ---
@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, HttpClientModule, CommonModule, MatDialogModule],
  template: `
    <div class="dashboard-container" style="padding: 24px;">
      
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <div>
          <h2 style="margin: 0;">Invoices & Payments</h2>
          <p style="margin-top: 5px; color: gray;">Track billing, due dates, and payment status.</p>
        </div>
        
        <button mat-raised-button color="primary" (click)="openAddInvoiceDialog()">
          + Add Invoice
        </button>
      </div>

      <div style="overflow-x: auto;">
        <table mat-table [dataSource]="dataSource" class="mat-elevation-z8" style="width: 100%; min-width: 1100px;">
          
          <ng-container matColumnDef="invoice_number">
            <th mat-header-cell *matHeaderCellDef> Invoice Number </th>
            <td mat-cell *matCellDef="let element"> <strong>{{element.invoice_number}}</strong> </td>
          </ng-container>

          <ng-container matColumnDef="po_id">
            <th mat-header-cell *matHeaderCellDef> PO ID </th>
            <td mat-cell *matCellDef="let element"> {{element.po_id}} </td>
          </ng-container>

          <ng-container matColumnDef="vendor_id">
            <th mat-header-cell *matHeaderCellDef> Vendor ID </th>
            <td mat-cell *matCellDef="let element"> {{element.vendor_id}} </td>
          </ng-container>

          <ng-container matColumnDef="invoice_amount">
            <th mat-header-cell *matHeaderCellDef> Amount (₹) </th>
            <td mat-cell *matCellDef="let element" style="font-weight: bold;"> ₹{{element.invoice_amount}} </td>
          </ng-container>

          <ng-container matColumnDef="invoice_date">
            <th mat-header-cell *matHeaderCellDef> Invoice Date </th>
            <td mat-cell *matCellDef="let element"> {{element.invoice_date}} </td>
          </ng-container>

          <ng-container matColumnDef="due_date">
            <th mat-header-cell *matHeaderCellDef> Due Date </th>
            <td mat-cell *matCellDef="let element"> <strong>{{element.due_date}}</strong> </td>
          </ng-container>

          <ng-container matColumnDef="payment_date">
            <th mat-header-cell *matHeaderCellDef> Payment Date </th>
            <td mat-cell *matCellDef="let element"> {{element.payment_date || '-'}} </td>
          </ng-container>

          <ng-container matColumnDef="payment_status">
            <th mat-header-cell *matHeaderCellDef> Status </th>
            <td mat-cell *matCellDef="let element"> 
              <span [ngStyle]="{'color': element.payment_status === 'Paid' ? 'green' : element.payment_status === 'Overdue' ? 'red' : 'orange'}">
                {{element.payment_status}}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef style="text-align: right;"> Actions </th>
            <td mat-cell *matCellDef="let element" style="text-align: right;">
              <button mat-button color="primary" (click)="openAddInvoiceDialog(element)" style="min-width: 36px; padding: 0;">✏️</button>
              <button mat-button color="warn" (click)="deleteInvoice(element.invoice_id)" style="min-width: 36px; padding: 0;">🗑️</button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </div>
    </div>
  `
})
export class InvoicesComponent implements OnInit {
  displayedColumns: string[] = [
    'invoice_number', 'po_id', 'vendor_id', 'invoice_amount', 
    'invoice_date', 'due_date', 'payment_date', 'payment_status', 'actions'
  ];
  dataSource = new MatTableDataSource<any>([]);

  constructor(private http: HttpClient, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.fetchInvoices();
  }

  fetchInvoices(): void {
    this.http.get<any[]>('http://127.0.0.1:8000/invoices').subscribe({
      next: (data) => this.dataSource.data = data
    });
  }

  openAddInvoiceDialog(invoice?: any): void {
    const dialogRef = this.dialog.open(InvoiceDialog, { 
      width: '700px',
      data: { invoice: invoice } 
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.fetchInvoices();
    });
  }

  deleteInvoice(id: number): void {
    if (confirm('Are you sure you want to delete this Invoice?')) {
      this.http.delete(`http://127.0.0.1:8000/invoices/${id}`).subscribe({
        next: () => this.fetchInvoices(),
        error: (err) => alert('Error deleting invoice')
      });
    }
  }
}