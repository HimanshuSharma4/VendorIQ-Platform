import { Component } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contract-dialog',
  standalone: true,
  imports: [MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, FormsModule, HttpClientModule, CommonModule],
  template: `
    <h2 mat-dialog-title>Add New Contract</h2>
    <mat-dialog-content>
      <div style="display: flex; flex-direction: column; gap: 15px; margin-top: 10px;">
        <mat-form-field appearance="outline">
          <mat-label>Contract Number</mat-label>
          <input matInput [(ngModel)]="contractData.contract_number">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Vendor Name</mat-label>
          <input matInput [(ngModel)]="contractData.vendor_name">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Start Date (YYYY-MM-DD)</mat-label>
          <input matInput type="date" [(ngModel)]="contractData.start_date">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>End Date (YYYY-MM-DD)</mat-label>
          <input matInput type="date" [(ngModel)]="contractData.end_date">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Compliance Status</mat-label>
          <mat-select [(ngModel)]="contractData.compliance_status">
            <mat-option value="Valid">Valid</mat-option>
            <mat-option value="Under Review">Under Review</mat-option>
            <mat-option value="Expired">Expired</mat-option>
          </mat-select>
        </mat-form-field>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="saveContract()">Save</button>
    </mat-dialog-actions>
  `
})
export class ContractDialog {
  contractData = {
    contract_number: '',
    vendor_name: '',
    start_date: '',
    end_date: '',
    compliance_status: 'Valid'
  };

  constructor(
    private http: HttpClient,
    public dialogRef: MatDialogRef<ContractDialog>
  ) {}

  saveContract(): void {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.post('http://127.0.0.1:8000/contracts', this.contractData, { headers })
      .subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => console.error('Error saving contract:', err)
      });
  }
}