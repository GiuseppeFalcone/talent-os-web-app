import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { UserLightDto } from '../../dashboard/model/user-light-dto';
import { AuthClient } from '../client/auth-client';
import { Credential } from '../model/credential';
import { LoginResponse } from '../model/login-response';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authClient = inject(AuthClient);
  private router = inject(Router);

  private readonly REFRESH_TOKEN_KEY = 'talentos:refresh-token';
  private readonly ACCESS_TOKEN_KEY = 'talentos:access-token';
  private readonly USER_KEY = 'talentos:user';

  private accessToken = signal<string | null>(null);
  private _currentUser = signal<UserLightDto | null>(null);
  readonly currentUser: Signal<UserLightDto | null> = this._currentUser.asReadonly();
  readonly isLoggedIn: Signal<boolean> = computed(() => !!this._currentUser());

  private isRefreshing = false;

  constructor() {
    const storedUser = sessionStorage.getItem(this.USER_KEY);
    const storedToken = sessionStorage.getItem(this.ACCESS_TOKEN_KEY);

    if (storedUser && storedToken) {
      this.accessToken.set(storedToken);
      this._currentUser.set(JSON.parse(storedUser));
    } else {
      sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
      sessionStorage.removeItem(this.ACCESS_TOKEN_KEY);
      sessionStorage.removeItem(this.USER_KEY);
    }
  }

  getAccessToken(): string | null {
    return this.accessToken();
  }

  private setAccessToken(token: string | null) {
    this.accessToken.set(token);
    if (token) {
      sessionStorage.setItem(this.ACCESS_TOKEN_KEY, token);
    } else {
      sessionStorage.removeItem(this.ACCESS_TOKEN_KEY);
    }
  }

  private getRefreshToken(): string | null {
    return sessionStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  private setRefreshToken(token: string | null) {
    if (token) {
      sessionStorage.setItem(this.REFRESH_TOKEN_KEY, token);
    } else {
      sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
    }
  }

  private setCurrentUser(user: UserLightDto | null) {
    this._currentUser.set(user);
    if (user) {
      sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(this.USER_KEY);
    }
  }

  login(username: string, password: string): Observable<ApiResponse<LoginResponse>> {
    const credential: Credential = { username, password };
    return this.authClient.login(credential).pipe(
      tap((response) => {
        this.setCurrentUser(response.data.userLightDto);
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
    this.router.navigate(['/login']);
  }

  resetPassword(username: string, password: string): Observable<void> {
    const credential: Credential = { username, password };
    return this.authClient.resetPassword(credential);
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

    return this.authClient.refresh(payload).pipe(
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
