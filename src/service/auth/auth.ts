import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { AccAndRefresh } from '../../response/auth/acc-and-refresh';
import { Credential } from '../../response/auth/credential';
import { LoginResponse } from '../../response/auth/login-response';
import { UserLighDto } from '../../response/dto/user/user-light-dto';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly REFRESH_TOKEN_KEY = 'easycv:refresh-token';
  private readonly USER_KEY = 'easycv:user';

  private accessToken = signal<string | null>(null);
  private currentUser = signal<UserLighDto | null>(null);

  private isRefreshing = false;
  readonly isLoggedIn = computed(() => !!this.currentUser());
  readonly user = computed(() => this.currentUser());
  readonly userRole = computed(() => this.currentUser()?.role ?? null);

  private loginUrl: string = 'http://localhost:8080/api/bff-web-app/auth/login';
  private resetPasswordUrl: string = 'http://localhost:8080/api/bff-web-app/auth/reset';
  private refreshUrl: string = 'http://localhost:8080/api/bff-web-app/auth/login/refresh';

  constructor() {
    const savedUser = sessionStorage.getItem(this.USER_KEY);
    if (savedUser) {
      this.currentUser.set(JSON.parse(savedUser));
    }
  }

  getAccessToken(): string | null {
    return this.accessToken();
  }

  private setAccessToken(token: string | null) {
    this.accessToken.set(token);
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  private setRefreshToken(token: string | null) {
    if (token) {
      sessionStorage.setItem(this.REFRESH_TOKEN_KEY, token);
    } else {
      sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
    }
  }

  private setCurrentUser(user: UserLighDto | null) {
    this.currentUser.set(user);
    if (user) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.USER_KEY);
    }
  }

  login(username: string, password: string): Observable<ApiResponse<LoginResponse>> {
    const credential: Credential = { username, password };
    return this.http.post<ApiResponse<LoginResponse>>(this.loginUrl, credential).pipe(
      tap((response) => {
        this.setCurrentUser(response.data.userLighDto);
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
    this.setCurrentUser(null);
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
