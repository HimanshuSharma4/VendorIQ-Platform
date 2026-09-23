import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { CommonModule } from '@angular/common';

// 1. Naye Imports add kiye gaye hain
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { UserDialog } from './user-dialog';

@Component({
  selector: 'app-user-management',
  standalone: true,
  // 2. MatDialogModule aur MatButtonModule ko imports me add kiya gaya hai
  imports: [MatTableModule, HttpClientModule, CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './user-management.html',
  styles: [`
    .container { padding: 24px; }
    .role-admin { color: #673ab7; font-weight: bold; }
    .role-user { color: #2196f3; font-weight: bold; }
  `]
})
export class UserManagement implements OnInit {
  displayedColumns: string[] = ['id', 'username', 'role', 'status'];
  dataSource = new MatTableDataSource<any>([]);

  // 3. Constructor me dialog service inject ki gayi hai
  constructor(private http: HttpClient, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(): void {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get<any[]>('http://127.0.0.1:8000/users', { headers })
      .subscribe({
        next: (data) => this.dataSource.data = data,
        error: (err) => console.error('Error fetching users:', err)
      });
  }

  // 4. Dialog open karne ka function
  openAddUserDialog(): void {
    const dialogRef = this.dialog.open(UserDialog, { width: '400px' });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchUsers(); // Dialog band hone par table automatically refresh hoga
      }
    });
  }
}