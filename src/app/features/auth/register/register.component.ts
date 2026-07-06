import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return password && confirm && password !== confirm ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="flex min-h-[calc(100vh-80px)] items-center justify-center bg-background px-4 py-12">
      <div class="w-full max-w-md">
        <div class="mb-8 text-center">
          <div class="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15">
            <span class="material-symbols-outlined text-3xl text-primary">person_add</span>
          </div>
          <h1 class="text-2xl font-bold text-on-surface">Create your account</h1>
          <p class="mt-1 text-sm text-on-surface-variant">Join Cambo Rent and start booking today</p>
        </div>

        <div class="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-8 shadow-2xl shadow-black/20">
          @if (error()) {
            <div class="mb-6 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
              <span class="material-symbols-outlined text-sm">error</span>
              {{ error() }}
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
            <div>
              <label class="mb-2 block text-sm font-semibold text-on-surface" for="name">Full Name</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">person</span>
                <input id="name" type="text" formControlName="name" placeholder="Your full name"
                  class="w-full rounded-xl border border-outline-variant/50 bg-surface-container-high py-3 pl-10 pr-4 text-on-surface placeholder:text-outline focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              @if (form.get('name')?.invalid && form.get('name')?.touched) {
                <p class="mt-1 text-xs text-red-400">Name is required.</p>
              }
            </div>

            <div>
              <label class="mb-2 block text-sm font-semibold text-on-surface" for="email">Email address</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">email</span>
                <input id="email" type="email" formControlName="email" placeholder="you@example.com"
                  class="w-full rounded-xl border border-outline-variant/50 bg-surface-container-high py-3 pl-10 pr-4 text-on-surface placeholder:text-outline focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              @if (form.get('email')?.invalid && form.get('email')?.touched) {
                <p class="mt-1 text-xs text-red-400">Valid email is required.</p>
              }
            </div>

            <div>
              <label class="mb-2 block text-sm font-semibold text-on-surface" for="phone">Phone Number</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">phone</span>
                <input id="phone" type="tel" formControlName="phone" placeholder="+855 12 345 678"
                  class="w-full rounded-xl border border-outline-variant/50 bg-surface-container-high py-3 pl-10 pr-4 text-on-surface placeholder:text-outline focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
            </div>

            <div>
              <label class="mb-2 block text-sm font-semibold text-on-surface" for="password">Password</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">lock</span>
                <input id="password" [type]="showPass() ? 'text' : 'password'" formControlName="password" placeholder="Min 6 characters"
                  class="w-full rounded-xl border border-outline-variant/50 bg-surface-container-high py-3 pl-10 pr-12 text-on-surface placeholder:text-outline focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                <button type="button" (click)="showPass.set(!showPass())" class="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface">
                  <span class="material-symbols-outlined text-xl">{{ showPass() ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
              @if (form.get('password')?.invalid && form.get('password')?.touched) {
                <p class="mt-1 text-xs text-red-400">Password must be at least 6 characters.</p>
              }
            </div>

            <div>
              <label class="mb-2 block text-sm font-semibold text-on-surface" for="confirm">Confirm Password</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">lock_reset</span>
                <input id="confirm" type="password" formControlName="confirmPassword" placeholder="Repeat your password"
                  class="w-full rounded-xl border border-outline-variant/50 bg-surface-container-high py-3 pl-10 pr-4 text-on-surface placeholder:text-outline focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              @if (form.errors?.['passwordMismatch'] && form.get('confirmPassword')?.touched) {
                <p class="mt-1 text-xs text-red-400">Passwords do not match.</p>
              }
            </div>

            <button type="submit" [disabled]="loading() || form.invalid"
              class="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:brightness-110 disabled:opacity-50">
              @if (loading()) {
                <span class="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                Creating account...
              } @else {
                <span class="material-symbols-outlined text-xl">person_add</span>
                Create Account
              }
            </button>
          </form>

          <p class="mt-6 text-center text-sm text-on-surface-variant">
            Already have an account?
            <a routerLink="/login" class="font-semibold text-primary hover:underline">Sign in →</a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly showPass = signal(false);

  readonly form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordMatchValidator });

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');

    const { name, email, phone, password } = this.form.value;
    this.auth.register(name!, email!, phone || '', password!).subscribe({
      next: () => this.router.navigateByUrl('/customer/dashboard'),
      error: (err) => {
        this.error.set(err.error?.message || 'Registration failed. Please try again.');
        this.loading.set(false);
      },
    });
  }
}
