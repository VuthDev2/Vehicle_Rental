import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '../../../core/services/auth.service';
import { DataService } from '../../../core/services/data.service';
import { PaymentMethod } from '../../../models/payment.model';

@Component({
  selector: 'app-vehicle-details',
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  template: `
    @if (vehicle(); as vehicle) {
      <section class="detail-page">
        <div class="gallery">
          <img [src]="vehicle.images[0]" [alt]="vehicle.name">
          <img [src]="vehicle.images[1]" [alt]="vehicle.name + ' interior'">
        </div>
        <div class="detail-copy">
          <p class="eyebrow">{{ vehicle.brand }} · {{ vehicle.location }}</p>
          <h1>{{ vehicle.name }}</h1>
          <p class="lede">{{ vehicle.description }}</p>
          <div class="spec-grid">
            <span>{{ vehicle.year }} model</span><span>{{ vehicle.transmission }}</span><span>{{ vehicle.fuel }}</span><span>{{ vehicle.seats }} seats</span>
          </div>
          <mat-card>
            <mat-card-header><mat-card-title>Book this vehicle</mat-card-title><mat-card-subtitle>\${{ vehicle.price }} per day</mat-card-subtitle></mat-card-header>
            <mat-card-content>
              <form [formGroup]="form" class="booking-form" (ngSubmit)="book(vehicle._id)">
                <mat-form-field appearance="outline"><mat-label>Start date</mat-label><input matInput type="date" formControlName="startDate"></mat-form-field>
                <mat-form-field appearance="outline"><mat-label>End date</mat-label><input matInput type="date" formControlName="endDate"></mat-form-field>
                <mat-form-field appearance="outline"><mat-label>Payment method</mat-label><mat-select formControlName="method"><mat-option value="Card">Card</mat-option><mat-option value="PayPal">PayPal</mat-option><mat-option value="Cash">Cash</mat-option></mat-select></mat-form-field>
                <button mat-flat-button type="submit" [disabled]="form.invalid || !vehicle.available">Check availability and pay</button>
              </form>
              @if (confirmation()) { <p class="success">{{ confirmation() }}</p> }
            </mat-card-content>
          </mat-card>
        </div>
      </section>
    } @else {
      <section class="page"><h1>Vehicle not found</h1><a mat-button routerLink="/vehicles">Back to catalog</a></section>
    }
  `,
})
export class VehicleDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly data = inject(DataService);
  readonly confirmation = signal('');
  readonly vehicle = computed(() => this.data.vehicleById(this.route.snapshot.paramMap.get('id') ?? ''));
  readonly form = this.fb.nonNullable.group({
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    method: ['Card' as PaymentMethod, Validators.required],
  });

  book(vehicleId: string): void {
    if (!this.auth.isAuthenticated()) {
      this.router.navigateByUrl('/login');
      return;
    }
    const value = this.form.getRawValue();
    const booking = this.data.createBooking(this.auth.user()?._id ?? 'u1', vehicleId, value.startDate, value.endDate);
    const payment = this.data.simulatePayment(booking._id, value.method);
    this.confirmation.set(`Booking confirmed. Transaction ${payment.transactionId}.`);
  }
}
