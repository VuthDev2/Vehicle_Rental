import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <main class="min-h-screen bg-background text-on-surface">
      <section class="flex min-h-screen flex-col lg:flex-row">
        <aside class="relative hidden overflow-hidden bg-surface-container-low lg:flex lg:w-1/2">
          <div class="absolute inset-0 bg-cover bg-center" style="background-image: url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80')"></div>
          <div class="absolute inset-0 bg-gradient-to-tr from-surface-container-lowest/80 via-surface/50 to-primary/40"></div>
          <div class="relative z-10 flex flex-col justify-between p-12 text-white">
            <div>
              <p class="text-sm font-semibold uppercase tracking-[0.3em] text-on-primary">DrivePremium</p>
              <h1 class="mt-6 text-4xl font-bold leading-tight">The standard of excellence in every journey.</h1>
            </div>
            <p class="max-w-md text-sm leading-7 text-on-primary-container">
              Access your premium fleet, manage bookings, and continue your high-end travel experience with concierge-style support.
            </p>
          </div>
        </aside>

        <section class="flex flex-1 items-center justify-center bg-surface-container-lowest px-6 py-16 sm:px-8 lg:px-12">
          <div class="w-full max-w-md rounded-[2rem] border border-outline-variant/50 bg-surface-container-low p-8 shadow-2xl shadow-primary/10">
            <div class="mb-8">
              <p class="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Welcome back</p>
              <h2 class="mt-2 text-3xl font-semibold text-on-surface">Sign in to your account</h2>
              <p class="mt-2 text-sm text-on-surface-variant">Use admin@rental.test to enter admin mode.</p>
            </div>

            <form class="space-y-5" [formGroup]="form" (ngSubmit)="submit()">
              <div>
                <label class="mb-2 block text-sm font-semibold uppercase tracking-[0.25em] text-on-surface-variant" for="email">Email</label>
                <input id="email" formControlName="email" type="email" class="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="name@company.com" />
              </div>
              <div>
                <label class="mb-2 block text-sm font-semibold uppercase tracking-[0.25em] text-on-surface-variant" for="password">Password</label>
                <input id="password" formControlName="password" type="password" class="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="••••••••" />
              </div>

              <button class="w-full rounded-xl bg-primary px-4 py-3 font-semibold text-on-primary transition hover:brightness-110" type="submit" [disabled]="form.invalid">
                Login
              </button>
            </form>

            <div class="mt-6 flex items-center justify-between text-sm">
              <a class="text-primary transition hover:underline" routerLink="/register">Create an account</a>
              <a class="text-on-surface-variant transition hover:text-primary" routerLink="/">Back home</a>
            </div>
          </div>
        </section>
      </section>
    </main>
  `,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly form = this.fb.nonNullable.group({ email: ['maya@example.com', [Validators.required, Validators.email]], password: ['password123', Validators.required] });

  submit(): void {
    const email = this.form.controls.email.value;
    this.auth.login(email);
    this.router.navigateByUrl(email.includes('admin') ? '/admin/dashboard' : '/customer/dashboard');
  }
}
