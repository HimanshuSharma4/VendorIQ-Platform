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

// --- UNIQUE POP-UP FOR REMARKS ---
@Component({
  selector: 'app-remarks-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title style="color: #3f51b5; border-bottom: 1px solid #eee; padding-bottom: 10px; margin: 0 0 15px 0;">Inspection Remarks</h2>
    <mat-dialog-content style="padding: 10px 20px 20px 20px; font-size: 15px; line-height: 1.6; min-width: 400px; max-width: 600px; white-space: pre-wrap; font-family: 'Roboto', sans-serif;">
      {{ data.remarks }}
    </mat-dialog-content>
    <mat-dialog-actions align="end" style="padding-bottom: 15px; padding-right: 15px;">
      <button mat-raised-button color="primary" mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `
})
export class RemarksDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}

// --- INSPECTION DIALOG ---
@Component({
  selector: 'app-inspection-dialog',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    MatDialogModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, FormsModule, CommonModule,
    MatDatepickerModule, MatNativeDateModule
  ],
  template: `
    <h2 mat-dialog-title>{{ isEditMode ? 'Edit Inspection' : 'Log Quality Inspection' }}</h2>
    <mat-dialog-content style="display: flex; flex-direction: column; gap: 15px; padding-top: 10px;">
      
      <div style="display: flex; gap: 16px;">
        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Select Purchase Order</mat-label>
          <mat-select [(ngModel)]="inspectionData.po_id" (selectionChange)="onPOSelect($event.value)" required>
            <mat-option *ngFor="let po of purchaseOrders" [value]="po.po_id">
              PO #{{po.po_number}}
            </mat-option>
          </mat-select>
        </mat-form-field>
        
        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Vendor ID (Auto-filled)</mat-label>
          <input matInput type="number" [(ngModel)]="inspectionData.vendor_id" readonly>
        </mat-form-field>
      </div>

      <div style="display: flex; gap: 16px;">
        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Inspection Date</mat-label>
          <input matInput [matDatepicker]="insPicker" [(ngModel)]="inspectionData.inspection_date" readonly (click)="insPicker.open()">
          <mat-datepicker-toggle matSuffix [for]="insPicker"></mat-datepicker-toggle>
          <mat-datepicker #insPicker></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Inspected By (User ID)</mat-label>
          <input matInput type="number" [(ngModel)]="inspectionData.inspected_by" placeholder="e.g. 1">
        </mat-form-field>
      </div>

      <div style="display: flex; gap: 16px;">
        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Quality Score (0-100)</mat-label>
          <input matInput type="number" [(ngModel)]="inspectionData.quality_score" min="0" max="100" [ngStyle]="{'color': inspectionData.quality_score < 70 ? 'red' : 'green', 'font-weight': 'bold'}">
        </mat-form-field>

        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Defective Quantity</mat-label>
          <input matInput type="number" [(ngModel)]="inspectionData.defective_quantity">
        </mat-form-field>
      </div>

      <mat-form-field appearance="outline">
        <mat-label>Inspection Remarks</mat-label>
        <textarea matInput [(ngModel)]="inspectionData.remarks" rows="3" placeholder="Add any comments or observations..."></textarea>
      </mat-form-field>

    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="saveInspection()">
        {{ isEditMode ? 'Update' : 'Save' }}
      </button>
    </mat-dialog-actions>
  `
})
export class InspectionDialog implements OnInit {
  inspectionData: any = {
    po_id: null,
    vendor_id: null,
    inspection_date: null,
    quality_score: 100,
    defective_quantity: 0,
    remarks: '',
    inspected_by: 1
  };
  
  purchaseOrders: any[] = [];
  isEditMode = false;

  constructor(
    private dialogRef: MatDialogRef<InspectionDialog>, 
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data && data.inspection) {
      this.inspectionData = { ...data.inspection };
      if (this.inspectionData.inspection_date) {
        this.inspectionData.inspection_date = new Date(this.inspectionData.inspection_date);
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
      this.inspectionData.vendor_id = selectedPO.vendor_id;
    }
  }

  formatDate(date: any): string | null {
    if (!date) return null;
    const d = new Date(date);
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${d.getFullYear()}-${month}-${day}`;
  }

  saveInspection() {
    if (!this.inspectionData.po_id || !this.inspectionData.inspection_date || this.inspectionData.quality_score == null) {
      alert("PO, Date and Score are required.");
      return;
    }

    const payload = { ...this.inspectionData };
    payload.inspection_date = this.formatDate(this.inspectionData.inspection_date);

    if (this.isEditMode) {
      this.http.put(`http://127.0.0.1:8000/quality-inspections/${payload.inspection_id}`, payload).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => alert('Error updating inspection')
      });
    } else {
      this.http.post('http://127.0.0.1:8000/quality-inspections', payload).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => alert('Error saving inspection')
      });
    }
  }
}

