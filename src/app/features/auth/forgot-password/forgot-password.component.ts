import { environment } from '../../../../environments/environment';

import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, of } from 'rxjs';
import { AuthLayoutComponent } from '../shared/auth-layout.component';

const API = environment.apiUrl;

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, AuthLayoutComponent],
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly success = signal(false);
  readonly submittedEmail = signal('');
  readonly devToken = signal('');

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');

    const email = this.form.getRawValue().email;
    this.submittedEmail.set(email);

    this.http.post<{ message: string; devToken?: string }>(`${API}/auth/forgot-password`, { email }).pipe(
      finalize(() => this.loading.set(false)),
      catchError((err) => {
        this.error.set(err.error?.message || 'Something went wrong. Please try again.');
        return of(null);
      })
    ).subscribe((res) => {
      if (!res) return;
      this.success.set(true);
      if (res.devToken) this.devToken.set(res.devToken);
    });
  }

  isFieldInvalid(fieldName: 'email'): boolean {
    const field = this.form.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }
}
