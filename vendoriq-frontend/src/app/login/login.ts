import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  email = '';
  password = '';
  errorMessage = '';

  constructor(private http: HttpClient, private router: Router) {}

  onLogin(event: Event) {
    event.preventDefault(); 
    this.errorMessage = '';

    const body = {
      email: this.email,
      password: this.password
    };

    this.http.post<any>('http://127.0.0.1:8000/users/login', body)
      .subscribe({
        next: (res) => {
          localStorage.setItem('access_token', res.access_token);
          localStorage.setItem('role', res.role || 'Admin'); 
          localStorage.setItem('name', res.name || 'Admin User'); 
          
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.errorMessage = 'Invalid email or password. Please try again.';
          console.error('Login failed:', err);
        }
      });
  }
}