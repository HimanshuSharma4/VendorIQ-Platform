import { Component, OnInit } from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common'; 
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';

// --- ADD NOTIFICATION DIALOG ---
@Component({
  selector: 'app-add-notification-dialog',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    MatDialogModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, FormsModule, CommonModule,
    MatDatepickerModule, MatNativeDateModule
  ],
  template: `
    <h2 mat-dialog-title>Create Notification</h2>
    <mat-dialog-content style="display: flex; flex-direction: column; gap: 15px; padding-top: 10px;">
      
      <div style="display: flex; gap: 16px;">
        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Select Vendor</mat-label>
          <mat-select [(ngModel)]="notifData.vendor_id" required>
            <mat-option *ngFor="let vendor of vendors" [value]="vendor.vendor_id">
              {{vendor.vendor_name}} (ID: {{vendor.vendor_id}})
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Created By (User ID)</mat-label>
          <input matInput type="number" [(ngModel)]="notifData.created_by" required>
        </mat-form-field>
      </div>

      <div style="display: flex; gap: 16px;">
        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Notification Type</mat-label>
          <mat-select [(ngModel)]="notifData.notification_type" required>
            <mat-option value="Alert">Alert</mat-option>
            <mat-option value="Reminder">Reminder</mat-option>
            <mat-option value="System">System Info</mat-option>
            <mat-option value="Warning">Warning</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Created Date</mat-label>
          <input matInput [matDatepicker]="picker" [(ngModel)]="notifData.created_date" readonly (click)="picker.open()">
          <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>
      </div>

      <mat-form-field appearance="outline">
        <mat-label>Notification Message</mat-label>
        <textarea matInput [(ngModel)]="notifData.message" rows="3" required></textarea>
      </mat-form-field>

    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="saveNotification()">Send Notification</button>
    </mat-dialog-actions>
  `
})
export class AddNotificationDialog implements OnInit {
  notifData: any = {
    vendor_id: null,
    created_by: 1, 
    notification_type: 'Alert',
    message: '',
    status: 'Unread',
    created_date: new Date()
  };
  vendors: any[] = [];

  constructor(private dialogRef: MatDialogRef<AddNotificationDialog>, private http: HttpClient) {}

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

  saveNotification() {
    if (!this.notifData.vendor_id || !this.notifData.notification_type || !this.notifData.message) {
      alert("Please fill all required fields.");
      return;
    }
    const payload = { ...this.notifData, created_date: this.formatDate(this.notifData.created_date) };
    
    this.http.post('http://127.0.0.1:8000/notifications', payload).subscribe({
      next: () => this.dialogRef.close(true),
      error: () => alert('Error saving notification')
    });
  }
}

// --- MAIN NOTIFICATIONS COMPONENT ---
@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, HttpClientModule, CommonModule, MatDialogModule],
  template: `
    <div class="dashboard-container" style="padding: 24px;">
      
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <div>
          <h2 style="margin: 0;">System Notifications</h2>
          <p style="margin-top: 5px; color: gray;">Manage alerts, reminders, and updates sent to vendors.</p>
        </div>
        <button mat-raised-button color="primary" (click)="openAddDialog()">
          + Send Notification
        </button>
      </div>

      <div style="overflow-x: auto;">
        <table mat-table [dataSource]="dataSource" class="mat-elevation-z8" style="width: 100%; min-width: 1000px;">
          
          <ng-container matColumnDef="notification_id">
            <th mat-header-cell *matHeaderCellDef> ID </th>
            <td mat-cell *matCellDef="let element"> <strong>{{element.notification_id}}</strong> </td>
          </ng-container>

          <ng-container matColumnDef="vendor_id">
            <th mat-header-cell *matHeaderCellDef> Vendor ID </th>
            <td mat-cell *matCellDef="let element"> {{element.vendor_id}} </td>
          </ng-container>

          <!-- YAHAN NAYA CREATED BY COLUMN ADD KIYA GAYA HAI -->
          <ng-container matColumnDef="created_by">
            <th mat-header-cell *matHeaderCellDef> Created By </th>
            <td mat-cell *matCellDef="let element"> {{element.created_by}} </td>
          </ng-container>

          <ng-container matColumnDef="notification_type">
            <th mat-header-cell *matHeaderCellDef> Type </th>
            <td mat-cell *matCellDef="let element"> 
              <strong>{{element.notification_type}}</strong> 
            </td>
          </ng-container>

          <ng-container matColumnDef="message">
            <th mat-header-cell *matHeaderCellDef> Message </th>
            <td mat-cell *matCellDef="let element"> {{element.message}} </td>
          </ng-container>

          <ng-container matColumnDef="created_date">
            <th mat-header-cell *matHeaderCellDef> Date </th>
            <td mat-cell *matCellDef="let element"> {{element.created_date}} </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef> Status </th>
            <td mat-cell *matCellDef="let element"> 
              <span [ngStyle]="{'color': element.status === 'Unread' ? 'red' : 'green', 'font-weight': 'bold'}">
                {{element.status}}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef style="text-align: right;"> Actions </th>
            <td mat-cell *matCellDef="let element" style="text-align: right;">
              <button *ngIf="element.status === 'Unread'" mat-button color="primary" (click)="markAsRead(element.notification_id)" style="min-width: 36px; padding: 0;" title="Mark as Read">✔️</button>
              <button mat-button color="warn" (click)="deleteNotification(element.notification_id)" style="min-width: 36px; padding: 0;" title="Delete">🗑️</button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" [ngStyle]="{'background-color': row.status === 'Unread' ? '#fff9c4' : 'transparent'}"></tr>
        </table>
      </div>
    </div>
  `
})
export class NotificationsComponent implements OnInit {
  // YAHAN ARRAY MEIN 'created_by' ADD KIYA GAYA HAI
  displayedColumns: string[] = [
    'notification_id', 'vendor_id', 'created_by', 'notification_type', 'message', 'created_date', 'status', 'actions'
  ];
  dataSource = new MatTableDataSource<any>([]);

  constructor(private http: HttpClient, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.fetchNotifications();
  }

  fetchNotifications(): void {
    this.http.get<any[]>('http://127.0.0.1:8000/notifications').subscribe({
      next: (data) => this.dataSource.data = data
    });
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(AddNotificationDialog, { width: '600px' });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.fetchNotifications();
    });
  }

  markAsRead(id: number): void {
    this.http.put(`http://127.0.0.1:8000/notifications/${id}/read`, {}).subscribe({
      next: () => this.fetchNotifications(),
      error: () => alert('Error updating status')
    });
  }

  deleteNotification(id: number): void {
    if (confirm('Delete this notification?')) {
      this.http.delete(`http://127.0.0.1:8000/notifications/${id}`).subscribe({
        next: () => this.fetchNotifications(),
        error: () => alert('Error deleting notification')
      });
    }
  }
}