import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  // On the server there's no localStorage/token — let the client decide.
  if (isPlatformServer(inject(PLATFORM_ID))) return true;

  const auth = inject(AuthService);
  const router = inject(Router);
  // Wait for the session to be restored before checking the role, otherwise a
  // refresh on an admin route bounces to the customer dashboard.
  return auth.ensureAuthenticated().pipe(
    map((ok) => {
      if (!ok) return router.createUrlTree(['/login']);
      return auth.role() === 'admin' ? true : router.createUrlTree(['/customer/dashboard']);
    })
  );
};
