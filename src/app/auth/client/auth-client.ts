import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AccAndRefresh } from '../model/acc-and-refresh';
import { Credential } from '../model/credential';
import { LoginResponse } from '../model/login-response';

@Injectable({
  providedIn: 'root',
})
export class AuthClient {
  private http = inject(HttpClient);

  private loginUrl: string = 'http://localhost:8080/api/bff-web-app/auth/login';
  private resetPasswordUrl: string = 'http://localhost:8080/api/bff-web-app/auth/reset';
  private refreshUrl: string = 'http://localhost:8080/api/bff-web-app/auth/refresh';

  login(credential: Credential): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(this.loginUrl, credential);
  }

  resetPassword(credential: Credential): Observable<void> {
    return this.http.post<void>(this.resetPasswordUrl, credential);
  }

  refresh(payload: { refreshToken: string }): Observable<ApiResponse<AccAndRefresh>> {
    return this.http.post<ApiResponse<AccAndRefresh>>(this.refreshUrl, payload);
  }
}
