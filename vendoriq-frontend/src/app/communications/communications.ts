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

// --- UNIQUE POP-UP FOR MESSAGE BODY ---
@Component({
  selector: 'app-message-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title style="color: #3f51b5; border-bottom: 1px solid #eee; padding-bottom: 10px; margin: 0 0 15px 0;">Message Content</h2>
    <mat-dialog-content style="padding: 10px 20px 20px 20px; font-size: 15px; line-height: 1.6; min-width: 400px; max-width: 600px; white-space: pre-wrap; font-family: 'Roboto', sans-serif;">
      {{ data.message_body }}
    </mat-dialog-content>
    <mat-dialog-actions align="end" style="padding-bottom: 15px; padding-right: 15px;">
      <button mat-raised-button color="primary" mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `
})
export class MessageViewDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}

// --- COMPOSE MESSAGE DIALOG ---
@Component({
  selector: 'app-compose-dialog',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    MatDialogModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, FormsModule, CommonModule,
    MatDatepickerModule, MatNativeDateModule
  ],
  template: `
    <h2 mat-dialog-title>{{ isEditMode ? 'Edit Communication' : 'Compose New Communication' }}</h2>
    <mat-dialog-content style="display: flex; flex-direction: column; gap: 15px; padding-top: 10px;">
      
      <div style="display: flex; gap: 16px;">
        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Select Vendor</mat-label>
          <mat-select [(ngModel)]="commData.vendor_id" required>
            <mat-option *ngFor="let vendor of vendors" [value]="vendor.vendor_id">
              {{vendor.vendor_name}} (ID: {{vendor.vendor_id}})
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Created By (User ID)</mat-label>
          <input matInput type="number" [(ngModel)]="commData.created_by" required>
        </mat-form-field>
      </div>

      <div style="display: flex; gap: 16px;">
        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Subject</mat-label>
          <input matInput [(ngModel)]="commData.subject" required>
        </mat-form-field>

        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Communication Date</mat-label>
          <input matInput [matDatepicker]="sentPicker" [(ngModel)]="commData.communication_date" readonly (click)="sentPicker.open()">
          <mat-datepicker-toggle matSuffix [for]="sentPicker"></mat-datepicker-toggle>
          <mat-datepicker #sentPicker></mat-datepicker>
        </mat-form-field>
      </div>

      <div style="display: flex; gap: 16px;">
        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Message Type</mat-label>
          <mat-select [(ngModel)]="commData.message_type" required>
            <mat-option value="Notice">Notice</mat-option>
            <mat-option value="Warning">Warning</mat-option>
            <mat-option value="Query">Query</mat-option>
            <mat-option value="Update">Update</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Issue Status</mat-label>
          <mat-select [(ngModel)]="commData.issue_status">
            <mat-option value="Open">Open</mat-option>
            <mat-option value="In Progress">In Progress</mat-option>
            <mat-option value="Resolved">Resolved</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <div style="display: flex; gap: 16px;">
        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Response Time (Hrs)</mat-label>
          <input matInput type="number" [(ngModel)]="commData.response_time">
        </mat-form-field>

        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Resolution Time (Hrs)</mat-label>
          <input matInput type="number" [(ngModel)]="commData.resolution_time">
        </mat-form-field>
      </div>

      <mat-form-field appearance="outline">
        <mat-label>Message Body</mat-label>
        <textarea matInput [(ngModel)]="commData.message_body" rows="4" required></textarea>
      </mat-form-field>

    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="sendMessage()">
        {{ isEditMode ? 'Update Record' : 'Save Record' }}
      </button>
    </mat-dialog-actions>
  `
})
export class ComposeDialog implements OnInit {
  commData: any = {
    vendor_id: null,
    created_by: 1, 
    subject: '',
    message_body: '',
    communication_date: new Date(),
    message_type: 'Notice',
    response_time: null,
    issue_status: 'Open',
    resolution_time: null
  };
  
  vendors: any[] = [];
  isEditMode = false;

  constructor(
    private dialogRef: MatDialogRef<ComposeDialog>, 
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data && data.communication) {
      this.commData = { ...data.communication };
      if (this.commData.communication_date) {
        this.commData.communication_date = new Date(this.commData.communication_date);
      }
      this.isEditMode = true;
    }
  }

  ngOnInit() {
    this.http.get<any[]>('http://127.0.0.1:8000/vendors').subscribe(data => {
      this.vendors = data;
    });
  }

  formatDate(date: any): string | null {
    if (!date) return null;
    const d = new Date(date);
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${d.getFullYear()}-${month}-${day}`;
  }

  sendMessage() {
    if (!this.commData.vendor_id || !this.commData.subject || !this.commData.message_body || !this.commData.message_type) {
      alert("Vendor, Subject, Message Type, and Body are required.");
      return;
    }

    const payload = { ...this.commData };
    payload.communication_date = this.formatDate(this.commData.communication_date);

    if (this.isEditMode) {
      this.http.put(`http://127.0.0.1:8000/communications/${payload.communication_id}`, payload).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => alert('Error updating communication')
      });
    } else {
      this.http.post('http://127.0.0.1:8000/communications', payload).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => alert('Error saving communication')
      });
    }
  }
}

