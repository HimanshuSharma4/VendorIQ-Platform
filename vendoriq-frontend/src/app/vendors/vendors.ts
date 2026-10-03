import { Component, OnInit, Inject } from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common'; 
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-vendor-dialog',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    MatDialogModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, FormsModule, CommonModule,
    MatDatepickerModule, MatNativeDateModule
  ],
  template: `
    <h2 mat-dialog-title>{{ isEditMode ? 'Edit Vendor Details' : 'Add New Vendor' }}</h2>
    <mat-dialog-content style="display: flex; flex-direction: column; gap: 15px; padding-top: 10px;">
      
      <div style="display: flex; gap: 16px;">
        <mat-form-field appearance="outline" style="flex: 2;">
          <mat-label>Vendor Name</mat-label>
          <input matInput [(ngModel)]="vendorData.vendor_name" required>
        </mat-form-field>

        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Category</mat-label>
          <input matInput [(ngModel)]="vendorData.category">
        </mat-form-field>
      </div>

      <div style="display: flex; gap: 16px;">
        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Contact Person</mat-label>
          <input matInput [(ngModel)]="vendorData.contact_person">
        </mat-form-field>

        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Email</mat-label>
          <input matInput type="email" [(ngModel)]="vendorData.email">
        </mat-form-field>
      </div>

      <!-- Advance Country Dropdown with Working Search -->
      <div style="display: flex; gap: 16px;">
        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Country</mat-label>
          <mat-select [(ngModel)]="vendorData.country" (selectionChange)="onCountryChange()">
            <input type="text" placeholder="Search Country..." [(ngModel)]="searchCountryText" (ngModelChange)="filterCountries()" 
                   style="width: 90%; margin: 10px; padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
            <mat-option *ngFor="let country of filteredCountries" [value]="country.name">
               {{country.flag}} {{country.name}}
            </mat-option>
          </mat-select>
        </mat-form-field>
        
        <!-- Phone with auto Country Code -->
        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Phone Number</mat-label>
          <span matTextPrefix style="margin-right: 5px; color: gray;">{{dialCode}} </span>
          <input matInput type="tel" [(ngModel)]="vendorData.phone" maxlength="10">
        </mat-form-field>
      </div>

      <!-- Dependent State and City Dropdowns -->
      <div style="display: flex; gap: 16px;">
        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>State / Province</mat-label>
          <mat-select [(ngModel)]="vendorData.state" (selectionChange)="onStateChange()" [disabled]="!vendorData.country">
             <mat-option *ngFor="let state of availableStates" [value]="state.name">
              {{state.name}}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>City</mat-label>
          <mat-select [(ngModel)]="vendorData.city" [disabled]="!vendorData.state">
            <mat-option *ngFor="let city of availableCities" [value]="city">
              {{city}}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>GST Number</mat-label>
          <input matInput [(ngModel)]="vendorData.gst_number" style="text-transform: uppercase;">
        </mat-form-field>
      </div>

      <div style="display: flex; gap: 16px;">
        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Status</mat-label>
          <mat-select [(ngModel)]="vendorData.status">
            <mat-option value="Active">Active</mat-option>
            <mat-option value="Inactive">Inactive</mat-option>
            <mat-option value="Blacklisted">Blacklisted</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Registration Date</mat-label>
          <input matInput [matDatepicker]="regPicker" [(ngModel)]="vendorData.registration_date" readonly (click)="regPicker.open()">
          <mat-datepicker-toggle matSuffix [for]="regPicker"></mat-datepicker-toggle>
          <mat-datepicker #regPicker></mat-datepicker>
        </mat-form-field>
      </div>

    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="saveVendor()">
        {{ isEditMode ? 'Update Vendor' : 'Save Vendor' }}
      </button>
    </mat-dialog-actions>
  `
})
export class VendorDialog implements OnInit {
  vendorData: any = {
    vendor_name: '',
    category: '',
    contact_person: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    country: '', 
    gst_number: '',
    status: 'Active',
    registration_date: new Date()
  };
  
  isEditMode = false;
  
  // Hardcoded Data Structure for Reliability
  globalLocationData = [
    {
      name: 'India', flag: '🇮🇳', code: '+91',
      states: [
        { name: 'Haryana', cities: ['Ambala', 'Gurugram', 'Mullana', 'Karnal', 'Panipat'] },
        { name: 'Maharashtra', cities: ['Mumbai', 'Pune', 'Nagpur'] },
        { name: 'Delhi', cities: ['New Delhi', 'Dwarka'] },
        { name: 'Karnataka', cities: ['Bengaluru', 'Mysuru'] }
      ]
    },
    {
      name: 'United States', flag: '🇺🇸', code: '+1',
      states: [
        { name: 'California', cities: ['San Francisco', 'Los Angeles', 'San Diego'] },
        { name: 'New York', cities: ['New York City', 'Buffalo'] },
        { name: 'Texas', cities: ['Austin', 'Dallas', 'Houston'] }
      ]
    },
    {
      name: 'Japan', flag: '🇯🇵', code: '+81',
      states: [
        { name: 'Tokyo', cities: ['Shinjuku', 'Shibuya', 'Chiyoda'] },
        { name: 'Osaka', cities: ['Osaka City', 'Sakai'] }
      ]
    },
    {
      name: 'Germany', flag: '🇩🇪', code: '+49',
      states: [
        { name: 'Bavaria', cities: ['Munich', 'Nuremberg'] },
        { name: 'Berlin', cities: ['Berlin City'] }
      ]
    },
    {
      name: 'Australia', flag: '🇦🇺', code: '+61',
      states: [
        { name: 'New South Wales', cities: ['Sydney', 'Newcastle'] },
        { name: 'Victoria', cities: ['Melbourne', 'Geelong'] }
      ]
    },
    {
      name: 'United Kingdom', flag: '🇬🇧', code: '+44',
      states: [
        { name: 'England', cities: ['London', 'Manchester', 'Birmingham'] },
        { name: 'Scotland', cities: ['Edinburgh', 'Glasgow'] }
      ]
    },
    {
      name: 'Canada', flag: '🇨🇦', code: '+1',
      states: [
        { name: 'Ontario', cities: ['Toronto', 'Ottawa'] },
        { name: 'British Columbia', cities: ['Vancouver', 'Victoria'] }
      ]
    }
  ];

