import { Component, OnInit } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule, MatTableDataSource } from '@angular/material/table'; // Added MatTableDataSource
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, MatTableModule, HttpClientModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  displayedColumns: string[] = ['vendor_id', 'vendor_name', 'category', 'status'];
  
  // Standard enterprise approach for Angular Material Tables
  dataSource = new MatTableDataSource<any>([]); 

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchVendors();
  }

  /**
   * Securely fetches vendor data from the backend using the stored JWT token.
   * Assigns the retrieved data to the Material Table Data Source.
   */
  fetchVendors(): void {
    const token = localStorage.getItem('access_token');
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<any[]>('http://127.0.0.1:8000/vendors', { headers })
      .subscribe({
        next: (data) => {
          // Properly updates the data source without triggering lifecycle sync errors
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

  /**
   * Terminates the current user session and clears authentication storage.
   */
  logout(): void {
    localStorage.removeItem('access_token');
    this.router.navigate(['/login']);
  }
}