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
    <div class="min-h-[calc(100vh-80px)] flex items-stretch">

      <!-- Left Panel — Branding (hidden on mobile) -->
      <div class="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col justify-between p-12"
           style="background: linear-gradient(135deg, #0e1527 0%, #13152b 100%);">
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
          <div class="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20 blur-3xl"
               style="background: #8b5cf6;"></div>
          <div class="absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-15 blur-3xl"
               style="background: #10b981;"></div>
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
            Join thousands of<br />
            <span style="color: #10b981;">happy renters</span><br />
            across Cambodia
          </h2>
          <p class="text-base leading-relaxed mb-12" style="color: #64748b;">
            Create your free account in 60 seconds and start browsing our premium fleet of cars, motorcycles, and bikes.
          </p>

          <!-- Benefits -->
          <div class="grid grid-cols-2 gap-4">
            @for (benefit of benefits; track benefit.title) {
              <div class="rounded-2xl p-4" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);">
                <span class="material-symbols-outlined text-2xl mb-2 block" [style.color]="benefit.color">{{ benefit.icon }}</span>
                <p class="text-sm font-bold text-white mb-0.5">{{ benefit.title }}</p>
                <p class="text-xs" style="color: #64748b;">{{ benefit.desc }}</p>
              </div>
            }
          </div>
        </div>

        <div class="relative z-10 mt-8">
          <div class="flex items-center gap-3">
            <div class="flex">
              @for (av of avatars; track av) {
                <div class="w-8 h-8 rounded-full border-2 -ml-2 first:ml-0 flex items-center justify-center text-white text-xs font-bold"
                     [style.background]="av.bg" [style.border-color]="'#0e1527'">{{ av.letter }}</div>
              }
            </div>
            <p class="text-sm" style="color: #94a3b8;">
              <strong class="text-white">10,000+</strong> customers trust Cambo Rent
            </p>
          </div>
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
            <h1 class="text-3xl font-black text-white mb-2">Create Account</h1>
            <p class="text-sm" style="color: #64748b;">Already have an account?
              <a routerLink="/login" class="font-semibold ml-1 transition-colors hover:text-emerald-300" style="color: #10b981;">Sign in →</a>
            </p>
          </div>

          <!-- Password strength hint -->
          @if ((form.get('password')?.value || '').length > 0) {
            <div class="mb-6 p-3 rounded-xl text-xs animate-fade-in"
                 [style]="getPasswordStrength() >= 2 ? 'background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);color:#34d399' : 'background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);color:#fbbf24'">
              <div class="flex items-center gap-2 mb-1.5">
                <span class="material-symbols-outlined text-sm">{{ getPasswordStrength() >= 2 ? 'check_circle' : 'info' }}</span>
                Password strength: {{ ['Weak', 'Medium', 'Strong'][getPasswordStrength()] }}
              </div>
              <div class="flex gap-1">
                @for (i of [0,1,2]; track i) {
                  <div class="h-1 flex-1 rounded-full transition-all duration-300"
                       [style.background]="i <= getPasswordStrength() ? (getPasswordStrength() >= 2 ? '#34d399' : '#fbbf24') : 'rgba(255,255,255,0.1)'"></div>
                }
              </div>
            </div>
          }

          <!-- Error -->
          @if (error()) {
            <div class="mb-6 flex items-center gap-3 rounded-xl p-4 text-sm animate-fade-in"
                 style="background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); color: #f87171;">
              <span class="material-symbols-outlined text-lg flex-shrink-0">error</span>
              {{ error() }}
            </div>
          }

          <!-- Form -->
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">

            <!-- Name -->
            <div>
              <label for="name" class="block text-sm font-semibold mb-2" style="color: #94a3b8;">Full Name</label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-lg" style="color: #475569;">person</span>
                <input id="name" type="text" formControlName="name" placeholder="Your full name"
                       class="w-full rounded-xl border border-outline-variant/50 bg-surface-container-high py-3 pl-11 pr-4 text-on-surface placeholder:text-outline/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
              @if (form.get('name')?.invalid && form.get('name')?.touched) {
                <p class="mt-1.5 text-xs flex items-center gap-1" style="color: #f87171;">
                  <span class="material-symbols-outlined text-sm">error</span>
                  Name is required.
                </p>
              }
            </div>

            <!-- Email -->
            <div>
              <label for="email" class="block text-sm font-semibold mb-2" style="color: #94a3b8;">Email Address</label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-lg" style="color: #475569;">mail</span>
                <input id="email" type="email" formControlName="email" placeholder="you@example.com"
                       class="w-full rounded-xl border border-outline-variant/50 bg-surface-container-high py-3 pl-11 pr-4 text-on-surface placeholder:text-outline/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
              @if (form.get('email')?.invalid && form.get('email')?.touched) {
                <p class="mt-1.5 text-xs flex items-center gap-1" style="color: #f87171;">
                  <span class="material-symbols-outlined text-sm">error</span>
                  Valid email is required.
                </p>
              }
            </div>

            <!-- Phone -->
            <div>
              <label for="phone" class="block text-sm font-semibold mb-2" style="color: #94a3b8;">
                Phone Number <span class="font-normal" style="color: #475569;">(optional)</span>
              </label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-lg" style="color: #475569;">phone</span>
                <input id="phone" type="tel" formControlName="phone" placeholder="+855 12 345 678"
                       class="w-full rounded-xl border border-outline-variant/50 bg-surface-container-high py-3 pl-11 pr-4 text-on-surface placeholder:text-outline/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
            </div>

            <!-- Password -->
            <div>
              <label for="password" class="block text-sm font-semibold mb-2" style="color: #94a3b8;">Password</label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-lg" style="color: #475569;">lock</span>
                <input id="password" [type]="showPass() ? 'text' : 'password'" formControlName="password" placeholder="Min 6 characters"
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

            <!-- Confirm Password -->
            <div>
              <label for="confirm" class="block text-sm font-semibold mb-2" style="color: #94a3b8;">Confirm Password</label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-lg" style="color: #475569;">lock_reset</span>
                <input id="confirm" type="password" formControlName="confirmPassword" placeholder="Repeat your password"
                       class="w-full rounded-xl border border-outline-variant/50 bg-surface-container-high py-3 pl-11 pr-4 text-on-surface placeholder:text-outline/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
              @if (form.errors?.['passwordMismatch'] && form.get('confirmPassword')?.touched) {
                <p class="mt-1.5 text-xs flex items-center gap-1" style="color: #f87171;">
                  <span class="material-symbols-outlined text-sm">error</span>
                  Passwords do not match.
                </p>
              }
            </div>

            <!-- Submit -->
            <button type="submit" [disabled]="loading() || form.invalid"
                    class="btn-primary w-full py-4 mt-2 text-base disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-primary/20">
              @if (loading()) {
                <span class="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                Creating account...
              } @else {
                <span class="material-symbols-outlined text-xl">person_add</span>
                Create Free Account
              }
            </button>
          </form>

          <p class="mt-6 text-center text-xs" style="color: #475569;">
            By registering you agree to our
            <span class="cursor-pointer hover:text-emerald-400 transition-colors" style="color: #64748b;">Terms of Service</span> and
            <span class="cursor-pointer hover:text-emerald-400 transition-colors" style="color: #64748b;">Privacy Policy</span>.
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

  readonly benefits = [
    { icon: 'directions_car', title: 'Huge Fleet', desc: '500+ vehicles available', color: '#10b981' },
    { icon: 'local_offer', title: 'Best Prices', desc: 'Transparent, no hidden fees', color: '#3b82f6' },
    { icon: 'support_agent', title: '24/7 Support', desc: 'Always here to help', color: '#f59e0b' },
    { icon: 'verified_user', title: 'Safe & Insured', desc: 'Full coverage on all rentals', color: '#8b5cf6' },
  ];

  readonly avatars = [
    { letter: 'S', bg: 'linear-gradient(135deg, #10b981, #059669)' },
    { letter: 'K', bg: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
    { letter: 'M', bg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
    { letter: 'P', bg: 'linear-gradient(135deg, #f59e0b, #d97706)' },
  ];

  readonly form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordMatchValidator });

  getPasswordStrength(): number {
    const pw = this.form.get('password')?.value || '';
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
    return Math.min(score, 2);
  }

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
