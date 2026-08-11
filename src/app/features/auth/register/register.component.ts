import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { AuthLayoutComponent } from '../shared/auth-layout.component';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return password && confirm && password !== confirm ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, AuthLayoutComponent],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly showPass = signal(false);

  private readonly passwordValue = signal('');

  readonly form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordMatchValidator });

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

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');

    const { name, email, phone, password } = this.form.value;
    this.auth.register(name!, email!, phone || '', password!).pipe(
      finalize(() => this.loading.set(false)),
      catchError((err) => {
        this.error.set(err.error?.message || 'Registration failed. Please try again.');
        return of(null);
      })
    ).subscribe((res) => {
      if (!res) return;
      this.router.navigate(['/verify-email'], {
        queryParams: { email },
        state: { devCode: res.devCode },
      });
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }
}
