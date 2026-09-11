import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, throwError, EMPTY } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  
  // Prevent HTTP calls during server-side rendering (Netlify prerender)
  if (!isPlatformBrowser(platformId)) {
    return EMPTY;
  }

  return next(req).pipe(
    catchError((err) => {
      if (err.status === 401) {
        if (isPlatformBrowser(platformId)) {
          if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('cr_token');
          }
          router.navigateByUrl('/login');
        }
        return EMPTY;
      }
      return throwError(() => err);
    })
  );
};
