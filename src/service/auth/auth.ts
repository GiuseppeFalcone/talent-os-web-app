import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { AccAndRefresh } from '../../response/auth/acc-and-refresh';
import { Credential } from '../../response/auth/credential';
import { LoginResponse } from '../../response/auth/login-response';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private accessToken = new BehaviorSubject<string | null>(null);
  private readonly REFRESH_TOKEN = '';

  private isRefreshing = false;

  private loginUrl: string = 'http://localhost:8080/api/bff-web-app/auth/login';
  private resetPasswordUrl: string = 'http://localhost:8080/api/bff-web-app/auth/reset';
  private refreshUrl: string = 'http://localhost:8080/api/bff-web-app/auth/login/refresh';

  getAccessToken(): string | null {
    return this.accessToken.getValue();
  }

  private setAccessToken(token: string | null) {
    this.accessToken.next(token);
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN);
  }

  private setRefreshToken(token: string | null) {
    if (token) {
      sessionStorage.setItem(this.REFRESH_TOKEN, token);
    } else {
      sessionStorage.removeItem(this.REFRESH_TOKEN);
    }
  }

  isLoggedIn(): Observable<string | null> {
    return this.accessToken.asObservable();
  }

  login(username: string, password: string): Observable<ApiResponse<LoginResponse>> {
    const credential: Credential = { username, password };
    return this.http.post<ApiResponse<LoginResponse>>(this.loginUrl, credential).pipe(
      tap((response) => {
        this.setAccessToken(response.data.accessToken);
        this.setRefreshToken(response.data.refreshToken);
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    this.setAccessToken(null);
    this.setRefreshToken(null);
    this.router.navigate(['/']);
  }

  resetPassword(username: string, password: string): Observable<void> {
    const credential: Credential = { username, password };
    return this.http.post<void>(this.resetPasswordUrl, credential);
  }

  handleRefresh(): Observable<any> {
    if (this.isRefreshing) {
      return throwError(() => new Error('Refresh already in progress'));
    }

    const currentRefreshToken = this.getRefreshToken();
    if (!currentRefreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    this.isRefreshing = true;

    const payload = { refreshToken: currentRefreshToken };

    return this.http.post<ApiResponse<AccAndRefresh>>(this.refreshUrl, payload).pipe(
      tap((response) => {
        this.setAccessToken(response.data.accessToken);
        this.setRefreshToken(response.data.refreshToken);
        this.isRefreshing = false;
      }),
      catchError((error) => {
        this.isRefreshing = false;
        this.logout();
        return throwError(() => error);
      })
    );
  }
}

// todo: still need to save acc and refresh tokens in local storage ???
