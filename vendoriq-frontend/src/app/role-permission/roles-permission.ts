
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  imports: [CommonModule, FormsModule],
  templateUrl: './roles-permission.html',
  styleUrl: './roles-permission.css'
})
export class RolesPermissionComponent {
  private readonly storageKey = 'vendoriq-role-permissions-v1';

  searchTerm = '';
  selectedRoleId = 1;
  showRoleForm = false;
  editingRoleId: number | null = null;
  newRoleName = '';
  newRoleDescription = '';

  modules = [
    'Dashboard',
    'User Management',
    'Vendors',
    'Products',
    'Procurement',
    'Purchase Orders',
    'Deliveries',
    'Invoices & Payments',
    'Quality Inspection',
    'Communications',
    'Contracts & Compliance',
    'Performance & Reliability',
    'Reports & Analytics',
    'Notifications',
    'System / Activity Logs',
    'Role & Permission',
    'System Settings'
  ];

  actions = ['View', 'Create', 'Edit', 'Delete'];

  private createDefaultRoles(): Role[] {
    const definitions = [
      {
        id: 1,
        name: 'Super Administrator',
        description: 'Full platform access and administration',
        users: 1,
        level: 'Critical',
        color: 'purple'
      },
      {
        id: 2,
        name: 'Procurement Manager',
        description: 'Manages purchasing and vendor relationships',
        users: 4,
        level: 'High',
        color: 'blue'
      },
      {
        id: 3,
        name: 'Finance Manager',
        description: 'Manages invoices, payments and budgets',
        users: 3,
        level: 'High',
        color: 'green'
      },
      {
        id: 4,
        name: 'Auditor',
        description: 'Reviews compliance and platform activity',
        users: 2,
        level: 'Medium',
        color: 'orange'
      },
      {
        id: 5,
        name: 'Supply Chain Manager',
        description: 'Monitors deliveries, inventory and suppliers',
        users: 5,
        level: 'High',
        color: 'cyan'
      }
    ];

    return definitions.map(definition => {
      const permissions: { [module: string]: string[] } = {};

      this.modules.forEach(module => {
        permissions[module] = definition.id === 1
          ? [...this.actions]
          : ['View'];
      });

      return { ...definition, permissions };
    });
  }

  roles: Role[] = this.createDefaultRoles();

  constructor() {
    this.loadRoles();
  }

  private loadRoles(): void {
    try {
      const saved = localStorage.getItem(this.storageKey);

      if (!saved) {
        this.persistRoles();
        return;
      }

      const parsed: unknown = JSON.parse(saved);

      if (!Array.isArray(parsed)) {
        this.persistRoles();
        return;
      }

      const validRoles = parsed.filter((role: any) =>
        role &&
        Number.isInteger(role.id) &&
        typeof role.name === 'string' &&
        typeof role.description === 'string' &&
        role.permissions &&
        typeof role.permissions === 'object'
      ) as Role[];

      if (!validRoles.some(role => role.id === 1)) {
        this.roles = this.createDefaultRoles();
        this.persistRoles();
        return;
      }

      this.roles = validRoles.map(role => {
        const permissions: { [module: string]: string[] } = {};

        this.modules.forEach(module => {
          const savedActions = role.permissions[module];

          permissions[module] = Array.isArray(savedActions)
            ? savedActions.filter(action => this.actions.includes(action))
            : [];
        });

        // The built-in administrator role always has all demo permissions.
        if (role.id === 1) {
          this.modules.forEach(module => {
            permissions[module] = [...this.actions];
          });
        }

        return {
          ...role,
          users: Number.isFinite(role.users) ? role.users : 0,
          permissions
        };
      });

      if (!this.roles.some(role => role.id === this.selectedRoleId)) {
        this.selectedRoleId = this.roles[0]?.id ?? 1;
      }
    } catch {
      // If stored data cannot be read, use the default roles.
      this.roles = this.createDefaultRoles();
    }
  }

  private persistRoles(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.roles));
    } catch {
      alert('Could not save changes in browser storage.');
    }
  }

  get filteredRoles(): Role[] {
    const term = this.searchTerm.toLowerCase().trim();

    return this.roles.filter(role =>
      role.name.toLowerCase().includes(term) ||
      role.description.toLowerCase().includes(term)
    );
  }

  get selectedRole(): Role {
    return this.roles.find(role => role.id === this.selectedRoleId)
      ?? this.roles[0];
  }

  get totalAssignedUsers(): number {
    return this.roles.reduce((total, role) => total + role.users, 0);
  }

  get permissionCount(): number {
    if (!this.selectedRole) {
      return 0;
    }

    return this.modules.reduce((total, module) =>
      total + (this.selectedRole.permissions[module]?.length ?? 0), 0);
  }

  hasPermission(module: string, action: string): boolean {
    return this.selectedRole?.permissions[module]?.includes(action) ?? false;
  }

  togglePermission(module: string, action: string, checked: boolean): void {
    if (!this.selectedRole || this.selectedRole.id === 1) {
      return;
    }

    const permissions = this.selectedRole.permissions[module] ?? [];

    this.selectedRole.permissions[module] = checked
      ? [...new Set([...permissions, action])]
      : permissions.filter(item => item !== action);

    this.persistRoles();
  }

  openCreateRole(): void {
    this.editingRoleId = null;
    this.newRoleName = '';
    this.newRoleDescription = '';
    this.showRoleForm = true;
  }

  openEditRole(role: Role): void {
    if (role.id === 1) {
      return;
    }

    this.editingRoleId = role.id;
    this.newRoleName = role.name;
    this.newRoleDescription = role.description;
    this.showRoleForm = true;
  }

  saveRole(): void {
    const name = this.newRoleName.trim();

    if (!name) {
      alert('Please enter a role name.');
      return;
    }

    const duplicate = this.roles.some(role =>
      role.name.toLowerCase() === name.toLowerCase() &&
      role.id !== this.editingRoleId
    );

    if (duplicate) {
      alert('A role with this name already exists.');
      return;
    }

    if (this.editingRoleId !== null) {
      const role = this.roles.find(item => item.id === this.editingRoleId);

      if (role) {
        role.name = name;
        role.description = this.newRoleDescription.trim();
      }
    } else {
      const permissions: { [module: string]: string[] } = {};

      this.modules.forEach(module => {
        permissions[module] = [];
      });

      const role: Role = {
        id: Math.max(0, ...this.roles.map(item => item.id)) + 1,
        name,
        description: this.newRoleDescription.trim(),
        users: 0,
        level: 'Custom',
        color: 'blue',
        permissions
      };

      this.roles.push(role);
      this.selectedRoleId = role.id;
    }

    this.persistRoles();
    this.showRoleForm = false;
  }

  deleteRole(role: Role): void {
    if (role.id === 1) {
      alert('The Super Administrator role cannot be deleted.');
      return;
    }

    if (!confirm(`Delete the role "${role.name}"?`)) {
      return;
    }

    this.roles = this.roles.filter(item => item.id !== role.id);

    if (this.selectedRoleId === role.id) {
      this.selectedRoleId = this.roles[0]?.id ?? 1;
    }

    this.persistRoles();
  }
}
