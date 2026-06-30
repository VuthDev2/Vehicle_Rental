import { Injectable, computed, signal } from '@angular/core';
import { User, UserRole } from '../../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly sessionUser = signal<User | null>(null);

  readonly user = this.sessionUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this.sessionUser());
  readonly role = computed<UserRole | null>(() => this.sessionUser()?.role ?? null);

  login(email: string): void {
    const role: UserRole = email.toLowerCase().includes('admin') ? 'admin' : 'customer';
    this.sessionUser.set({
      _id: role === 'admin' ? 'u2' : 'u1',
      name: role === 'admin' ? 'Admin Team' : 'Maya Chen',
      email,
      phone: role === 'admin' ? '+1 555 0100' : '+1 555 0148',
      role,
      createdAt: '2026-01-12',
    });
  }

  register(name: string, email: string, phone: string): void {
    this.sessionUser.set({ _id: 'u1', name, email, phone, role: 'customer', createdAt: new Date().toISOString().slice(0, 10) });
  }

  logout(): void {
    this.sessionUser.set(null);
  }
}
