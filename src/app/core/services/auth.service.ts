import { Injectable, computed, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { User, UserRole } from '../../models/user.model';

const API = 'http://localhost:5001/api';
const TOKEN_KEY = 'cr_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly sessionUser = signal<User | null>(null);

  readonly user = this.sessionUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this.sessionUser());
  readonly role = computed<UserRole | null>(() => this.sessionUser()?.role ?? null);

  constructor() {
    this.tryRestoreSession();
  }

  private tryRestoreSession(): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    try {
      const decoded: any = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        this.clearSession();
        return;
      }
      this.http.get<{ user: User }>(`${API}/auth/me`).subscribe({
        next: ({ user }) => this.sessionUser.set(user),
        error: () => this.clearSession(),
      });
    } catch {
      this.clearSession();
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
    return this.http.post<{ token: string; user: User }>(`${API}/auth/register`, { name, email, phone, password }).pipe(
      tap(({ token, user }) => {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(TOKEN_KEY, token);
        }
        this.sessionUser.set(user);
      })
    );
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
  }
}
