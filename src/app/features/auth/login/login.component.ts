import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="flex min-h-[calc(100vh-80px)] items-center justify-center bg-background px-4 py-12">
      <div class="w-full max-w-md">
        <!-- Logo -->
        <div class="mb-8 text-center">
          <div class="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15">
            <span class="material-symbols-outlined text-3xl text-primary">directions_car</span>
          </div>
          <h1 class="text-2xl font-bold text-on-surface">Welcome back</h1>
          <p class="mt-1 text-sm text-on-surface-variant">Sign in to your Cambo Rent account</p>
        </div>

        <!-- Card -->
        <div class="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-8 shadow-2xl shadow-black/20">
          @if (error()) {
            <div class="mb-6 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
              <span class="material-symbols-outlined text-sm">error</span>
              {{ error() }}
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-5">
            <div>
              <label class="mb-2 block text-sm font-semibold text-on-surface" for="email">Email address</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">email</span>
                <input
                  id="email"
                  type="email"
                  formControlName="email"
                  placeholder="you@example.com"
                  class="w-full rounded-xl border border-outline-variant/50 bg-surface-container-high py-3 pl-10 pr-4 text-on-surface placeholder:text-outline focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              @if (form.get('email')?.invalid && form.get('email')?.touched) {
                <p class="mt-1 text-xs text-red-400">Valid email is required.</p>
              }
            </div>

            <div>
              <label class="mb-2 block text-sm font-semibold text-on-surface" for="password">Password</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">lock</span>
                <input
                  id="password"
                  [type]="showPass() ? 'text' : 'password'"
                  formControlName="password"
                  placeholder="••••••••"
                  class="w-full rounded-xl border border-outline-variant/50 bg-surface-container-high py-3 pl-10 pr-12 text-on-surface placeholder:text-outline focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button type="button" (click)="showPass.set(!showPass())" class="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface">
                  <span class="material-symbols-outlined text-xl">{{ showPass() ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
              @if (form.get('password')?.invalid && form.get('password')?.touched) {
                <p class="mt-1 text-xs text-red-400">Password must be at least 6 characters.</p>
              }
            </div>

            <button
              type="submit"
              [disabled]="loading() || form.invalid"
              class="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:brightness-110 disabled:opacity-50">
              @if (loading()) {
                <span class="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                Signing in...
              } @else {
                <span class="material-symbols-outlined text-xl">login</span>
                Sign In
              }
            </button>
          </form>

          <p class="mt-6 text-center text-sm text-on-surface-variant">
            Don't have an account?
            <a routerLink="/register" class="font-semibold text-primary hover:underline">Create one →</a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly showPass = signal(false);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');

    const { email, password } = this.form.value;
    this.auth.login(email!, password!).subscribe({
      next: (res) => {
        if (res.user.role === 'admin') {
          this.router.navigateByUrl('/admin/dashboard');
        } else {
          this.router.navigateByUrl('/customer/dashboard');
        }
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Login failed. Please try again.');
        this.loading.set(false);
      },
    });
  }
}
