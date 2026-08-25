import { Component, inject, signal, AfterViewInit, NgZone } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { AuthLayoutComponent } from '../shared/auth-layout.component';
import { environment } from '../../../../environments/environment';

declare var google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, AuthLayoutComponent],
  templateUrl: './login.component.html',
})
export class LoginComponent implements AfterViewInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly ngZone = inject(NgZone);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly showPass = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@gmail\.com$/)]],
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

  ngAfterViewInit(): void {
    if (typeof google === 'undefined' || !google.accounts) {
      console.warn('Google Identity Services not loaded.');
      return;
    }
    
    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: this.handleCredentialResponse.bind(this),
      locale: 'en'
    });

    google.accounts.id.renderButton(
      document.getElementById('googleBtn'),
      { theme: 'outline', size: 'large', type: 'standard', text: 'continue_with', width: 400 }
    );
  }

  handleCredentialResponse(response: any): void {
    this.loading.set(true);
    this.error.set('');
    
    // Google returns the ID token in response.credential
    this.auth.googleLogin(response.credential).pipe(
      finalize(() => {
        // Must use NgZone because Google's callback is outside Angular's zone
        this.ngZone.run(() => this.loading.set(false));
      }),
      catchError((err) => {
        this.ngZone.run(() => {
          this.error.set(err.error?.message || 'Google authentication failed.');
        });
        return of(null);
      })
    ).subscribe((res) => {
      if (!res) return;
      this.ngZone.run(() => {
        const targetRoute = res.user.role === 'admin' ? '/admin/dashboard' : '/customer/dashboard';
        this.router.navigateByUrl(targetRoute);
      });
    });
  }

  isFieldInvalid(fieldName: 'email' | 'password'): boolean {
    const field = this.form.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }
}
