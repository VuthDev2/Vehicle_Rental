import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-[calc(100vh-80px)] flex items-stretch">

      <!-- Left Panel — Branding (hidden on mobile) -->
      <div class="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col justify-between p-12"
           style="background: linear-gradient(135deg, #0e1527 0%, #13152b 100%);">
        <!-- Background Glow -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
          <div class="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20 blur-3xl"
               style="background: #10b981;"></div>
          <div class="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-15 blur-3xl"
               style="background: #3b82f6;"></div>
        </div>

        <div class="relative z-10">
          <div class="flex items-center gap-3 mb-16">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                 style="background: linear-gradient(135deg, #10b981, #059669);">
              <span class="material-symbols-outlined text-white text-xl">directions_car</span>
            </div>
            <span class="text-lg font-black text-white">Cambo Rent</span>
          </div>

          <h2 class="text-4xl font-black text-white leading-tight mb-4">
            Welcome back to<br />
            <span style="color: #10b981;">Cambodia's #1</span><br />
            Rental Platform
          </h2>
          <p class="text-base leading-relaxed mb-12" style="color: #64748b;">
            Sign in to access your bookings, manage your rentals, and browse our fleet of premium vehicles.
          </p>

          <!-- Features list -->
          <div class="flex flex-col gap-4">
            @for (feat of sideFeatures; track feat.text) {
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                     style="background: rgba(16,185,129,0.12);">
                  <span class="material-symbols-outlined text-base" style="color: #10b981;">{{ feat.icon }}</span>
                </div>
                <span class="text-sm font-medium" style="color: #94a3b8;">{{ feat.text }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Bottom testimonial -->
        <div class="relative z-10 rounded-2xl p-6" style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07);">
          <div class="flex gap-1 mb-3">
            @for (s of [1,2,3,4,5]; track s) {
              <span class="material-symbols-outlined text-sm" style="color: #f59e0b;">star</span>
            }
          </div>
          <p class="text-sm italic mb-4" style="color: #94a3b8;">"Super easy to book. Got my motorcycle delivered in 30 minutes. Will use again!"</p>
          <p class="text-sm font-bold text-white">Panha Keo</p>
          <p class="text-xs" style="color: #64748b;">Phnom Penh, Cambodia</p>
        </div>
      </div>

      <!-- Right Panel — Form -->
      <div class="flex-1 flex items-center justify-center px-6 py-12" style="background: #0a0f1e;">
        <div class="w-full max-w-md">

          <!-- Mobile logo -->
          <div class="flex lg:hidden items-center gap-2 mb-8">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center"
                 style="background: linear-gradient(135deg, #10b981, #059669);">
              <span class="material-symbols-outlined text-white text-lg">directions_car</span>
            </div>
            <span class="text-base font-black text-white">Cambo Rent</span>
          </div>

          <div class="mb-8">
            <h1 class="text-3xl font-black text-white mb-2">Sign In</h1>
            <p class="text-sm" style="color: #64748b;">Don't have an account?
              <a routerLink="/register" class="font-semibold ml-1 transition-colors hover:text-emerald-300" style="color: #10b981;">Create one →</a>
            </p>
          </div>

          <!-- Error -->
          @if (error()) {
            <div class="mb-6 flex items-center gap-3 rounded-xl p-4 text-sm animate-fade-in"
                 style="background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); color: #f87171;">
              <span class="material-symbols-outlined text-lg flex-shrink-0">error</span>
              {{ error() }}
            </div>
          }

          <!-- Form -->
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-5">

            <!-- Email -->
            <div>
              <label for="email" class="block text-sm font-semibold mb-2" style="color: #94a3b8;">Email Address</label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-lg" style="color: #475569;">mail</span>
                <input id="email" type="email" formControlName="email" placeholder="you@example.com"
                       class="w-full rounded-xl border border-outline-variant/50 bg-surface-container-high py-3 pl-11 pr-4 text-on-surface placeholder:text-outline/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                       [style.border-color]="form.get('email')?.invalid && form.get('email')?.touched ? 'rgba(239,68,68,0.5)' : ''" />
              </div>
              @if (form.get('email')?.invalid && form.get('email')?.touched) {
                <p class="mt-1.5 text-xs flex items-center gap-1" style="color: #f87171;">
                  <span class="material-symbols-outlined text-sm">error</span>
                  Please enter a valid email.
                </p>
              }
            </div>

            <!-- Password -->
            <div>
              <label for="password" class="block text-sm font-semibold mb-2" style="color: #94a3b8;">Password</label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-lg" style="color: #475569;">lock</span>
                <input id="password" [type]="showPass() ? 'text' : 'password'" formControlName="password" placeholder="••••••••"
                       class="w-full rounded-xl border border-outline-variant/50 bg-surface-container-high py-3 pl-11 pr-12 text-on-surface placeholder:text-outline/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                <button type="button" (click)="showPass.set(!showPass())"
                        class="absolute right-4 top-1/2 -translate-y-1/2 transition-colors hover:text-on-surface"
                        style="color: #475569;">
                  <span class="material-symbols-outlined text-xl">{{ showPass() ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
              @if (form.get('password')?.invalid && form.get('password')?.touched) {
                <p class="mt-1.5 text-xs flex items-center gap-1" style="color: #f87171;">
                  <span class="material-symbols-outlined text-sm">error</span>
                  Password must be at least 6 characters.
                </p>
              }
            </div>

            <!-- Forgot Password & Remember -->
            <div class="flex items-center justify-between">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" class="w-4 h-4 rounded border-outline-variant/50 bg-surface-container-high text-primary focus:ring-primary/30" />
                <span class="text-sm" style="color: #94a3b8;">Remember me</span>
              </label>
              <span class="text-sm font-semibold cursor-pointer transition-colors hover:text-emerald-400" style="color: #10b981;">Forgot password?</span>
            </div>

            <!-- Submit -->
            <button type="submit" [disabled]="loading() || form.invalid"
                    class="btn-primary w-full py-4 mt-2 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:brightness-100 shadow-2xl shadow-primary/20">
              @if (loading()) {
                <span class="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                Signing in...
              } @else {
                <span class="material-symbols-outlined text-xl">login</span>
                Sign In
              }
            </button>
          </form>

          <p class="mt-8 text-center text-xs" style="color: #475569;">
            By signing in you agree to our
            <span class="cursor-pointer hover:text-emerald-400 transition-colors" style="color: #64748b;">Terms of Service</span>
            and
            <span class="cursor-pointer hover:text-emerald-400 transition-colors" style="color: #64748b;">Privacy Policy</span>.
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

  readonly sideFeatures = [
    { icon: 'directions_car', text: 'Browse 500+ cars, motos, and bikes' },
    { icon: 'local_offer', text: 'Exclusive deals and promotions' },
    { icon: 'support_agent', text: '24/7 customer support' },
    { icon: 'verified_user', text: 'Fully insured, safety-checked fleet' },
  ];

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
