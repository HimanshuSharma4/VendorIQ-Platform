import { Component } from '@angular/core';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
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
    event.preventDefault(); // Page refresh hone se rokne ke liye
    this.errorMessage = '';

    // FastAPI ko data 'application/x-www-form-urlencoded' format me chahiye hota hai
    const body = new URLSearchParams();
    body.set('username', this.email);
    body.set('password', this.password);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    this.http.post<any>('http://127.0.0.1:8000/users/login', body.toString(), { headers })
      .subscribe({
        next: (res) => {
          // Token save karein
          localStorage.setItem('access_token', res.access_token);
          
          // 300ms ka chhota delay taaki token properly save ho jaye uske baad hi page redirect ho
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