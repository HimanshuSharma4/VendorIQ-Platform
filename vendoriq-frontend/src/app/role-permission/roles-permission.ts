import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';

interface Role {
  id: number;
  name: string;
  description: string;
  users: number;
  level: string;
  color: string;
  permissions: { [module: string]: string[] };
}

@Component({
  selector: 'app-roles-permission',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './roles-permission.html',
  styleUrl: './roles-permission.css'
})
export class RolesPermissionComponent implements OnInit {
  searchTerm = '';
  selectedRoleId = 1;
  showRoleForm = false;
  editingRoleId: number | null = null;
  newRoleName = '';
  newRoleDescription = '';
  roles: Role[] = [];
  
  userCountsByRole: { [roleName: string]: number } = {};

  modules = [
    'Dashboard', 'User Management', 'Vendors', 'Products', 'Procurement',
    'Purchase Orders', 'Deliveries', 'Invoices & Payments', 'Quality Inspection',
    'Communications', 'Contracts & Compliance', 'Performance & Reliability',
    'Reports & Analytics', 'Notifications', 'System / Activity Logs',
    'Role & Permission', 'System Settings'
  ];

  actions = ['View', 'Create', 'Edit', 'Delete'];

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.fetchRoles();
    this.fetchUserCounts();
  }

  private getHeaders() {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  fetchRoles(): void {
    this.http.get<Role[]>('https://vendoriq-platform.onrender.com/roles', { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          if (data && data.length > 0) {
            this.roles = data;
          } else {
            this.roles = [{
              id: 1, name: 'Super Administrator', description: 'Full access', users: 1,
              level: 'Critical', color: 'purple', permissions: {}
            }];
          }
          if (!this.roles.some(r => r.id === this.selectedRoleId)) {
            this.selectedRoleId = this.roles[0]?.id || 1;
          }
          this.cdr.detectChanges(); 
        },
        error: (err) => console.error('Error fetching roles:', err)
      });
  }

  fetchUserCounts(): void {
    this.http.get<any[]>('https://vendoriq-platform.onrender.com/users', { headers: this.getHeaders() }).subscribe({
      next: (users) => {
        this.userCountsByRole = {};
        users.forEach(user => {
          if (user.role) {
            this.userCountsByRole[user.role] = (this.userCountsByRole[user.role] || 0) + 1;
          }
        });
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching users for count:', err)
    });
  }

  get filteredRoles(): Role[] {
    const term = this.searchTerm.toLowerCase().trim();
    return this.roles.filter(role =>
      role.name.toLowerCase().includes(term) ||
      role.description.toLowerCase().includes(term)
    );
  }

  get selectedRole(): Role {
    return this.roles.find(role => role.id === this.selectedRoleId) ?? this.roles[0];
  }

  get totalAssignedUsers(): number {
    return Object.values(this.userCountsByRole).reduce((total, count) => total + count, 0);
  }

  get permissionCount(): number {
    if (!this.selectedRole || !this.selectedRole.permissions) return 0;
    return this.modules.reduce((total, module) => 
      total + (this.selectedRole.permissions[module]?.length ?? 0), 0);
  }

  hasPermission(module: string, action: string): boolean {
    return this.selectedRole?.permissions?.[module]?.includes(action) ?? false;
  }

  togglePermission(module: string, action: string, checked: boolean): void {
    if (!this.selectedRole || this.selectedRole.id === 1) return; 

    const permissions = this.selectedRole.permissions[module] ?? [];
    this.selectedRole.permissions[module] = checked
      ? [...new Set([...permissions, action])]
      : permissions.filter(item => item !== action);

    this.http.put(`https://vendoriq-platform.onrender.com/roles/${this.selectedRole.id}`, this.selectedRole, { headers: this.getHeaders() })
      .subscribe({
        next: () => this.logActivity(`Changed permissions for role: ${this.selectedRole.name}`),
        error: (err) => console.error('Error updating permissions', err)
      });
  }

  openCreateRole(): void {
    this.editingRoleId = null;
    this.newRoleName = '';
    this.newRoleDescription = '';
    this.showRoleForm = true;
  }

  openEditRole(role: Role): void {
    if (role.id === 1) return;
    this.editingRoleId = role.id;
    this.newRoleName = role.name;
    this.newRoleDescription = role.description;
    this.showRoleForm = true;
  }

  // --- NAYA FUNCTION: Activity chupchap database me save karne ke liye ---
  logActivity(actionMessage: string, logSeverity: string = 'Info', logStatus: string = 'Success') {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    
    const logData = {
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19), 
      user: localStorage.getItem('name') || 'Admin',
      action: actionMessage,
      module: 'Role & Permission',
      severity: logSeverity,
      status: logStatus
    };

    this.http.post('https://vendoriq-platform.onrender.com/activity-logs', logData, { headers }).subscribe({
      error: (err) => console.error('Activity log error:', err)
    });
  }

  // --- UPDATED saveRole FUNCTION ---
  saveRole(): void {
    const name = this.newRoleName.trim();
    if (!name) { alert('Please enter a role name.'); return; }

    const isEdit = this.editingRoleId !== null;
    let rolePayload: any = {
      name,
      description: this.newRoleDescription.trim(),
    };

    if (isEdit) {
      const existingRole = this.roles.find(r => r.id === this.editingRoleId);
      rolePayload = { ...existingRole, ...rolePayload };
      this.http.put(`https://vendoriq-platform.onrender.com/roles/${this.editingRoleId}`, rolePayload, { headers: this.getHeaders() })
        .subscribe(() => { 
          this.fetchRoles(); 
          this.showRoleForm = false; 
          this.logActivity(`Updated role: ${name}`); // LOG
        });
    } else {
      rolePayload = {
        ...rolePayload, users: 0, level: 'Custom', color: 'blue', permissions: {}
      };
      this.http.post('https://vendoriq-platform.onrender.com/roles', rolePayload, { headers: this.getHeaders() })
        .subscribe(() => { 
          this.fetchRoles(); 
          this.showRoleForm = false; 
          this.logActivity(`Created new role: ${name}`, 'Info', 'Success'); // LOG
        });
    }
  }

  // --- UPDATED deleteRole FUNCTION ---
  deleteRole(role: Role): void {
    if (role.id === 1) { alert('The Super Administrator role cannot be deleted.'); return; }
    if (!confirm(`Delete the role "${role.name}"?`)) return;

    this.http.delete(`https://vendoriq-platform.onrender.com/roles/${role.id}`, { headers: this.getHeaders() })
      .subscribe(() => {
        this.selectedRoleId = 1;
        this.fetchRoles();
        this.logActivity(`Deleted role: ${role.name}`, 'Critical', 'Success'); // LOG
      });
  }
}