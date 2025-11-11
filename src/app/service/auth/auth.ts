import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Credential } from '../../../dto/auth/credential';
import { LoginResponse } from '../../../dto/auth/login-response';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  private loginUrl: string = 'http://localhost:8080/api/bff-web-app/auth/login';
  private resetPasswordUrl: string = 'http://localhost:8080/api/bff-web-app/auth/reset';

  login(username: string, password: string): Observable<LoginResponse> {
    const credential: Credential = { username, password };
    return this.http.post<LoginResponse>(this.loginUrl, credential);
  }

  resetPassword(username: string, password: string): Observable<void> {
    const credential: Credential = { username, password };
    return this.http.post<void>(this.resetPasswordUrl, credential);
  }
}

// todo: still need to save acc and refresh tokens in local storage ???
