import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router'; 
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class Sidebar implements OnInit {
  userRole: string = 'Admin'; 
  userName: string = 'Admin User';
  
  userPermissions: { [module: string]: string[] } = {};
  isSuperAdmin: boolean = false;

  constructor(
    private router: Router, 
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.userRole = localStorage.getItem('role') || 'Admin';
    this.userName = localStorage.getItem('name') || 'Admin User';
    
    this.fetchUserPermissions();
  }

  fetchUserPermissions(): void {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get<any[]>('https://vendoriq-platform.onrender.com/roles', { headers }).subscribe({
      next: (roles) => {
        const currentRoleObj = roles.find(r => r.name === this.userRole);
        
        if (currentRoleObj) {
          this.userPermissions = currentRoleObj.permissions || {};
          if (currentRoleObj.id === 1) {
            this.isSuperAdmin = true;
          }

          // REDIRECT BUG FIX: Agar user Dashboard par hai aur access nahi hai, toh first allowed module par bhejo
          if (this.router.url === '/dashboard' || this.router.url === '/') {
            if (!this.hasAccess('Dashboard')) {
              const firstAllowedModule = Object.keys(this.userPermissions).find(
                mod => this.userPermissions[mod].includes('View')
              );

              if (firstAllowedModule) {
                let route = '/' + firstAllowedModule.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and');
                
                // Specific route matching rules
                if (firstAllowedModule === 'User Management') route = '/user-management';
                if (firstAllowedModule === 'Invoices & Payments') route = '/invoices';
                if (firstAllowedModule === 'Contracts & Compliance') route = '/contracts';
                if (firstAllowedModule === 'System / Activity Logs') route = '/activity-logs';
                if (firstAllowedModule === 'Role & Permission') route = '/role-permission';
                if (firstAllowedModule === 'System Settings') route = '/settings';

                this.router.navigate([route]);
              }
            }
          }
        }
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error('Error fetching sidebar permissions:', err)
    });
  }

  hasAccess(moduleName: string): boolean {
    if (this.isSuperAdmin) return true; 
    return this.userPermissions[moduleName]?.includes('View') ?? false;
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}