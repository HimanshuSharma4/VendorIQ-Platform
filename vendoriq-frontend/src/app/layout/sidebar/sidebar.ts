import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule], 
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  
  constructor(private router: Router) {}

  logout() {
    // Token delete karke wapas login page par bhejega
    localStorage.removeItem('access_token');
    this.router.navigate(['/login']);
  }
}