import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  // On the server there's no localStorage/token — let the client decide.
  if (isPlatformServer(inject(PLATFORM_ID))) return true;

  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.ensureAuthenticated().pipe(
    map((ok) => ok || router.createUrlTree(['/login']))
  );
};
