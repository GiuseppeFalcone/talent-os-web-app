import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { ApiResponseCode } from '../response/api-response-enum';
import { AuthService } from '../service/auth/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const accessToken = authService.getAccessToken();

  let authReq = req;
  if (accessToken && !isAuthRequest(req)) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${accessToken}` },
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 403 && !isAuthRequest(req)) {
        const apiError = error.error;
        const errorCode = apiError?.code;

        if (errorCode === ApiResponseCode.JWT_EXPIRED) {
          return authService.handleRefresh().pipe(
            switchMap(() => {
              const newAccessToken = authService.getAccessToken();
              const newAuthReq = req.clone({
                setHeaders: { Authorization: `Bearer ${newAccessToken}` },
              });
              return next(newAuthReq);
            }),
            catchError((refreshError) => {
              return throwError(() => refreshError);
            })
          );
        } else if (
          errorCode >= ApiResponseCode.JWT_NOT_YET_VALID &&
          errorCode <= ApiResponseCode.JWT_NOT_PRESENT
        ) {
          // These are unrecoverable, so  logout.
          authService.logout();
          return throwError(() => error);
        }
      }

      // For all other errors
      return throwError(() => error);
    })
  );
};

const isAuthRequest = (req: HttpRequest<any>): boolean => {
  const url = req.url;
  return url.includes('/api/bff-web-app/auth');
};
