import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

const redirectToDashboard = (auth: AuthService): string =>
  auth.role() === 'admin' ? '/admin/dashboard' : '/customer/dashboard';

export const guestGuard: CanActivateFn = (): boolean | UrlTree => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return !auth.isAuthenticated() || router.createUrlTree([redirectToDashboard(auth)]);
};
