import { environment } from '../../../../environments/environment';

import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, of } from 'rxjs';
import { AuthLayoutComponent } from '../shared/auth-layout.component';

const API = environment.apiUrl;

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, AuthLayoutComponent],
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly success = signal(false);
  readonly showPass = signal(false);

  private readonly passwordValue = signal('');

  readonly form = this.fb.group({
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

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');

    const token = this.route.snapshot.params['token'];
    const password = this.form.value.password;

    this.http.post<any>(`${API}/auth/reset-password/${token}`, { password }).pipe(
      finalize(() => this.loading.set(false)),
      catchError((err) => {
        this.error.set(err.error?.message || 'Invalid or expired reset link. Please try again.');
        return of(null);
      })
    ).subscribe((res) => {
      if (!res) return;
      this.success.set(true);
    });
  }

  isFieldInvalid(fieldName: 'password' | 'confirmPassword'): boolean {
    const field = this.form.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }
}
