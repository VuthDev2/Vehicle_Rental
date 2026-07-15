import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="flex min-h-screen bg-white">
      <!-- Left Panel -->
      <div class="hidden lg:flex lg:w-[520px] xl:w-[600px] relative overflow-hidden flex-shrink-0 flex-col justify-between p-14"
           style="background: linear-gradient(160deg, #0B1C30 0%, #162240 50%, #1a2d4a 100%);">
        <div class="absolute inset-0 opacity-[0.04] pointer-events-none" 
             style="background-image: radial-gradient(circle at 25% 25%, #fff 1px, transparent 1px); background-size: 40px 40px;"></div>
        <div class="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-10 blur-[120px]" style="background: #3980F4;"></div>
        <div class="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full opacity-[0.08] blur-[100px]" style="background: #005DAC;"></div>

        <div class="relative z-10">
          <div class="flex items-center gap-3 mb-20">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style="background: linear-gradient(135deg, #3980F4, #005DAC);">
              <span class="material-symbols-outlined text-white text-xl">directions_car</span>
            </div>
            <span class="text-xl font-extrabold tracking-wide text-white">Cambo Rent</span>
          </div>

          <div class="max-w-[400px]">
            <div class="flex items-center gap-2 mb-6">
              <div class="w-8 h-px" style="background: #3980F4;"></div>
              <span class="text-xs font-semibold tracking-[3px] uppercase" style="color: #3980F4;">Premium Fleet</span>
            </div>
            <h1 class="text-[40px] xl:text-[44px] font-bold text-white leading-[1.15] tracking-tight mb-5">
              Drive the<br/>
              <span style="color: #3980F4;">exceptional.</span>
            </h1>
            <p class="text-base leading-relaxed" style="color: rgba(203, 219, 245, 0.8);">
              Sign in to manage your bookings, explore our fleet, and experience premium vehicle rental across Cambodia.
            </p>
          </div>
        </div>

        <div class="relative z-10">
          <div class="flex items-center gap-4">
            <div class="flex -space-x-2">
              @for (a of ['JD', 'MK', 'PL', 'RT']; track a) {
                <div class="w-9 h-9 rounded-full border-2 flex items-center justify-center text-[11px] font-bold"
                     style="border-color: #0B1C30; background: linear-gradient(135deg, #3980F4, #005DAC); color: #fff;">{{a}}</div>
              }
            </div>
            <div>
              <p class="text-sm font-semibold text-white">4,000+</p>
              <p class="text-xs" style="color: rgba(203, 219, 245, 0.6);">active riders this month</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel -->
      <div class="flex-1 flex items-center justify-center px-6 py-10 relative">
        <div class="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none opacity-30"
             style="background: radial-gradient(circle at 100% 0%, #E5EEFF 0%, transparent 60%);"></div>

        <div class="w-full max-w-[400px] relative z-10">
          <!-- Mobile Logo -->
          <div class="flex lg:hidden items-center gap-2 mb-10">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background: linear-gradient(135deg, #3980F4, #005DAC);">
              <span class="material-symbols-outlined text-white text-lg">directions_car</span>
            </div>
            <span class="text-lg font-extrabold text-[#0B1C30]">Cambo Rent</span>
          </div>

          <!-- Header -->
          <div class="mb-9">
            <h1 class="text-[28px] font-bold text-[#0B1C30] mb-2">Welcome back</h1>
            <p class="text-sm" style="color: #5A6A7E;">Enter your credentials to access your account.</p>
          </div>

          <!-- Error -->
          @if (error()) {
            <div class="mb-6 flex items-center gap-3 rounded-xl p-4 text-sm bg-red-50 border border-red-200 text-red-600" role="alert">
              <span class="material-symbols-outlined text-lg flex-shrink-0 text-red-400">error</span>
              {{ error() }}
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-5">

            <!-- Email -->
            <div>
              <label class="block text-[13px] font-semibold text-[#0B1C30] mb-1.5">Email address</label>
              <div class="relative">
                <span class="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-lg" style="color: #94A3B8;">mail</span>
                <input type="email" formControlName="email" placeholder="name@company.com"
                       class="w-full h-[48px] rounded-xl border pl-[42px] pr-4 text-sm outline-none transition-all duration-200"
                       [class.border-red-300]="isFieldInvalid('email')"
                       [class.border-[#D0D5DD]]="!isFieldInvalid('email')"
                       [class.focus:border-[#005DAC]]="!isFieldInvalid('email')"
                       style="background: #F8FAFC; color: #0B1C30;"
                       (focus)="focusedField.set('email')" (blur)="focusedField.set('')" />
              </div>
              @if (isFieldInvalid('email')) {
                <p class="mt-1.5 text-xs flex items-center gap-1 text-red-500">
                  <span class="material-symbols-outlined text-xs">error</span>
                  Valid email is required.
                </p>
              }
            </div>

            <!-- Password -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="block text-[13px] font-semibold text-[#0B1C30]">Password</label>
                <a routerLink="/forgot-password" class="text-[13px] font-medium transition-colors hover:underline" style="color: #005DAC;">Forgot?</a>
              </div>
              <div class="relative">
                <span class="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-lg" style="color: #94A3B8;">lock</span>
                <input [type]="showPass() ? 'text' : 'password'" formControlName="password" placeholder="Enter your password"
                       class="w-full h-[48px] rounded-xl border pl-[42px] pr-12 text-sm outline-none transition-all duration-200"
                       [class.border-red-300]="isFieldInvalid('password')"
                       [class.border-[#D0D5DD]]="!isFieldInvalid('password')"
                       [class.focus:border-[#005DAC]]="!isFieldInvalid('password')"
                       style="background: #F8FAFC; color: #0B1C30;" />
                <button type="button" (click)="showPass.set(!showPass())"
                        class="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors hover:text-[#0B1C30]" style="color: #94A3B8;">
                  <span class="material-symbols-outlined text-lg">{{ showPass() ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
              @if (isFieldInvalid('password')) {
                <p class="mt-1.5 text-xs flex items-center gap-1 text-red-500">
                  <span class="material-symbols-outlined text-xs">error</span>
                  Password must be at least 6 characters.
                </p>
              }
            </div>

            <!-- Submit -->
            <button type="submit" [disabled]="loading() || form.invalid"
                    class="w-full h-[48px] rounded-xl text-sm font-bold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 active:scale-[0.99]"
                    style="background: linear-gradient(135deg, #005DAC, #3980F4); box-shadow: 0 4px 14px rgba(0, 93, 172, 0.25);">
              @if (loading()) {
                <span class="material-symbols-outlined animate-spin text-lg align-middle mr-2">progress_activity</span>
                Signing in...
              } @else {
                Sign in
              }
            </button>
          </form>

          <!-- Divider -->
          <div class="flex items-center gap-4 my-7">
            <div class="flex-1 h-px" style="background: #E2E8F0;"></div>
            <span class="text-xs font-medium" style="color: #94A3B8;">or continue with</span>
            <div class="flex-1 h-px" style="background: #E2E8F0;"></div>
          </div>

          <!-- Social -->
          <div class="flex gap-3">
            <button type="button"
                    class="flex-1 flex items-center justify-center gap-2.5 h-[46px] rounded-xl border transition-all hover:bg-[#F8FAFC] cursor-pointer"
                    style="border-color: #D0D5DD; background: #fff;">
              <svg class="w-[18px] h-[18px]" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span class="text-sm font-medium" style="color: #1E293B;">Google</span>
            </button>
            <button type="button"
                    class="flex-1 flex items-center justify-center gap-2.5 h-[46px] rounded-xl border transition-all hover:bg-[#F8FAFC] cursor-pointer"
                    style="border-color: #D0D5DD; background: #fff;">
              <svg class="w-[18px] h-[18px]" viewBox="0 0 24 24">
                <path fill="#1E293B" d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              <span class="text-sm font-medium" style="color: #1E293B;">Apple</span>
            </button>
          </div>

          <!-- Register link -->
          <p class="text-center mt-8 text-sm" style="color: #5A6A7E;">
            Don't have an account?
            <a routerLink="/register" class="font-bold transition-colors hover:underline" style="color: #005DAC;">Create one</a>
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
  readonly focusedField = signal('');

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');

    const { email, password } = this.form.getRawValue();

    this.auth.login(email, password).pipe(
      finalize(() => this.loading.set(false)),
      catchError((err) => {
        this.error.set(err.error?.message || 'Authentication failed. Please verify your credentials.');
        return of(null);
      })
    ).subscribe((res) => {
      if (!res) return;
      const targetRoute = res.user.role === 'admin' ? '/admin/dashboard' : '/customer/dashboard';
      this.router.navigateByUrl(targetRoute);
    });
  }

  isFieldInvalid(fieldName: 'email' | 'password'): boolean {
    const field = this.form.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }
}