  filteredCountries: any[] = [];
  searchCountryText: string = '';
  dialCode: string = '';
  availableStates: any[] = [];
  availableCities: string[] = [];

  constructor(
    private dialogRef: MatDialogRef<VendorDialog>, 
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.filteredCountries = [...this.globalLocationData];

    if (data && data.vendor) {
      this.vendorData = { ...data.vendor };
      if (this.vendorData.registration_date) {
        this.vendorData.registration_date = new Date(this.vendorData.registration_date);
      }
      this.isEditMode = true;

      // Populate dropdowns based on existing data
      if (this.vendorData.country) {
         const countryObj = this.globalLocationData.find(c => c.name === this.vendorData.country);
         if (countryObj) {
            this.dialCode = countryObj.code;
            this.availableStates = countryObj.states;
            const stateObj = countryObj.states.find(s => s.name === this.vendorData.state);
            if(stateObj){
              this.availableCities = stateObj.cities;
            }
         }
      }
    }
  }

  ngOnInit() {}

  filterCountries() {
    if (!this.searchCountryText) {
      this.filteredCountries = [...this.globalLocationData];
      return;
    }
    const search = this.searchCountryText.toLowerCase();
    this.filteredCountries = this.globalLocationData.filter(c => 
      c.name.toLowerCase().includes(search)
    );
  }

  onCountryChange() {
    this.vendorData.state = '';
    this.vendorData.city = '';
    this.availableCities = [];
    
    const countryObj = this.globalLocationData.find(c => c.name === this.vendorData.country);
    if (countryObj) {
      this.dialCode = countryObj.code;
      this.availableStates = countryObj.states;
    } else {
      this.dialCode = '';
      this.availableStates = [];
    }
  }

  onStateChange() {
    this.vendorData.city = '';
    const countryObj = this.globalLocationData.find(c => c.name === this.vendorData.country);
    if(countryObj) {
       const stateObj = countryObj.states.find(s => s.name === this.vendorData.state);
       if(stateObj){
         this.availableCities = stateObj.cities;
       } else {
         this.availableCities = [];
       }
    }
  }

  formatDate(date: any): string | null {
    if (!date) return null;
    const d = new Date(date);
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${d.getFullYear()}-${month}-${day}`;
  }

  saveVendor() {
    if (!this.vendorData.vendor_name) {
      alert("Vendor Name is required.");
      return;
    }

    if (this.vendorData.email) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(this.vendorData.email)) {
        alert("Please enter a valid email address.");
        return;
      }
    }

    if (this.vendorData.phone) {
      const phonePattern = /^[0-9]{10}$/;
      if (!phonePattern.test(this.vendorData.phone)) {
        alert("Please enter a valid 10-digit phone number.");
        return;
      }
    }

    if (this.vendorData.gst_number) {
      this.vendorData.gst_number = this.vendorData.gst_number.toUpperCase();
    }

    const payload = { ...this.vendorData };
    payload.registration_date = this.formatDate(this.vendorData.registration_date);

    if (this.isEditMode) {
      this.http.put(`http://127.0.0.1:8000/vendors/${payload.vendor_id}`, payload).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => alert('Error updating vendor')
      });
    } else {
      this.http.post('http://127.0.0.1:8000/vendors', payload).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => alert('Error saving vendor')
      });
    }
  }
}

@Component({
  selector: 'app-vendors',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, HttpClientModule, CommonModule, MatDialogModule],
  templateUrl: './vendors.html'
})
export class VendorsComponent implements OnInit {
  displayedColumns: string[] = [
    'vendor_id', 'vendor_name', 'category', 'contact_person', 'email', 
    'phone', 'city', 'gst_number', 'status', 'registration_date', 'actions'
  ];
  dataSource = new MatTableDataSource<any>([]);

  constructor(private http: HttpClient, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.fetchVendors();
  }

  fetchVendors(): void {
    this.http.get<any[]>('http://127.0.0.1:8000/vendors').subscribe({
      next: (data) => this.dataSource.data = data
    });
  }

  openAddVendorDialog(vendor?: any): void {
    const dialogRef = this.dialog.open(VendorDialog, { 
      width: '750px',
      data: { vendor: vendor } 
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.fetchVendors();
    });
  }

  deleteVendor(id: number): void {
    if (confirm('Are you sure you want to delete this Vendor? Warning: Linked Products and POs might be affected!')) {
      this.http.delete(`http://127.0.0.1:8000/vendors/${id}`).subscribe({
        next: () => this.fetchVendors(),
        error: (err) => alert('Error deleting vendor')
      });
    }
  }
}