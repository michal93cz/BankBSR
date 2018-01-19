import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable()
export class AuthService {
  private AUTH_KEY = 'Authorization';

  constructor(private http: HttpClient, private router: Router) { }

  logIn(username: string, password: string) {
    const authToken = 'Basic ' + btoa(username + ':' + password);

    return this.http
      .get('/api/accounts', {
        headers: new HttpHeaders().set(this.AUTH_KEY, authToken)
      })
      .map((value) => {
        sessionStorage.setItem(this.AUTH_KEY, authToken);
        return value;
      });
  }

  logOut() {
    sessionStorage.removeItem(this.AUTH_KEY);
    this.router.navigate(['/login']);
  }

  isLogIn() {
    return !!sessionStorage.getItem(this.AUTH_KEY);
  }

  getAuthHeaders(headers?) {
    return headers ? new HttpHeaders(headers).set(this.AUTH_KEY, sessionStorage.getItem(this.AUTH_KEY))
    : new HttpHeaders().set(this.AUTH_KEY, sessionStorage.getItem(this.AUTH_KEY));
  }
}
