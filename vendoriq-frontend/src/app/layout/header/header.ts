import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header implements OnInit {
  userName: string = 'Admin User';
  userRole: string = 'Admin';
  currentDate: Date = new Date(); // Aaj ki real date ke liye

  ngOnInit(): void {
    // LocalStorage se login user ka data nikalna
    this.userName = localStorage.getItem('name') || 'Admin User';
    this.userRole = localStorage.getItem('role') || 'Admin';
  }
}