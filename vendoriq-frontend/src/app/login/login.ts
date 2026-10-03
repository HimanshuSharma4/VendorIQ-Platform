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

    // NAYA: Ab hum URLSearchParams ki jagah sidha JSON object bhej rahe hain
    const body = {
      email: this.email,
      password: this.password
    };

    // Headers set karne ki zaroorat nahi, HttpClient JSON ke liye automatically set kar deta hai
    this.http.post<any>('http://127.0.0.1:8000/users/login', body)
      .subscribe({
        next: (res) => {
          // Token save karein
          localStorage.setItem('access_token', res.access_token);
          
          // 300ms delay redirect ke liye
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 300);
        },
        error: (err) => {
          this.errorMessage = 'Invalid email or password. Please try again.';
          console.error('Login failed:', err);
        }
      });
  }
}