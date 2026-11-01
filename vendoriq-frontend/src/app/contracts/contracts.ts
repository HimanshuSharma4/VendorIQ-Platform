import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Angular Material Imports
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';

// --- ADD/EDIT CONTRACT DIALOG ---
@Component({
  selector: 'app-contract-dialog',
  standalone: true,
  providers: [provideNativeDateAdapter()], // Calendar open karne ke liye zaroori
  imports: [
    MatDialogModule, MatFormFieldModule, MatInputModule, 
    MatButtonModule, MatSelectModule, FormsModule, CommonModule, 
    MatDatepickerModule, MatNativeDateModule
  ],
  template: `
    <h2 mat-dialog-title>Add New Contract</h2>
    <mat-dialog-content>
      <div style="display: flex; flex-direction: column; gap: 15px; margin-top: 10px;">
        <mat-form-field appearance="outline">
          <mat-label>Vendor ID</mat-label>
          <input matInput type="number" [(ngModel)]="contractData.vendor_id" required>
        </mat-form-field>

        <div style="display: flex; gap: 15px;">
          <!-- Proper Material Start Date Picker -->
          <mat-form-field appearance="outline" style="flex: 1;">
            <mat-label>Start Date</mat-label>
            <input matInput [matDatepicker]="startPicker" [(ngModel)]="contractData.start_date" required readonly (click)="startPicker.open()">
            <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
            <mat-datepicker #startPicker></mat-datepicker>
          </mat-form-field>

          <!-- Proper Material End Date Picker -->
          <mat-form-field appearance="outline" style="flex: 1;">
            <mat-label>End Date</mat-label>
            <input matInput [matDatepicker]="endPicker" [(ngModel)]="contractData.end_date" required readonly (click)="endPicker.open()">
            <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
            <mat-datepicker #endPicker></mat-datepicker>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>Contract Value (₹)</mat-label>
          <input matInput type="number" [(ngModel)]="contractData.contract_value" required>
        </mat-form-field>

        <div style="display: flex; gap: 15px;">
          <mat-form-field appearance="outline" style="flex: 1;">
            <mat-label>Compliance Status</mat-label>
            <mat-select [(ngModel)]="contractData.compliance_status">
              <mat-option value="Compliant">Compliant</mat-option>
              <mat-option value="Pending Review">Pending Review</mat-option>
              <mat-option value="Non-Compliant">Non-Compliant</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" style="flex: 1;">
            <mat-label>Renewal Status</mat-label>
            <mat-select [(ngModel)]="contractData.renewal_status">
              <mat-option value="Active">Active</mat-option>
              <mat-option value="Due for Renewal">Due for Renewal</mat-option>
              <mat-option value="Expired">Expired</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="saveContract()">Save Contract</button>
    </mat-dialog-actions>
  `
})
export class ContractDialog {
  contractData = {
    vendor_id: null,
    start_date: '',
    end_date: '',
    contract_value: null,
    compliance_status: 'Compliant',
    renewal_status: 'Active'
  };

  constructor(private http: HttpClient, public dialogRef: MatDialogRef<ContractDialog>) {}

  saveContract(): void {
    // API bhejte time date ko proper YYYY-MM-DD format me convert karna
    const payload = {
      ...this.contractData,
      start_date: this.formatDate(this.contractData.start_date),
      end_date: this.formatDate(this.contractData.end_date)
    };

    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.post('https://vendoriq-platform.onrender.com/contracts', payload, { headers })
      .subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => {
          console.error('Error creating contract:', err);
          alert('Failed to save contract. Ensure Vendor ID is valid.');
        }
      });
  }

  // Helper function: Date object ko string YYYY-MM-DD me convert karne ke liye
  formatDate(dateObj: any): string {
    if (!dateObj) return '';
    const d = new Date(dateObj);
    const month = '' + (d.getMonth() + 1);
    const day = '' + d.getDate();
    const year = d.getFullYear();
    return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
  }
}

// --- MAIN CONTRACT COMPONENT ---
@Component({
  selector: 'app-contracts',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, HttpClientModule, MatDialogModule],
  template: `
    <div style="padding: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <div>
          <h2 style="margin: 0; font-size: 24px; color: #1a1a24;">Contract & Compliance</h2>
          <p style="margin-top: 5px; color: gray;">Manage vendor agreements, compliance, and renewals.</p>
        </div>
        <button mat-raised-button color="primary" (click)="openContractDialog()">
          + Add Contract
        </button>
      </div>

      <div style="overflow-x: auto; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <table mat-table [dataSource]="dataSource" style="width: 100%;">
          
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef> Contract ID </th>
            <td mat-cell *matCellDef="let element"> <strong>#{{element.contract_id}}</strong> </td>
          </ng-container>

          <ng-container matColumnDef="vendor_id">
            <th mat-header-cell *matHeaderCellDef> Vendor ID </th>
            <td mat-cell *matCellDef="let element"> {{element.vendor_id}} </td>
          </ng-container>

          <ng-container matColumnDef="duration">
            <th mat-header-cell *matHeaderCellDef> Duration </th>
            <td mat-cell *matCellDef="let element"> 
              <span style="font-size: 13px; color: #555;">{{element.start_date | date:'mediumDate'}} to {{element.end_date | date:'mediumDate'}}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="value">
            <th mat-header-cell *matHeaderCellDef> Value (₹) </th>
            <td mat-cell *matCellDef="let element"> {{element.contract_value | number}} </td>
          </ng-container>

          <ng-container matColumnDef="compliance">
            <th mat-header-cell *matHeaderCellDef> Compliance </th>
            <td mat-cell *matCellDef="let element"> 
              <span [ngStyle]="{'color': element.compliance_status === 'Compliant' ? 'green' : (element.compliance_status === 'Non-Compliant' ? 'red' : 'orange'), 'font-weight': '500'}">
                {{element.compliance_status}}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="renewal">
            <th mat-header-cell *matHeaderCellDef> Status </th>
            <td mat-cell *matCellDef="let element"> 
              <span [ngStyle]="{'color': element.renewal_status === 'Active' ? 'green' : 'red', 'font-weight': '500'}">
                {{element.renewal_status}}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef style="text-align: right;"> Actions </th>
            <td mat-cell *matCellDef="let element" style="text-align: right;">
              <button mat-icon-button color="warn" (click)="deleteContract(element.contract_id)" style="border: none; background: transparent; cursor: pointer; font-size: 18px;">🗑️</button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </div>
    </div>
  `
})
export class Contracts implements OnInit {
  displayedColumns: string[] = ['id', 'vendor_id', 'duration', 'value', 'compliance', 'renewal', 'actions'];
  dataSource = new MatTableDataSource<any>([]);

  constructor(private http: HttpClient, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.fetchContracts();
  }

  fetchContracts(): void {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get<any[]>('https://vendoriq-platform.onrender.com/contracts', { headers })
      .subscribe({
        next: (data) => this.dataSource.data = data,
        error: (err) => console.error('Error fetching contracts', err)
      });
  }

  openContractDialog(): void {
    const dialogRef = this.dialog.open(ContractDialog, { width: '500px' });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.fetchContracts();
    });
  }

  deleteContract(id: number): void {
    if (confirm('Are you sure you want to delete this contract?')) {
      const token = localStorage.getItem('access_token');
      const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

      this.http.delete(`https://vendoriq-platform.onrender.com/contracts/${id}`, { headers })
        .subscribe({
          next: () => this.fetchContracts(),
          error: (err) => alert('Error deleting contract')
        });
    }
  }
}