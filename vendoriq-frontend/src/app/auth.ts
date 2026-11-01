import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment'; // <-- Ye line add karni hai (VS Code apne aap sahi path adjust kar lega agar error aaye)

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Hardcoded localhost ki jagah ab ye environment file se live Render URL uthayega
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  login(email: string, password: string) {
    const body = new URLSearchParams();
    body.set('username', email);
    body.set('password', password);

    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded'
      })
    };

    return this.http.post(`${this.apiUrl}/users/login`, body.toString(), options);
  }
}