// --- MAIN QUALITY INSPECTION TABLE COMPONENT ---
@Component({
  selector: 'app-quality-inspection',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, HttpClientModule, CommonModule, MatDialogModule],
  template: `
    <div class="dashboard-container" style="padding: 24px;">
      
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <div>
          <h2 style="margin: 0;">Quality Inspection Logs</h2>
          <p style="margin-top: 5px; color: gray;">Record quality scores and track defective items.</p>
        </div>
        
        <button mat-raised-button color="primary" (click)="openAddInspectionDialog()">
          + Log Inspection
        </button>
      </div>

      <div style="overflow-x: auto;">
        <table mat-table [dataSource]="dataSource" class="mat-elevation-z8" style="width: 100%; min-width: 1100px;">
          
          <ng-container matColumnDef="inspection_id">
            <th mat-header-cell *matHeaderCellDef> ID </th>
            <td mat-cell *matCellDef="let element"> <strong>{{element.inspection_id}}</strong> </td>
          </ng-container>

          <ng-container matColumnDef="po_id">
            <th mat-header-cell *matHeaderCellDef> PO ID </th>
            <td mat-cell *matCellDef="let element"> {{element.po_id}} </td>
          </ng-container>

          <ng-container matColumnDef="vendor_id">
            <th mat-header-cell *matHeaderCellDef> Vendor ID </th>
            <td mat-cell *matCellDef="let element"> {{element.vendor_id}} </td>
          </ng-container>

          <ng-container matColumnDef="inspection_date">
            <th mat-header-cell *matHeaderCellDef> Date </th>
            <td mat-cell *matCellDef="let element"> {{element.inspection_date}} </td>
          </ng-container>

          <ng-container matColumnDef="quality_score">
            <th mat-header-cell *matHeaderCellDef> Score </th>
            <td mat-cell *matCellDef="let element"> 
              <span [ngStyle]="{'color': element.quality_score >= 80 ? 'green' : element.quality_score >= 50 ? 'orange' : 'red', 'font-weight': 'bold'}">
                {{element.quality_score}} / 100
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="defective_quantity">
            <th mat-header-cell *matHeaderCellDef> Defective Qty </th>
            <td mat-cell *matCellDef="let element"> {{element.defective_quantity}} </td>
          </ng-container>

          <ng-container matColumnDef="inspected_by">
            <th mat-header-cell *matHeaderCellDef> Inspector ID </th>
            <td mat-cell *matCellDef="let element"> {{element.inspected_by}} </td>
          </ng-container>

          <ng-container matColumnDef="remarks">
            <th mat-header-cell *matHeaderCellDef style="text-align: center;"> Remarks </th>
            <td mat-cell *matCellDef="let element" style="text-align: center;">
              <button *ngIf="element.remarks" 
                      mat-icon-button 
                      color="primary" 
                      title="View Remarks"
                      (click)="viewRemarks(element.remarks)"
                      style="background: #e8eaf6; border-radius: 50%; width: 35px; height: 35px; line-height: 35px;">
                📄
              </button>
              <span *ngIf="!element.remarks" style="color: #aaa; font-style: italic;">-</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef style="text-align: right;"> Actions </th>
            <td mat-cell *matCellDef="let element" style="text-align: right;">
              <button mat-button color="primary" (click)="openAddInspectionDialog(element)" style="min-width: 36px; padding: 0;">✏️</button>
              <button mat-button color="warn" (click)="deleteInspection(element.inspection_id)" style="min-width: 36px; padding: 0;">🗑️</button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </div>
    </div>
  `
})
export class QualityInspectionComponent implements OnInit {
  displayedColumns: string[] = [
    'inspection_id', 'po_id', 'vendor_id', 'inspection_date', 
    'quality_score', 'defective_quantity', 'inspected_by', 'remarks', 'actions'
  ];
  dataSource = new MatTableDataSource<any>([]);

  constructor(private http: HttpClient, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.fetchInspections();
  }

  fetchInspections(): void {
    this.http.get<any[]>('http://127.0.0.1:8000/quality-inspections').subscribe({
      next: (data) => this.dataSource.data = data
    });
  }

  openAddInspectionDialog(inspection?: any): void {
    const dialogRef = this.dialog.open(InspectionDialog, { 
      width: '700px',
      data: { inspection: inspection } 
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.fetchInspections();
    });
  }

  viewRemarks(remarks: string): void {
    this.dialog.open(RemarksDialog, {
      data: { remarks: remarks }
    });
  }

  deleteInspection(id: number): void {
    if (confirm('Are you sure you want to delete this log?')) {
      this.http.delete(`http://127.0.0.1:8000/quality-inspections/${id}`).subscribe({
        next: () => this.fetchInspections(),
        error: (err) => alert('Error deleting log')
      });
    }
  }
}