import { Component, computed, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { UserService } from '../../../core/services/user.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const pw = control.get('newPassword')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return pw && confirm && pw !== confirm ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent {
  private readonly fb = inject(FormBuilder);
  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);
  private readonly userService = inject(UserService);

  readonly submitting = signal(false);
  readonly success = signal(false);
  readonly error = signal('');
  readonly showPass = signal(false);
  readonly avatarSubmitting = signal(false);
  readonly avatarError = signal('');

  readonly pwSubmitting = signal(false);
  readonly pwSuccess = signal(false);
  readonly pwError = signal('');
  readonly showCurrentPass = signal(false);
  readonly showNewPass = signal(false);

  readonly profileCompletion = computed(() => {
    const user = this.auth.user();
    const checks = [!!user?.name, !!user?.email, !!user?.phone, !!user?.emailVerified, !!user?.avatar];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  });

  readonly accountHighlights = computed(() => [
    {
      label: 'Account type',
      value: this.auth.user()?.role === 'admin' ? 'Administrator' : 'Customer',
      icon: 'workspace_premium',
    },
    {
      label: 'Member since',
      value: this.auth.user()?.createdAt
        ? new Date(this.auth.user()!.createdAt!).getFullYear().toString()
        : '2026',
      icon: 'calendar_month',
    },
    {
      label: 'Profile complete',
      value: `${this.profileCompletion()}%`,
      icon: 'fact_check',
    },
  ]);

  readonly securityItems = computed(() => [
    {
      label: 'Email verification',
      value: this.emailVerified ? 'Verified' : 'Action needed',
      icon: this.emailVerified ? 'mark_email_read' : 'mark_email_unread',
      good: this.emailVerified,
    },
    {
      label: 'Password',
      value: 'Protected',
      icon: 'encrypted',
      good: true,
    },
  ]);

  get initials(): string {
    const name = this.auth.user()?.name?.trim();
    if (!name) return 'U';
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }

  get avatarUrl(): string {
    return this.auth.user()?.avatar || '';
  }

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
    this.auth.logout();
  }

  resetForm(): void {
    const u = this.auth.user();
    this.form.patchValue({ name: u?.name || '', phone: u?.phone || '' });
    this.success.set(false);
    this.error.set('');
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';

    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.avatarError.set('Please choose an image file.');
      return;
    }
    if (file.size > 1_000_000) {
      this.avatarError.set('Please choose an image under 1 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => this.saveAvatar(String(reader.result || ''));
    reader.onerror = () => this.avatarError.set('Unable to read this image. Please try another file.');
    reader.readAsDataURL(file);
  }

  removeAvatar(): void {
    this.saveAvatar('');
  }

  private saveAvatar(avatar: string): void {
    if (!this.userId) return;
    this.avatarSubmitting.set(true);
    this.avatarError.set('');
    this.success.set(false);

    this.userService
      .updateUser(this.userId, { avatar })
      .pipe(
        finalize(() => this.avatarSubmitting.set(false)),
        catchError((err) => {
          this.avatarError.set(err.error?.message || 'Failed to update profile image.');
          return of(null);
        })
      )
      .subscribe((res) => {
        if (!res) return;
        this.auth.updateUser(res.user);
        this.success.set(true);
      });
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
