import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

// 1. Naye Dialog Imports add kiye gaye hain
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ContractDialog } from './contract-dialog';

@Component({
  selector: 'app-contracts',
  standalone: true,
  // 2. MatDialogModule ko imports me add kiya gaya hai
  imports: [MatTableModule, MatButtonModule, HttpClientModule, CommonModule, MatDialogModule],
  templateUrl: './contracts.html',
  styles: [`
    .container { padding: 24px; }
    .status-valid { color: green; font-weight: bold; }
    .status-expired { color: red; font-weight: bold; }
  `]
})
export class Contracts implements OnInit {
  displayedColumns: string[] = ['contract_number', 'vendor_name', 'start_date', 'end_date', 'compliance_status', 'actions'];
  dataSource = new MatTableDataSource<any>([]);

  // 3. Constructor me dialog service inject ki gayi hai
  constructor(private http: HttpClient, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.fetchContracts();
  }

  fetchContracts(): void {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get<any[]>('http://127.0.0.1:8000/contracts', { headers })
      .subscribe({
        next: (data) => this.dataSource.data = data,
        error: (err) => console.error('Error fetching contracts:', err)
      });
  }

  deleteContract(id: number): void {
    if (confirm('Are you sure you want to delete this contract?')) {
      const token = localStorage.getItem('access_token');
      const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

      this.http.delete(`http://127.0.0.1:8000/contracts/${id}`, { headers })
        .subscribe({
          next: () => this.fetchContracts(),
          error: (err) => console.error('Error deleting contract:', err)
        });
    }
  }

  // 4. Dialog open karne ka function
  openAddContractDialog(): void {
    const dialogRef = this.dialog.open(ContractDialog, { width: '400px' });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchContracts(); // Dialog band hone par table automatically refresh hoga
      }
    });
  }
}