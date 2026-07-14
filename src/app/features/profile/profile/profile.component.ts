import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  template: `
    <div class="page-container">
      <div class="page-header">
        <p class="eyebrow">Customer</p>
        <h1>My Profile</h1>
        <p>Manage your account settings</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-1">
          <div class="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-6 text-center">
            <div class="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-black text-white shadow-xl"
                 style="background: linear-gradient(135deg, #10b981, #059669);">
              {{ auth.user()?.name?.charAt(0)?.toUpperCase() || 'U' }}
            </div>
            <h2 class="text-xl font-bold text-on-surface">{{ auth.user()?.name }}</h2>
            <p class="text-sm text-on-surface-variant mt-1">{{ auth.user()?.email }}</p>
            <div class="mt-4 flex justify-center">
              <span class="badge badge-success flex items-center gap-1.5">
                <span class="status-dot success"></span>
                Active Account
              </span>
            </div>
            <div class="section-divider my-6"></div>
            <div class="flex flex-col gap-3 text-sm text-left">
              <div class="flex justify-between">
                <span class="text-on-surface-variant">Role</span>
                <span class="font-semibold text-on-surface capitalize">{{ auth.user()?.role }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-on-surface-variant">Member Since</span>
                <span class="font-semibold text-on-surface">{{ (auth.user()?.createdAt | date:'yyyy') || '2026' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-on-surface-variant">Phone</span>
                <span class="font-semibold text-on-surface">{{ auth.user()?.phone || '—' }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-2">
          <div class="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-6">
            <h3 class="text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">edit</span>
              Edit Profile
            </h3>

            @if (success()) {
              <div class="mb-6 flex items-center gap-3 rounded-xl p-4 text-sm animate-fade-in"
                   style="background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.2); color: #34d399;">
                <span class="material-symbols-outlined text-lg flex-shrink-0">check_circle</span>
                Profile updated successfully.
              </div>
            }
            @if (error()) {
              <div class="mb-6 flex items-center gap-3 rounded-xl p-4 text-sm animate-fade-in"
                   style="background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); color: #f87171;">
                <span class="material-symbols-outlined text-lg flex-shrink-0">error</span>
                {{ error() }}
              </div>
            }

            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-5">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="mb-1.5 block text-sm font-semibold text-on-surface-variant">Full Name</label>
                  <div class="relative">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-lg text-outline">person</span>
                    <input type="text" formControlName="name"
                      class="w-full rounded-xl border border-outline-variant/50 bg-surface-container-high py-2.5 pl-11 pr-4 text-on-surface placeholder:text-outline/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                  </div>
                </div>
                <div>
                  <label class="mb-1.5 block text-sm font-semibold text-on-surface-variant">Email Address</label>
                  <div class="relative">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-lg text-outline">mail</span>
                    <input type="email" formControlName="email"
                      class="w-full rounded-xl border border-outline-variant/50 bg-surface-container-high py-2.5 pl-11 pr-4 text-on-surface placeholder:text-outline/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                  </div>
                </div>
              </div>

              <div>
                <label class="mb-1.5 block text-sm font-semibold text-on-surface-variant">Phone Number</label>
                <div class="relative">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-lg text-outline">phone</span>
                  <input type="tel" formControlName="phone"
                    class="w-full rounded-xl border border-outline-variant/50 bg-surface-container-high py-2.5 pl-11 pr-4 text-on-surface placeholder:text-outline/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
              </div>

              <div class="section-divider"></div>

              <div>
                <label class="mb-1.5 block text-sm font-semibold text-on-surface-variant">New Password <span class="font-normal text-outline">(optional)</span></label>
                <div class="relative">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-lg text-outline">lock</span>
                  <input [type]="showPass() ? 'text' : 'password'" formControlName="password" placeholder="Leave blank to keep current"
                    class="w-full rounded-xl border border-outline-variant/50 bg-surface-container-high py-2.5 pl-11 pr-12 text-on-surface placeholder:text-outline/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                  <button type="button" (click)="showPass.set(!showPass())"
                    class="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors">
                    <span class="material-symbols-outlined text-xl">{{ showPass() ? 'visibility_off' : 'visibility' }}</span>
                  </button>
                </div>
              </div>

              <div class="flex items-center gap-3 pt-2">
                <button type="submit" [disabled]="form.invalid || submitting()"
                  class="btn-primary px-8 py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                  @if (submitting()) {
                    <span class="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                    Saving...
                  } @else {
                    <span class="material-symbols-outlined text-lg">save</span>
                    Save Changes
                  }
                </button>
                <button type="button" (click)="resetForm()" class="btn-secondary px-6 py-3 text-sm">Reset</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ProfileComponent {
  private readonly fb = inject(FormBuilder);
  readonly auth = inject(AuthService);

  readonly submitting = signal(false);
  readonly success = signal(false);
  readonly error = signal('');
  readonly showPass = signal(false);

  readonly form = this.fb.nonNullable.group({
    name: [this.auth.user()?.name ?? '', Validators.required],
    email: [this.auth.user()?.email ?? '', [Validators.required, Validators.email]],
    phone: [this.auth.user()?.phone ?? '', Validators.required],
    password: [''],
  });

  resetForm(): void {
    const u = this.auth.user();
    this.form.patchValue({
      name: u?.name || '',
      email: u?.email || '',
      phone: u?.phone || '',
      password: '',
    });
    this.success.set(false);
    this.error.set('');
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.submitting.set(true);
    this.success.set(false);
    this.error.set('');
    setTimeout(() => {
      this.submitting.set(false);
      this.success.set(true);
    }, 1000);
  }
}
