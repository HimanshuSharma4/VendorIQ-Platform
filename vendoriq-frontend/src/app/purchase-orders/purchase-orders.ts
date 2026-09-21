import { Component, OnInit } from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; // Date aur Currency format ke liye
// Dialog ke naye imports
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PODialog } from './po-dialog';

@Component({
  selector: 'app-purchase-orders',
  standalone: true,
  // MatDialogModule ko imports array me add kiya hai
  imports: [MatTableModule, MatButtonModule, HttpClientModule, CommonModule, MatDialogModule],
  templateUrl: './purchase-orders.html',
  styleUrl: './purchase-orders.css'
})
export class PurchaseOrders implements OnInit {
  displayedColumns: string[] = ['po_number', 'vendor_name', 'order_date', 'total_amount', 'status', 'actions'];
  dataSource = new MatTableDataSource<any>([]);

  // Constructor me MatDialog ko inject kiya hai
  constructor(
    private http: HttpClient, 
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.fetchPurchaseOrders();
  }

  fetchPurchaseOrders(): void {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get<any[]>('http://127.0.0.1:8000/purchase-orders', { headers })
      .subscribe({
        next: (data) => {
          this.dataSource.data = data;
        },
        error: (err) => {
          console.error('Error fetching POs:', err);
          if (err.status === 401) {
            localStorage.removeItem('access_token');
            this.router.navigate(['/login']);
          }
        }
      });
  }

  // Ab ye function aapka naya form popup open karega
  openAddPODialog(): void {
    const dialogRef = this.dialog.open(PODialog, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Naya PO save hote hi table apne aap refresh ho jayegi
        this.fetchPurchaseOrders();
      }
    });
  }

  deletePO(id: number): void {
    if (confirm('Are you sure you want to delete this Purchase Order?')) {
      const token = localStorage.getItem('access_token');
      const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

      this.http.delete(`http://127.0.0.1:8000/purchase-orders/${id}`, { headers })
        .subscribe({
          next: () => this.fetchPurchaseOrders(),
          error: (err) => console.error('Error deleting PO:', err)
        });
    }
  }
}