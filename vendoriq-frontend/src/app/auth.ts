import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Hamare FastAPI backend ka address
  private apiUrl = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient) { }

  // Ye function backend ko Email aur Password bhejega
  login(email: string, password: string) {
    // FastAPI ko data form format me chahiye hota hai (JSON nahi)
    const body = new URLSearchParams();
    body.set('username', email);
    body.set('password', password);

    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded'
      })
    };

    // POST request bhej rahe hain /users/login par
    return this.http.post(`${this.apiUrl}/users/login`, body.toString(), options);
  }
}