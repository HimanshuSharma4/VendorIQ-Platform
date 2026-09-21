import { Component, OnInit } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog'; // Naya add kiya
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { VendorDialog } from './vendor-dialog'; // Naya add kiya

@Component({
  selector: 'app-dashboard',
  standalone: true,
  // MatDialogModule ko imports me add kiya
  imports: [MatToolbarModule, MatButtonModule, MatTableModule, HttpClientModule, MatDialogModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  displayedColumns: string[] = ['vendor_id', 'vendor_name', 'category', 'status'];
  
  dataSource = new MatTableDataSource<any>([]); 

  // Constructor me dialog inject kiya
  constructor(private router: Router, private http: HttpClient, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.fetchVendors();
  }

  fetchVendors(): void {
    const token = localStorage.getItem('access_token');
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<any[]>('http://127.0.0.1:8000/vendors', { headers })
      .subscribe({
        next: (data) => {
          this.dataSource.data = data; 
        },
        error: (err) => {
          console.error('Error fetching data:', err);
          if (err.status === 401) {
            this.logout();
          }
        }
      });
  }

  // Popup kholne aur table refresh karne ka logic
  openAddVendorDialog(): void {
    const dialogRef = this.dialog.open(VendorDialog, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Form save hote hi table ka data refresh ho jayega
        this.fetchVendors();
      }
    });
  }

  logout(): void {
    localStorage.removeItem('access_token');
    this.router.navigate(['/login']);
  }
}