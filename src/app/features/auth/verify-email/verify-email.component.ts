import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
import { AuthLayoutComponent } from '../shared/auth-layout.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [AuthLayoutComponent],
  templateUrl: './verify-email.component.html',
})
export class VerifyEmailComponent implements OnInit, OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly success = signal(false);
  
  readonly loadingResend = signal(false);
  readonly resendCooldown = signal(false);
  readonly resendCountdown = signal(30);
  readonly resendError = signal('');
  
  readonly email = signal('');
  readonly devCode = signal('');

  private cooldownInterval: ReturnType<typeof setInterval> | undefined;

  ngOnInit() {
    const query = this.router.parseUrl(this.router.url).queryParamMap;
    this.email.set(query.get('email') || '');
    const token = query.get('token');

    const nav = this.router.getCurrentNavigation();
    const devCode = (nav?.extras?.state as { devCode?: string } | undefined)?.devCode;
    if (devCode) this.devCode.set(devCode);

    if (token) {
      this.verifyToken(token);
    }
  }

  ngOnDestroy(): void {
    if (this.cooldownInterval) clearInterval(this.cooldownInterval);
  }

  verifyToken(token: string): void {
    this.loading.set(true);
    this.error.set('');

    this.auth.verifyEmail(token).pipe(
      finalize(() => this.loading.set(false)),
      catchError((err) => {
        this.error.set(err.error?.message || 'Verification failed or link expired.');
        return of(null);
      })
    ).subscribe((res) => {
      if (!res) return;
      this.success.set(true);
      setTimeout(() => {
        this.router.navigate(['/customer/dashboard']);
      }, 2000);
    });
  }

  onResend(): void {
    if (this.resendCooldown() || this.loadingResend()) return;
    if (!this.email()) {
      this.resendError.set('No email to resend to.');
      return;
    }

    this.loadingResend.set(true);
    this.resendError.set('');
    this.auth.resendVerification(this.email()).pipe(
      finalize(() => this.loadingResend.set(false)),
      catchError((err) => {
        this.resendError.set(err.error?.message || 'Unable to resend the link. Please try again.');
        return of(null);
      })
    ).subscribe((res) => {
      if (!res) return;
      if (res.devCode) this.devCode.set(res.devCode);
      this.startCooldown();
    });
  }

  private startCooldown(): void {
    this.resendCooldown.set(true);
    this.resendCountdown.set(30);
    this.cooldownInterval = setInterval(() => {
      this.resendCountdown.set(this.resendCountdown() - 1);
      if (this.resendCountdown() <= 0) {
        this.resendCooldown.set(false);
        if (this.cooldownInterval) clearInterval(this.cooldownInterval);
      }
    }, 1000);
  }
}
