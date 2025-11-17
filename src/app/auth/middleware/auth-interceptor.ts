import {
  HttpErrorResponse,
  HttpEvent,
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take, finalize } from 'rxjs/operators';
import { ApiResponseCode } from '../../response/api-response-enum';
import { AuthService } from '../service/auth-service';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const accessToken = authService.getAccessToken();

  const reqWithAuth =
    accessToken && !isAuthRequest(req) ? addAuthorizationHeader(req, accessToken) : req;
  return next(reqWithAuth).pipe(
    catchError((error: HttpErrorResponse) => {
      if (!isAuthRequest(req) && isExpiredJwtError(error)) {
        return handleExpiredToken(req, next, authService);
      }
      return throwError(() => error);
    })
  );
};

const handleExpiredToken = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService
): Observable<HttpEvent<unknown>> => {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.handleRefresh().pipe(
      switchMap(() => {
        const newAccessToken = authService.getAccessToken();
        if (!newAccessToken) {
          throw new Error('Failed to acquire new access token after refresh');
        }
        refreshTokenSubject.next(newAccessToken);
        return next(addAuthorizationHeader(req, newAccessToken));
      }),
      catchError((err) => {
        authService.logout();
        return throwError(() => err);
      }),
      finalize(() => {
        isRefreshing = false;
      })
    );
  }

  return refreshTokenSubject.pipe(
    filter((token): token is string => token !== null),
    take(1),
    switchMap((token) => next(addAuthorizationHeader(req, token)))
  );
};

const addAuthorizationHeader = (req: HttpRequest<unknown>, token: string): HttpRequest<unknown> => {
  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const isAuthRequest = (req: HttpRequest<unknown>): boolean => {
  const url = req.url;
  return url.endsWith('/api/bff-web-app/auth/login') || url.endsWith('/api/bff-web-app/auth/reset');
};

const isExpiredJwtError = (error: HttpErrorResponse): boolean => {
  const code = error?.error?.code as number | undefined;
  return (
    (error.status === 401 || error.status === 403) &&
    (code === ApiResponseCode.JWT_EXPIRED || code === 4011)
  );
};
