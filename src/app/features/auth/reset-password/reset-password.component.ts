import { environment } from '../../../../environments/environment';

import { Component, computed, inject, signal, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, of } from 'rxjs';
import { AuthLayoutComponent } from '../shared/auth-layout.component';
import { AuthService } from '../../../core/services/auth.service';

const API = environment.apiUrl;

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, AuthLayoutComponent],
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly success = signal(false);
  readonly showPass = signal(false);
  readonly step = signal<1 | 2>(1);
  readonly countdown = signal(60);
  private intervalId: any;

  private readonly passwordValue = signal('');

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
  }, { validators: this.passwordMatchValidator });

  readonly passwordStrength = computed(() => {
    const pw = this.passwordValue();
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) score++;
    return Math.min(score, 3);
  });

  readonly strengthLabel = computed(() => {
    const pw = this.passwordValue();
    if (!pw) return '';
    if (pw.length < 6) return 'Too short';
    if (pw.length < 10) return 'Fair';
    if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) return 'Strong';
    return 'Good';
  });

  constructor() {
    this.form.get('password')?.valueChanges.subscribe(v => this.passwordValue.set(v || ''));
    
    // Try to get email from router state
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras.state?.['email']) {
      this.form.patchValue({ email: nav.extras.state['email'] });
    }
    
    this.startCountdown();
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }

  startCountdown(): void {
    this.countdown.set(60);
    clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      const current = this.countdown();
      if (current > 0) {
        this.countdown.set(current - 1);
      } else {
        clearInterval(this.intervalId);
      }
    }, 1000);
  }

  resendCode(): void {
    if (this.countdown() > 0) return;
    
    const email = this.form.get('email')?.value;
    if (!email) return;

    this.loading.set(true);
    this.error.set('');

    this.http.post<any>(`${API}/auth/forgot-password`, { email }).pipe(
      finalize(() => this.loading.set(false)),
      catchError((err) => {
        this.error.set(err.error?.message || 'Failed to resend code.');
        return of(null);
      })
    ).subscribe((res) => {
      if (!res) return;
      this.startCountdown();
    });
  }

  get maskedEmail(): string {
    const email = this.form.get('email')?.value || '';
    if (!email || !email.includes('@')) return email;
    const [local, domain] = email.split('@');
    if (local.length <= 2) return `${local}***@${domain}`;
    return `${local.substring(0, 2)}${'*'.repeat(local.length - 2)}@${domain}`;
  }

  onOtpInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    let val = input.value;
    
    // Force numeric only
    if (val && !/^\d$/.test(val)) {
      input.value = '';
      val = '';
    }

    if (val && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
      if (next) next.focus();
    }
    this.updateOtpForm();
  }

  onOtpKeydown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace') {
      const input = event.target as HTMLInputElement;
      if (!input.value && index > 0) {
        const prev = document.getElementById(`otp-${index - 1}`) as HTMLInputElement;
        if (prev) {
          prev.focus();
          prev.value = '';
        }
      }
      setTimeout(() => this.updateOtpForm(), 0);
    }
  }

  onOtpPaste(event: ClipboardEvent): void {
    const paste = event.clipboardData?.getData('text');
    if (paste && paste.length === 6 && /^\d+$/.test(paste)) {
      event.preventDefault();
      for (let i = 0; i < 6; i++) {
        const input = document.getElementById(`otp-${i}`) as HTMLInputElement;
        if (input) input.value = paste[i];
      }
      this.updateOtpForm();
      const last = document.getElementById(`otp-5`) as HTMLInputElement;
      if (last) last.focus();
    }
  }

  private updateOtpForm(): void {
    let otp = '';
    for (let i = 0; i < 6; i++) {
      const input = document.getElementById(`otp-${i}`) as HTMLInputElement;
      if (input) otp += input.value;
    }
    this.form.patchValue({ otp });
    this.form.get('otp')?.markAsTouched();
    
    // Auto-submit if complete and valid
    if (otp.length === 6 && this.form.get('otp')?.valid && !this.loading()) {
      this.onVerifyOtp();
    }
  }

  strengthColor(level: number): string {
    const pw = this.passwordValue();
    if (pw.length < 6) return '#f87171';
    if (pw.length < 10) return '#fbbf24';
    return '#34d399';
  }

  private passwordMatchValidator(g: any) {
    const p = g.get('password')?.value;
    const c = g.get('confirmPassword')?.value;
    return p && c && p !== c ? { passwordMismatch: true } : null;
  }

  onVerifyOtp(): void {
    const emailCtrl = this.form.get('email');
    const otpCtrl = this.form.get('otp');
    emailCtrl?.markAsTouched();
    otpCtrl?.markAsTouched();
    
    if (emailCtrl?.invalid || otpCtrl?.invalid) return;

    this.loading.set(true);
    this.error.set('');

    const email = emailCtrl?.value;
    const otp = otpCtrl?.value;

    this.http.post<any>(`${API}/auth/verify-reset-otp`, { email, otp }).pipe(
      finalize(() => this.loading.set(false)),
      catchError((err) => {
        this.error.set(err.error?.message || 'Invalid or expired code. Please try again.');
        
        // Clear OTP inputs on error for better UX
        this.form.patchValue({ otp: '' });
        this.form.get('otp')?.markAsUntouched();
        for (let i = 0; i < 6; i++) {
          const input = document.getElementById(`otp-${i}`) as HTMLInputElement;
          if (input) input.value = '';
        }
        setTimeout(() => {
          const first = document.getElementById('otp-0') as HTMLInputElement;
          if (first) first.focus();
        }, 0);

        return of(null);
      })
    ).subscribe((res) => {
      if (!res) return;
      this.step.set(2);
      this.error.set('');
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    
    this.loading.set(true);
    this.error.set('');

    const { email, otp, password } = this.form.value;

    this.auth.resetPassword(email!, otp!, password!).pipe(
      finalize(() => this.loading.set(false)),
      catchError((err) => {
        this.error.set(err.error?.message || 'Something went wrong. Please try again.');
        return of(null);
      })
    ).subscribe((res: any) => {
      if (!res) return;
      this.router.navigate(['/']);
    });
  }

  isFieldInvalid(fieldName: 'email' | 'otp' | 'password' | 'confirmPassword'): boolean {
    const field = this.form.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }
}
