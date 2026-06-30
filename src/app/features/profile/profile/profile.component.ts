import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule],
  template: `
    <section class="page narrow">
      <p class="eyebrow">Profile</p>
      <h1>Account settings</h1>
      <mat-card>
        <mat-card-content>
          <form class="stack-form" [formGroup]="form">
            <mat-form-field appearance="outline"><mat-label>Name</mat-label><input matInput formControlName="name"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Email</mat-label><input matInput formControlName="email"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Phone</mat-label><input matInput formControlName="phone"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>New password</mat-label><input matInput type="password" formControlName="password"></mat-form-field>
            <button mat-flat-button type="button" [disabled]="form.invalid">Save profile</button>
          </form>
        </mat-card-content>
      </mat-card>
    </section>
  `,
})
export class ProfileComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  readonly form = this.fb.nonNullable.group({
    name: [this.auth.user()?.name ?? '', Validators.required],
    email: [this.auth.user()?.email ?? '', [Validators.required, Validators.email]],
    phone: [this.auth.user()?.phone ?? '', Validators.required],
    password: [''],
  });
}
