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

// --- UNIQUE POP-UP FOR NOTES ---
@Component({
  selector: 'app-notes-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title style="color: #3f51b5; border-bottom: 1px solid #eee; padding-bottom: 10px; margin: 0 0 15px 0;">Delivery Notes</h2>
    <mat-dialog-content style="padding: 10px 20px 20px 20px; font-size: 15px; line-height: 1.6; min-width: 400px; max-width: 600px; white-space: pre-wrap; font-family: 'Roboto', sans-serif;">
      {{ data.notes }}
    </mat-dialog-content>
    <mat-dialog-actions align="end" style="padding-bottom: 15px; padding-right: 15px;">
      <button mat-raised-button color="primary" mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `
})
export class NotesDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}


// --- EXISTING DELIVERY DIALOG ---
@Component({
  selector: 'app-delivery-dialog',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    MatDialogModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, FormsModule, CommonModule,
    MatDatepickerModule, MatNativeDateModule
  ],
  template: `
    <h2 mat-dialog-title>{{ isEditMode ? 'Edit Delivery' : 'Log New Delivery' }}</h2>
    <mat-dialog-content style="display: flex; flex-direction: column; gap: 15px; padding-top: 10px;">
      
      <div style="display: flex; gap: 16px;">
        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Select Purchase Order</mat-label>
          <mat-select [(ngModel)]="deliveryData.po_id" (selectionChange)="onPOSelect($event.value)" required>
            <mat-option *ngFor="let po of purchaseOrders" [value]="po.po_id">
              {{po.po_number}}
            </mat-option>
          </mat-select>
        </mat-form-field>
        
        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Vendor ID (Auto-filled)</mat-label>
          <input matInput type="number" [(ngModel)]="deliveryData.vendor_id" readonly>
        </mat-form-field>
      </div>

      <div style="display: flex; gap: 16px;">
        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Expected Delivery</mat-label>
          <input matInput [(ngModel)]="deliveryData.expected_delivery_date" readonly placeholder="Select PO first">
        </mat-form-field>

        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Actual Delivery Date</mat-label>
          <input matInput [matDatepicker]="delPicker" [(ngModel)]="deliveryData.delivery_date" (dateChange)="calculateDelay()" readonly (click)="delPicker.open()" placeholder="Pick delivery date">
          <mat-datepicker-toggle matSuffix [for]="delPicker"></mat-datepicker-toggle>
          <mat-datepicker #delPicker></mat-datepicker>
        </mat-form-field>
      </div>

      <div style="display: flex; gap: 16px;">
        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Delay Days</mat-label>
          <input matInput type="number" [(ngModel)]="deliveryData.delay_days" readonly [ngStyle]="{'color': deliveryData.delay_days > 0 ? 'red' : 'green', 'font-weight': 'bold'}">
        </mat-form-field>

        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Delivery Status</mat-label>
          <mat-select [(ngModel)]="deliveryData.delivery_status">
            <mat-option value="On-Time">On-Time</mat-option>
            <mat-option value="Delayed">Delayed</mat-option>
            <mat-option value="Partial">Partial</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <div style="display: flex; gap: 16px;">
        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Damaged Goods (Qty)</mat-label>
          <input matInput type="number" [(ngModel)]="deliveryData.damaged_goods">
        </mat-form-field>
      </div>

      <mat-form-field appearance="outline">
        <mat-label>Delivery Notes</mat-label>
        <textarea matInput [(ngModel)]="deliveryData.delivery_notes" rows="3" placeholder="Example: Packaging was torn, boxes missing..."></textarea>
      </mat-form-field>

    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="saveDelivery()">
        {{ isEditMode ? 'Update' : 'Save' }}
      </button>
    </mat-dialog-actions>
  `
})
export class DeliveryDialog implements OnInit {
  deliveryData: any = {
    po_id: null,
    vendor_id: null,
    delivery_date: null, // YAHAN NULL KAR DIYA HAI TAHA KI KUDH DATE UTHAYE
    expected_delivery_date: null,
    delay_days: 0,
    delivery_status: 'On-Time',
    damaged_goods: 0,
    delivery_notes: ''
  };
  
  purchaseOrders: any[] = [];
  isEditMode = false;

  constructor(
    private dialogRef: MatDialogRef<DeliveryDialog>, 
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data && data.delivery) {
      this.deliveryData = { ...data.delivery };
      if (this.deliveryData.delivery_date) {
        this.deliveryData.delivery_date = new Date(this.deliveryData.delivery_date);
      }
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
    if (selectedPO) {
      this.deliveryData.vendor_id = selectedPO.vendor_id;
      this.deliveryData.expected_delivery_date = selectedPO.expected_delivery_date;
      
      // Agar PO mein pehle se actual date hai, toh wahi uthayega
      if (selectedPO.actual_delivery_date) {
        this.deliveryData.delivery_date = new Date(selectedPO.actual_delivery_date);
      } else {
        this.deliveryData.delivery_date = null; // Warna khali chhod dega
      }

      this.calculateDelay();
    }
  }

  calculateDelay() {
    if (this.deliveryData.delivery_date && this.deliveryData.expected_delivery_date) {
      const actual = new Date(this.deliveryData.delivery_date);
      actual.setHours(0,0,0,0);
      
      const expected = new Date(this.deliveryData.expected_delivery_date);
      expected.setHours(0,0,0,0);
      
      const diffTime = actual.getTime() - expected.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 0) {
        this.deliveryData.delay_days = diffDays;
        this.deliveryData.delivery_status = 'Delayed';
      } else {
        this.deliveryData.delay_days = 0;
        this.deliveryData.delivery_status = 'On-Time';
      }
    } else {
      this.deliveryData.delay_days = 0;
    }
  }

  formatDate(date: any): string | null {
    if (!date) return null;
    const d = new Date(date);
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${d.getFullYear()}-${month}-${day}`;
  }

  saveDelivery() {
    if (!this.deliveryData.po_id || !this.deliveryData.delivery_date) {
      alert("PO and Actual Delivery Date are required.");
      return;
    }

    const payload = { ...this.deliveryData };
    payload.delivery_date = this.formatDate(this.deliveryData.delivery_date);

    if (this.isEditMode) {
      this.http.put(`http://127.0.0.1:8000/deliveries/${payload.delivery_id}`, payload).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => alert('Error updating delivery')
      });
    } else {
      this.http.post('http://127.0.0.1:8000/deliveries', payload).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => alert('Error saving delivery')
      });
    }
  }
}

