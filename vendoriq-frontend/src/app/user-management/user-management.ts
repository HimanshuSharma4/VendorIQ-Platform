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

// --- ADD/EDIT USER DIALOG ---
@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [
    MatDialogModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, FormsModule, CommonModule
  ],
  template: `
    <h2 mat-dialog-title>{{ isEditMode ? 'Edit User' : 'Create New User' }}</h2>
    <mat-dialog-content style="display: flex; flex-direction: column; gap: 15px; padding-top: 10px;">
      
      <div style="display: flex; gap: 16px;">
        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Full Name</mat-label>
          <input matInput [(ngModel)]="userData.name" required>
        </mat-form-field>

        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Email</mat-label>
          <input matInput type="email" [(ngModel)]="userData.email" required>
        </mat-form-field>
      </div>

      <!-- Password field is hidden in Edit mode for security -->
      <mat-form-field appearance="outline" *ngIf="!isEditMode">
        <mat-label>Password</mat-label>
        <input matInput type="password" [(ngModel)]="userData.password" required>
      </mat-form-field>

      <div style="display: flex; gap: 16px;">
        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Role</mat-label>
          <mat-select [(ngModel)]="userData.role" required>
            <mat-option value="Super Administrator">Super Administrator</mat-option>
            <mat-option value="Procurement Manager">Procurement Manager</mat-option>
            <mat-option value="Vendor">Vendor</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Status</mat-label>
          <mat-select [(ngModel)]="userData.status">
            <mat-option value="Active">Active</mat-option>
            <mat-option value="Inactive">Inactive</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="saveUser()">
        {{ isEditMode ? 'Update User' : 'Save User' }}
      </button>
    </mat-dialog-actions>
  `
})
export class UserDialog implements OnInit {
  userData: any = {
    name: '',
    email: '',
    password: '',
    role: 'Procurement Manager',
    status: 'Active'
  };
  isEditMode = false;

  constructor(
    private dialogRef: MatDialogRef<UserDialog>, 
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data && data.user) {
      this.userData = { ...data.user };
      this.isEditMode = true;
    }
  }

  ngOnInit() {}

  saveUser() {
    if (!this.userData.name || !this.userData.email || !this.userData.role) {
      alert("Name, Email, and Role are required.");
      return;
    }
    if (!this.isEditMode && !this.userData.password) {
      alert("Password is required for new users.");
      return;
    }

    if (this.isEditMode) {
      // Assuming PUT endpoint is configured in backend
      this.http.put(`http://127.0.0.1:8000/users/${this.userData.user_id}`, this.userData).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => alert('Error updating user')
      });
    } else {
      this.http.post('http://127.0.0.1:8000/users', this.userData).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => alert('Error saving user')
      });
    }
  }
}

// --- MAIN USER MANAGEMENT COMPONENT ---
@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, HttpClientModule, CommonModule, MatDialogModule],
  template: `
    <div class="dashboard-container" style="padding: 24px;">
      
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <div>
          <h2 style="margin: 0;">User Management</h2>
          <p style="margin-top: 5px; color: gray;">Overview of all registered users and their system roles.</p>
        </div>
        <button mat-raised-button color="primary" (click)="openUserDialog()">
          + New User
        </button>
      </div>

      <div style="overflow-x: auto;">
        <table mat-table [dataSource]="dataSource" class="mat-elevation-z8" style="width: 100%; min-width: 1000px;">
          
          <ng-container matColumnDef="user_id">
            <th mat-header-cell *matHeaderCellDef> ID </th>
            <td mat-cell *matCellDef="let element"> <strong>{{element.user_id}}</strong> </td>
          </ng-container>

          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef> Username </th>
            <td mat-cell *matCellDef="let element" style="font-weight: 500;"> {{element.name}} </td>
          </ng-container>

          <!-- NAYA EMAIL COLUMN -->
          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef> Email </th>
            <td mat-cell *matCellDef="let element"> {{element.email}} </td>
          </ng-container>

          <ng-container matColumnDef="role">
            <th mat-header-cell *matHeaderCellDef> Role </th>
            <td mat-cell *matCellDef="let element"> {{element.role}} </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef> Status </th>
            <td mat-cell *matCellDef="let element"> 
              <span [ngStyle]="{'color': element.status === 'Active' ? 'green' : 'red', 'font-weight': 'bold'}">
                {{element.status}}
              </span>
            </td>
          </ng-container>

          <!-- NAYA CREATED AT COLUMN -->
          <ng-container matColumnDef="created_at">
            <th mat-header-cell *matHeaderCellDef> Created At </th>
            <td mat-cell *matCellDef="let element"> {{element.created_at | date:'shortDate'}} </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef style="text-align: right;"> Actions </th>
            <td mat-cell *matCellDef="let element" style="text-align: right;">
              <button mat-button color="primary" (click)="openUserDialog(element)" style="min-width: 36px; padding: 0;">✏️</button>
              <button mat-button color="warn" (click)="deleteUser(element.user_id)" style="min-width: 36px; padding: 0;">🗑️</button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </div>
    </div>
  `
})
export class UserManagement implements OnInit {
  displayedColumns: string[] = [
    'user_id', 'name', 'email', 'role', 'status', 'created_at', 'actions'
  ];
  dataSource = new MatTableDataSource<any>([]);

  constructor(private http: HttpClient, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(): void {
    this.http.get<any[]>('http://127.0.0.1:8000/users').subscribe({
      next: (data) => this.dataSource.data = data
    });
  }

  openUserDialog(user?: any): void {
    const dialogRef = this.dialog.open(UserDialog, { 
      width: '600px',
      data: { user: user }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.fetchUsers();
    });
  }

  deleteUser(id: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.http.delete(`http://127.0.0.1:8000/users/${id}`).subscribe({
        next: () => this.fetchUsers(),
        error: (err) => alert('Error deleting user')
      });
    }
  }
}