// --- MAIN COMMUNICATIONS TABLE COMPONENT ---
@Component({
  selector: 'app-communications',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, HttpClientModule, CommonModule, MatDialogModule],
  template: `
    <div class="dashboard-container" style="padding: 24px;">
      
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <div>
          <h2 style="margin: 0;">Communication Logs</h2>
          <p style="margin-top: 5px; color: gray;">Track communications, issue statuses, and resolution metrics.</p>
        </div>
        
        <button mat-raised-button color="primary" (click)="openComposeDialog()">
          + Add Record
        </button>
      </div>

      <div style="overflow-x: auto;">
        <table mat-table [dataSource]="dataSource" class="mat-elevation-z8" style="width: 100%; min-width: 1200px;">
          
          <ng-container matColumnDef="communication_id">
            <th mat-header-cell *matHeaderCellDef> ID </th>
            <td mat-cell *matCellDef="let element"> <strong>{{element.communication_id}}</strong> </td>
          </ng-container>

          <ng-container matColumnDef="vendor_id">
            <th mat-header-cell *matHeaderCellDef> Vendor ID </th>
            <td mat-cell *matCellDef="let element"> {{element.vendor_id}} </td>
          </ng-container>

          <ng-container matColumnDef="created_by">
            <th mat-header-cell *matHeaderCellDef> Created By </th>
            <td mat-cell *matCellDef="let element"> {{element.created_by}} </td>
          </ng-container>

          <ng-container matColumnDef="message_type">
            <th mat-header-cell *matHeaderCellDef> Type </th>
            <td mat-cell *matCellDef="let element"> {{element.message_type}} </td>
          </ng-container>

          <ng-container matColumnDef="subject">
            <th mat-header-cell *matHeaderCellDef> Subject </th>
            <td mat-cell *matCellDef="let element" style="font-weight: 500;"> {{element.subject}} </td>
          </ng-container>

          <ng-container matColumnDef="communication_date">
            <th mat-header-cell *matHeaderCellDef> Date </th>
            <td mat-cell *matCellDef="let element"> {{element.communication_date}} </td>
          </ng-container>

          <ng-container matColumnDef="issue_status">
            <th mat-header-cell *matHeaderCellDef> Status </th>
            <td mat-cell *matCellDef="let element"> 
              <span [ngStyle]="{'color': element.issue_status === 'Resolved' ? 'green' : element.issue_status === 'In Progress' ? 'orange' : 'red'}">
                {{element.issue_status}}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="response_time">
            <th mat-header-cell *matHeaderCellDef> Resp. (Hrs) </th>
            <td mat-cell *matCellDef="let element"> {{element.response_time || '-'}} </td>
          </ng-container>
          
          <ng-container matColumnDef="resolution_time">
            <th mat-header-cell *matHeaderCellDef> Res. (Hrs) </th>
            <td mat-cell *matCellDef="let element"> {{element.resolution_time || '-'}} </td>
          </ng-container>

          <ng-container matColumnDef="message_body">
            <th mat-header-cell *matHeaderCellDef style="text-align: center;"> Body </th>
            <td mat-cell *matCellDef="let element" style="text-align: center;">
              <button mat-icon-button 
                      color="primary" 
                      title="View Details"
                      (click)="viewMessage(element.message_body)"
                      style="background: #e8eaf6; border-radius: 50%; width: 35px; height: 35px; line-height: 35px;">
                📄
              </button>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef style="text-align: right;"> Actions </th>
            <td mat-cell *matCellDef="let element" style="text-align: right;">
              <button mat-button color="primary" (click)="openComposeDialog(element)" style="min-width: 36px; padding: 0;">✏️</button>
              <button mat-button color="warn" (click)="deleteMessage(element.communication_id)" style="min-width: 36px; padding: 0;">🗑️</button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </div>
    </div>
  `
})
export class CommunicationsComponent implements OnInit {
  displayedColumns: string[] = [
    'communication_id', 'vendor_id', 'created_by', 'message_type', 'subject', 
    'communication_date', 'issue_status', 'response_time', 'resolution_time', 'message_body', 'actions'
  ];
  dataSource = new MatTableDataSource<any>([]);

  constructor(private http: HttpClient, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.fetchMessages();
  }

  fetchMessages(): void {
    this.http.get<any[]>('http://127.0.0.1:8000/communications').subscribe({
      next: (data) => this.dataSource.data = data
    });
  }

  openComposeDialog(communication?: any): void {
    const dialogRef = this.dialog.open(ComposeDialog, { 
      width: '700px',
      data: { communication: communication } 
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.fetchMessages();
    });
  }

  viewMessage(messageBody: string): void {
    this.dialog.open(MessageViewDialog, {
      data: { message_body: messageBody }
    });
  }

  deleteMessage(id: number): void {
    if (confirm('Are you sure you want to delete this record?')) {
      this.http.delete(`http://127.0.0.1:8000/communications/${id}`).subscribe({
        next: () => this.fetchMessages(),
        error: (err) => alert('Error deleting record')
      });
    }
  }
}