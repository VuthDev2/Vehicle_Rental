import { environment } from '../../../environments/environment';

import { Injectable, computed, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, tap, map, catchError, shareReplay } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { User, UserRole } from '../../models/user.model';

const API = environment.apiUrl;
const TOKEN_KEY = 'cr_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly sessionUser = signal<User | null>(null);

  readonly user = this.sessionUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this.sessionUser());
  readonly role = computed<UserRole | null>(() => this.sessionUser()?.role ?? null);

  // Cached in-flight /auth/me so concurrent guards share one request.
  private restore$?: Observable<boolean>;

  constructor() {
    // Eagerly restore so non-guarded pages (e.g. home) know the user too.
    this.ensureAuthenticated().subscribe();
  }

  /**
   * Resolves to whether there is a valid session, restoring it from the stored
   * token if needed. Guards MUST await this (rather than reading a signal) so a
   * page refresh doesn't redirect to login before /auth/me has resolved.
   */
  ensureAuthenticated(): Observable<boolean> {
    if (this.sessionUser()) return of(true);

    const token = this.getValidToken();
    if (!token) return of(false);

    if (!this.restore$) {
      this.restore$ = this.http.get<{ user: User }>(`${API}/auth/me`).pipe(
        tap(({ user }) => this.sessionUser.set(user)),
        map(() => true),
        catchError(() => {
          this.clearSession();
          return of(false);
        }),
        shareReplay(1)
      );
    }
    return this.restore$;
  }

  /** Returns the stored token if present and unexpired, else null. */
  private getValidToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    try {
      const decoded: any = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        this.clearSession();
        return null;
      }
      return token;
    } catch {
      this.clearSession();
      return null;
    }
  }

  login(email: string, password: string) {
    return this.http.post<{ token: string; user: User }>(`${API}/auth/login`, { email, password }).pipe(
      tap(({ token, user }) => {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(TOKEN_KEY, token);
        }
        this.sessionUser.set(user);
      })
    );
  }

  register(name: string, email: string, phone: string, password: string) {
    return this.http
      .post<{ token: string; user: User; devCode?: string }>(`${API}/auth/register`, {
        name,
        email,
        phone,
        password,
      })
      .pipe(
        tap(({ token, user }) => {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(TOKEN_KEY, token);
          }
          this.sessionUser.set(user);
        })
      );
  }

  verifyEmail(email: string, code: string) {
    return this.http
      .post<{ message: string; user: User }>(`${API}/auth/verify-email`, { email, code })
      .pipe(tap(({ user }) => this.updateUser(user)));
  }

  resendVerification(email: string) {
    return this.http.post<{ message: string; devCode?: string }>(`${API}/auth/resend-verification`, {
      email,
    });
  }

  changePassword(currentPassword: string, newPassword: string) {
    return this.http
      .post<{ message: string; user: User }>(`${API}/auth/change-password`, {
        currentPassword,
        newPassword,
      })
      .pipe(tap(({ user }) => this.updateUser(user)));
  }

  logout(): void {
    this.clearSession();
    this.router.navigateByUrl('/');
  }

  updateUser(user: User): void {
    this.sessionUser.set(user);
  }

  private clearSession(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
    this.sessionUser.set(null);
    this.restore$ = undefined;
  }
}