// --- MAIN DELIVERIES TABLE COMPONENT ---
@Component({
  selector: 'app-deliveries',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, HttpClientModule, CommonModule, MatDialogModule],
  template: `
    <div class="dashboard-container" style="padding: 24px;">
      
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <div>
          <h2 style="margin: 0;">Deliveries Log</h2>
          <p style="margin-top: 5px; color: gray;">Track incoming shipments, delays, and damaged goods.</p>
        </div>
        
        <button mat-raised-button color="primary" (click)="openAddDeliveryDialog()">
          + Log Delivery
        </button>
      </div>

      <div style="overflow-x: auto;">
        <table mat-table [dataSource]="dataSource" class="mat-elevation-z8" style="width: 100%; min-width: 1100px;">
          
          <ng-container matColumnDef="delivery_id">
            <th mat-header-cell *matHeaderCellDef> Del ID </th>
            <td mat-cell *matCellDef="let element"> <strong>{{element.delivery_id}}</strong> </td>
          </ng-container>

          <ng-container matColumnDef="po_id">
            <th mat-header-cell *matHeaderCellDef> PO ID </th>
            <td mat-cell *matCellDef="let element"> {{element.po_id}} </td>
          </ng-container>

          <ng-container matColumnDef="vendor_id">
            <th mat-header-cell *matHeaderCellDef> Vendor ID </th>
            <td mat-cell *matCellDef="let element"> {{element.vendor_id}} </td>
          </ng-container>

          <ng-container matColumnDef="expected_delivery_date">
            <th mat-header-cell *matHeaderCellDef> Expected Date </th>
            <td mat-cell *matCellDef="let element"> {{element.expected_delivery_date}} </td>
          </ng-container>

          <ng-container matColumnDef="delivery_date">
            <th mat-header-cell *matHeaderCellDef> Actual Date </th>
            <td mat-cell *matCellDef="let element"> <strong>{{element.delivery_date}}</strong> </td>
          </ng-container>

          <ng-container matColumnDef="delay_days">
            <th mat-header-cell *matHeaderCellDef> Delay (Days) </th>
            <td mat-cell *matCellDef="let element"> 
              <span [ngStyle]="{'color': element.delay_days > 0 ? 'red' : 'green', 'font-weight': 'bold'}">
                {{element.delay_days}}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="delivery_status">
            <th mat-header-cell *matHeaderCellDef> Status </th>
            <td mat-cell *matCellDef="let element"> 
              <span [ngStyle]="{'color': element.delivery_status === 'On-Time' ? 'green' : element.delivery_status === 'Delayed' ? 'red' : 'orange'}">
                {{element.delivery_status}}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="damaged_goods">
            <th mat-header-cell *matHeaderCellDef> Damaged Qty </th>
            <td mat-cell *matCellDef="let element"> {{element.damaged_goods}} </td>
          </ng-container>

          <ng-container matColumnDef="delivery_notes">
            <th mat-header-cell *matHeaderCellDef style="text-align: center;"> Notes </th>
            <td mat-cell *matCellDef="let element" style="text-align: center;">
              <button *ngIf="element.delivery_notes" 
                      mat-icon-button 
                      color="primary" 
                      title="View Notes"
                      (click)="viewNotes(element.delivery_notes)"
                      style="background: #e8eaf6; border-radius: 50%; width: 35px; height: 35px; line-height: 35px;">
                📄
              </button>
              <span *ngIf="!element.delivery_notes" style="color: #aaa; font-style: italic;">-</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef style="text-align: right;"> Actions </th>
            <td mat-cell *matCellDef="let element" style="text-align: right;">
              <button mat-button color="primary" (click)="openAddDeliveryDialog(element)" style="min-width: 36px; padding: 0;">✏️</button>
              <button mat-button color="warn" (click)="deleteDelivery(element.delivery_id)" style="min-width: 36px; padding: 0;">🗑️</button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </div>
    </div>
  `
})
export class DeliveriesComponent implements OnInit {
  displayedColumns: string[] = [
    'delivery_id', 'po_id', 'vendor_id', 'expected_delivery_date', 'delivery_date', 
    'delay_days', 'delivery_status', 'damaged_goods', 'delivery_notes', 'actions'
  ];
  dataSource = new MatTableDataSource<any>([]);

  constructor(private http: HttpClient, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.fetchDeliveries();
  }

  fetchDeliveries(): void {
    this.http.get<any[]>('http://127.0.0.1:8000/deliveries').subscribe({
      next: (data) => this.dataSource.data = data
    });
  }

  openAddDeliveryDialog(delivery?: any): void {
    const dialogRef = this.dialog.open(DeliveryDialog, { 
      width: '700px',
      data: { delivery: delivery } 
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.fetchDeliveries();
    });
  }

  viewNotes(notes: string): void {
    this.dialog.open(NotesDialog, {
      data: { notes: notes }
    });
  }

  deleteDelivery(id: number): void {
    if (confirm('Are you sure you want to delete this Delivery log?')) {
      this.http.delete(`http://127.0.0.1:8000/deliveries/${id}`).subscribe({
        next: () => this.fetchDeliveries(),
        error: (err) => alert('Error deleting delivery')
      });
    }
  }
}