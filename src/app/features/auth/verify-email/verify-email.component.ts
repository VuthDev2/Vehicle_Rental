import { Component, inject, signal, ViewChildren, QueryList, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { catchError, finalize, of } from 'rxjs';
import { AuthLayoutComponent } from '../shared/auth-layout.component';
import { AuthService } from '../../../core/services/auth.service';

/** Masks an email for display, e.g. j***@example.com */
function maskEmail(email: string): string {
  if (!email) return 'your email address';
  const at = email.indexOf('@');
  if (at <= 1) return email;
  return `${email.slice(0, 1)}***${email.slice(at)}`;
}

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [FormsModule, RouterLink, AuthLayoutComponent],
  templateUrl: './verify-email.component.html',
})
export class VerifyEmailComponent implements OnInit, OnDestroy {
  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef<HTMLInputElement>>;

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly otp = ['', '', '', '', '', ''];
  readonly loading = signal(false);
  readonly error = signal('');
  readonly otpError = signal(false);
  readonly success = signal(false);
  readonly resendCooldown = signal(false);
  readonly resendCountdown = signal(30);
  readonly resendError = signal('');
  readonly email = signal('');
  readonly devCode = signal('');

  get maskedEmail(): string {
    return maskEmail(this.email());
  }

  private cooldownInterval: ReturnType<typeof setInterval> | undefined;

  ngOnInit() {
    const query = this.router.parseUrl(this.router.url).queryParamMap;
    this.email.set(query.get('email') || '');

    // Dev mode: the backend returns the code directly when SMTP is not configured.
    const nav = this.router.getCurrentNavigation();
    const devCode = (nav?.extras?.state as { devCode?: string } | undefined)?.devCode;
    if (devCode) this.devCode.set(devCode);
  }

  ngOnDestroy(): void {
    if (this.cooldownInterval) clearInterval(this.cooldownInterval);
  }

  get otpCode(): string {
    return this.otp.join('');
  }

  onOtpInput(index: number): void {
    const inputs = this.otpInputs.toArray();
    if (this.otp[index] && index < 5) {
      inputs[index + 1]?.nativeElement.focus();
    }
    this.otpError.set(false);
    this.error.set('');
    if (this.otpCode.length === 6) {
      this.onVerify();
    }
  }

  onOtpKeydown(event: KeyboardEvent, index: number): void {
    const inputs = this.otpInputs.toArray();
    if (event.key === 'Backspace' && !this.otp[index] && index > 0) {
      inputs[index - 1]?.nativeElement.focus();
    }
  }

  onVerify(): void {
    if (this.otpCode.length < 6 || this.loading()) return;
    if (!this.email()) {
      this.error.set('Missing email address. Please go back and register again.');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.otpError.set(false);

    this.auth.verifyEmail(this.email(), this.otpCode).pipe(
      finalize(() => this.loading.set(false)),
      catchError((err) => {
        this.otpError.set(true);
        this.error.set(err.error?.message || 'Verification failed. Please try again.');
        return of(null);
      })
    ).subscribe((res) => {
      if (!res) return;
      this.success.set(true);
    });
  }

  onResend(): void {
    if (this.resendCooldown() || this.loading()) return;
    if (!this.email()) {
      this.error.set('Missing email address. Please go back and register again.');
      return;
    }

    this.resendError.set('');
    this.auth.resendVerification(this.email()).pipe(
      catchError((err) => {
        this.resendError.set(err.error?.message || 'Unable to resend the code. Please try again.');
        return of(null);
      })
    ).subscribe((res) => {
      if (!res) return;
      if (res.devCode) this.devCode.set(res.devCode);
      this.otpError.set(false);
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
