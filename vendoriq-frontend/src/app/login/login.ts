import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth'; 
import { Router } from '@angular/router'; // Router import kiya

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email = '';
  password = '';

  // Router ko constructor me add kiya
  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    if (this.email && this.password) {
      this.authService.login(this.email, this.password).subscribe({
        next: (response: any) => {
          localStorage.setItem('access_token', response.access_token);
          
          // Naya message
          alert('Authentication Successful. Redirecting to Dashboard...'); 
          
          // Dashboard par bhejne ka code
          this.router.navigate(['/dashboard']); 
        },
        error: (error) => {
          console.error('Authentication Failed', error);
          alert('Authentication Failed: Invalid credentials or server error. Please try again.');
        }
      });
    } else {
      alert('Validation Error: Please provide both email and password.');
    }
  }
}