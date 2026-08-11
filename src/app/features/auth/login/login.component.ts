import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { AuthLayoutComponent } from '../shared/auth-layout.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, AuthLayoutComponent],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly showPass = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [true],
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
