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
  selector: 'app-user-dialog',
  standalone: true,
  imports: [MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, FormsModule, HttpClientModule, CommonModule],
  template: `
    <h2 mat-dialog-title>Add New User</h2>
    <mat-dialog-content>
      <div style="display: flex; flex-direction: column; gap: 15px; margin-top: 10px;">
        <mat-form-field appearance="outline">
          <mat-label>Username</mat-label>
          <input matInput [(ngModel)]="userData.username">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Password</mat-label>
          <input matInput type="password" [(ngModel)]="userData.password">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Role</mat-label>
          <mat-select [(ngModel)]="userData.role">
            <mat-option value="Admin">Admin</mat-option>
            <mat-option value="User">User</mat-option>
            <mat-option value="Vendor">Vendor</mat-option>
          </mat-select>
        </mat-form-field>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="saveUser()">Save</button>
    </mat-dialog-actions>
  `
})
export class UserDialog {
  userData = { username: '', password: '', role: 'User' };

  constructor(private http: HttpClient, public dialogRef: MatDialogRef<UserDialog>) {}

  saveUser(): void {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.post('http://127.0.0.1:8000/users', this.userData, { headers })
      .subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => {
          console.error('Error creating user:', err);
          // Backend se error aane par user ko screen par alert dikhayein
          if (err.status === 400) {
            alert(err.error.detail || "Username already exists in the system!");
          } else {
            alert("An error occurred while saving the user.");
          }
        }
      });
  }
}