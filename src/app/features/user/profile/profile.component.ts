import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const pw = control.get('newPassword')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return pw && confirm && pw !== confirm ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, RouterLink],
  templateUrl: './profile.component.html',
})
export class ProfileComponent {
  private readonly fb = inject(FormBuilder);
  readonly auth = inject(AuthService);
  private readonly userService = inject(UserService);

  readonly submitting = signal(false);
  readonly success = signal(false);
  readonly error = signal('');
  readonly showPass = signal(false);

  readonly pwSubmitting = signal(false);
  readonly pwSuccess = signal(false);
  readonly pwError = signal('');
  readonly showCurrentPass = signal(false);
  readonly showNewPass = signal(false);

  readonly form = this.fb.nonNullable.group({
    name: [this.auth.user()?.name ?? '', Validators.required],
    phone: [this.auth.user()?.phone ?? '', Validators.required],
  });

  readonly passwordForm = this.fb.nonNullable.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator }
  );

  get userId(): string {
    return this.auth.user()?._id || '';
  }

  get emailVerified(): boolean {
    return !!this.auth.user()?.emailVerified;
  }

  logout(): void {
    if (confirm('Sign out of your account?')) {
      this.auth.logout();
    }
  }

  resetForm(): void {
    const u = this.auth.user();
    this.form.patchValue({ name: u?.name || '', phone: u?.phone || '' });
    this.success.set(false);
    this.error.set('');
  }

  onSubmit(): void {
    if (this.form.invalid || !this.userId) return;
    this.submitting.set(true);
    this.success.set(false);
    this.error.set('');

    const { name, phone } = this.form.value;
    this.userService
      .updateUser(this.userId, { name: name!, phone: phone! })
      .pipe(
        finalize(() => this.submitting.set(false)),
        catchError((err) => {
          this.error.set(err.error?.message || 'Failed to save changes. Please try again.');
          return of(null);
        })
      )
      .subscribe((res) => {
        if (!res) return;
        this.auth.updateUser(res.user);
        this.success.set(true);
      });
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid) return;
    this.pwSubmitting.set(true);
    this.pwSuccess.set(false);
    this.pwError.set('');

    const { currentPassword, newPassword } = this.passwordForm.value;
    this.auth
      .changePassword(currentPassword!, newPassword!)
      .pipe(
        finalize(() => this.pwSubmitting.set(false)),
        catchError((err) => {
          this.pwError.set(err.error?.message || 'Unable to change password. Please try again.');
          return of(null);
        })
      )
      .subscribe((res) => {
        if (!res) return;
        this.passwordForm.reset();
        this.pwSuccess.set(true);
      });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  isPwFieldInvalid(fieldName: string): boolean {
    const field = this.passwordForm.get(fieldName);
    if (fieldName === 'confirmPassword') {
      return !!(
        (field?.invalid && field?.touched) ||
        (this.passwordForm.hasError('passwordMismatch') && field?.touched)
      );
    }
    return !!(field?.invalid && field?.touched);
  }
}
