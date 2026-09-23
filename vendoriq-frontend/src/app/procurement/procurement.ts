import { Component } from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-procurement',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule],
  templateUrl: './procurement.html',
  styleUrls: ['./procurement.css']
})
export class Procurement {
  // Ye empty data source add kiya hai taaki HTML ka error chala jaye
  dataSource = new MatTableDataSource<any>([]);
}