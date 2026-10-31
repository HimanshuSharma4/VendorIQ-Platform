import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-system-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  template: `
    <div class="dashboard-container" style="padding: 24px; max-width: 1200px; margin: 0 auto;">
      
      <!-- Header -->
      <div style="margin-bottom: 24px;">
        <h2 style="margin: 0; font-size: 24px; color: #1e293b;">System Settings</h2>
        <p style="margin-top: 5px; color: #64748b;">Manage global platform configurations and security policies.</p>
      </div>

      <div style="display: flex; gap: 24px;">
        <!-- Sidebar Navigation -->
        <div style="width: 250px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 10px;">
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li (click)="activeTab = 'general'" [class.active-tab]="activeTab === 'general'" class="settings-tab">
              🏢 General
            </li>
            <li (click)="activeTab = 'security'" [class.active-tab]="activeTab === 'security'" class="settings-tab">
              🔒 Security & Access
            </li>
            <li (click)="activeTab = 'notifications'" [class.active-tab]="activeTab === 'notifications'" class="settings-tab">
              🔔 Notifications
            </li>
          </ul>
        </div>

        <!-- Main Content Area -->
        <div style="flex: 1; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 24px;">
          
          <div *ngIf="isLoading" style="color: gray;">Loading settings...</div>

          <form *ngIf="!isLoading" (ngSubmit)="saveSettings()">
            
            <!-- GENERAL SETTINGS -->
            <div *ngIf="activeTab === 'general'">
              <h3 style="margin-top: 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">General Information</h3>
              
              <div class="form-group">
                <label>Platform Name</label>
                <input type="text" [(ngModel)]="settings.platform_name" name="platform_name" class="form-control">
              </div>

              <div class="form-group">
                <label>Support Email</label>
                <input type="email" [(ngModel)]="settings.company_email" name="company_email" class="form-control">
              </div>

              <div style="display: flex; gap: 16px;">
                <div class="form-group" style="flex: 1;">
                  <label>Default Currency</label>
                  <select [(ngModel)]="settings.currency" name="currency" class="form-control">
                    <option value="INR (₹)">INR (₹)</option>
                    <option value="USD ($)">USD ($)</option>
                    <option value="EUR (€)">EUR (€)</option>
                  </select>
                </div>
                <div class="form-group" style="flex: 1;">
                  <label>Timezone</label>
                  <select [(ngModel)]="settings.timezone" name="timezone" class="form-control">
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="UTC">UTC Standard Time</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- SECURITY SETTINGS -->
            <div *ngIf="activeTab === 'security'">
              <h3 style="margin-top: 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Security Policies</h3>
              
              <div class="form-group">
                <label>Session Timeout (Minutes)</label>
                <input type="number" [(ngModel)]="settings.session_timeout_minutes" name="session_timeout" class="form-control">
                <small style="color: gray;">Users will be logged out automatically after this period of inactivity.</small>
              </div>

              <div class="form-check" style="margin-top: 20px;">
                <input type="checkbox" [(ngModel)]="settings.enable_2fa" name="enable_2fa" id="2fa">
                <label for="2fa" style="margin-left: 8px; font-weight: 500;">Require Two-Factor Authentication (2FA) for Admins</label>
              </div>

              <div class="form-check" style="margin-top: 15px; padding: 12px; background: #fff5f5; border: 1px solid #feb2b2; border-radius: 6px;">
                <input type="checkbox" [(ngModel)]="settings.maintenance_mode" name="maintenance_mode" id="maintenance">
                <label for="maintenance" style="margin-left: 8px; font-weight: bold; color: #c53030;">Enable Maintenance Mode</label>
                <p style="margin: 4px 0 0 24px; font-size: 12px; color: #c53030;">Blocks all non-admin users from accessing the platform.</p>
              </div>
            </div>

            <!-- NOTIFICATION SETTINGS -->
            <div *ngIf="activeTab === 'notifications'">
              <h3 style="margin-top: 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Notification Preferences</h3>
              
              <div class="form-check" style="margin-top: 15px;">
                <input type="checkbox" [(ngModel)]="settings.email_notifications" name="email_alerts" id="email_alerts">
                <label for="email_alerts" style="margin-left: 8px; font-weight: 500;">Enable System Email Alerts</label>
                <p style="margin: 4px 0 0 24px; font-size: 12px; color: gray;">Send automatic emails for new Purchase Orders and Vendor actions.</p>
              </div>
            </div>

            <!-- ACTION BUTTONS -->
            <div style="margin-top: 30px; display: flex; justify-content: flex-end; border-top: 1px solid #e2e8f0; padding-top: 20px;">
              <button type="submit" class="save-btn" [disabled]="isSaving">
                {{ isSaving ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
            
            <div *ngIf="successMessage" style="margin-top: 15px; color: green; text-align: right; font-weight: 500;">
              {{ successMessage }}
            </div>

          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-tab {
      padding: 12px 16px;
      cursor: pointer;
      border-radius: 6px;
      margin-bottom: 4px;
      color: #475569;
      font-weight: 500;
      transition: all 0.2s;
    }
    .settings-tab:hover {
      background: #f1f5f9;
    }
    .active-tab {
      background: #eff6ff !important;
      color: #2563eb;
      font-weight: 600;
    }
    .form-group {
      margin-bottom: 20px;
    }
    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #334155;
    }
    .form-control {
      width: 100%;
      padding: 10px;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 14px;
    }
    .form-control:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    .save-btn {
      background: #4f46e5;
      color: white;
      border: none;
      padding: 10px 24px;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    .save-btn:hover {
      background: #4338ca;
    }
    .save-btn:disabled {
      background: #94a3b8;
      cursor: not-allowed;
    }
  `]
})
export class SystemSettingsComponent implements OnInit {
  activeTab = 'general';
  isLoading = true;
  isSaving = false;
  successMessage = '';

  settings: any = {
    platform_name: '',
    company_email: '',
    currency: 'INR (₹)',
    timezone: 'Asia/Kolkata',
    session_timeout_minutes: 30,
    enable_2fa: false,
    email_notifications: true,
    maintenance_mode: false
  };

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.fetchSettings();
  }

  getHeaders() {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  logActivity(actionMessage: string, logSeverity: string = 'Info', logStatus: string = 'Success') {
    const logData = {
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19), 
      user: localStorage.getItem('name') || 'Admin',
      action: actionMessage,
      module: 'System Settings',
      severity: logSeverity,
      status: logStatus
    };
    this.http.post('http://127.0.0.1:8000/activity-logs', logData, { headers: this.getHeaders() }).subscribe();
  }

  fetchSettings() {
    this.isLoading = true;
    this.http.get('http://127.0.0.1:8000/system-settings', { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.settings = data;
          this.isLoading = false;
          this.cdr.detectChanges(); 
        },
        error: (err) => {
          console.error("Error fetching settings", err);
          this.isLoading = false;
          this.cdr.detectChanges(); 
        }
      });
  }

  saveSettings() {
    this.isSaving = true;
    this.successMessage = '';

    this.http.put('http://127.0.0.1:8000/system-settings', this.settings, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.successMessage = 'Settings saved successfully!';
          
          this.logActivity('Updated global system settings', 'Info', 'Success');
          this.cdr.detectChanges(); 
          
          setTimeout(() => {
            this.successMessage = '';
            this.cdr.detectChanges(); 
          }, 3000);
        },
        error: (err) => {
          console.error("Error saving settings", err);
          this.isSaving = false;
          alert('Failed to save settings.');
          this.cdr.detectChanges();
        }
      });
  }
}