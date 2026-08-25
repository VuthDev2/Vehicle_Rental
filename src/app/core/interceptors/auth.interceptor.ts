import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('cr_token') : null;
  
  let cloned = req.clone({
    withCredentials: true,
  });

  if (token) {
    cloned = cloned.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(cloned).pipe(
    catchError((error: HttpErrorResponse) => {
      // Intercept 401 Unauthorized, ignore refresh/login endpoints
      if (error.status === 401 && !req.url.includes('/auth/refresh') && !req.url.includes('/auth/login')) {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshTokenSubject.next(null);

          return authService.refreshToken().pipe(
            switchMap((newToken) => {
              isRefreshing = false;
              refreshTokenSubject.next(newToken);
              
              const retriedReq = req.clone({
                setHeaders: { Authorization: `Bearer ${newToken}` },
                withCredentials: true,
              });
              return next(retriedReq);
            }),
            catchError((refreshErr) => {
              isRefreshing = false;
              authService.logout();
              return throwError(() => refreshErr);
            })
          );
        } else {
          // Wait while another request is refreshing the token
          return refreshTokenSubject.pipe(
            filter((jwt) => jwt !== null),
            take(1),
            switchMap((jwt) => {
              const retriedReq = req.clone({
                setHeaders: { Authorization: `Bearer ${jwt}` },
                withCredentials: true,
              });
              return next(retriedReq);
            })
          );
        }
      }

      return throwError(() => error);
    })
  );
};
