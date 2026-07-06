import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { VehicleService } from '../../../core/services/vehicle.service';
import { BookingService } from '../../../core/services/booking.service';
import { Vehicle } from '../../../models/vehicle.model';

@Component({
  selector: 'app-vehicle-details',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-background pb-16 pt-6">
      <div class="mx-auto max-w-container-max px-margin-desktop">
        @if (loading()) {
          <div class="animate-pulse">
            <div class="mb-6 h-10 w-1/3 rounded-xl bg-surface-container-high"></div>
            <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div class="lg:col-span-2">
                <div class="mb-4 h-[400px] rounded-2xl bg-surface-container-high"></div>
              </div>
              <div>
                <div class="h-[300px] rounded-2xl bg-surface-container-high"></div>
              </div>
            </div>
          </div>
        } @else if (error()) {
          <div class="flex flex-col items-center justify-center py-24 text-center">
            <span class="material-symbols-outlined mb-4 text-6xl text-outline">error</span>
            <h2 class="text-xl font-bold text-on-surface">Vehicle not found</h2>
            <p class="mt-2 text-on-surface-variant">{{ error() }}</p>
            <a routerLink="/vehicles" class="mt-6 rounded-full bg-primary px-6 py-2.5 font-bold text-on-primary hover:brightness-110">Back to Catalog</a>
          </div>
        } @else if (vehicle()) {
          <div class="mb-6">
            <a routerLink="/vehicles" class="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors">
              <span class="material-symbols-outlined text-sm">arrow_back</span> Back to vehicles
            </a>
            <div class="flex items-center gap-3">
              <h1 class="text-3xl font-bold text-on-surface">{{ vehicle()?.name }}</h1>
              @if (vehicle()?.available) {
                <span class="rounded-lg border border-green-500/30 bg-green-500/20 px-2.5 py-1 text-xs font-bold text-green-400">Available</span>
              } @else {
                <span class="rounded-lg border border-red-500/30 bg-red-500/20 px-2.5 py-1 text-xs font-bold text-red-400">Not Available</span>
              }
            </div>
            <p class="mt-1 text-sm text-on-surface-variant">{{ vehicle()?.brand }} · {{ vehicle()?.year }} · {{ vehicle()?.location }}</p>
          </div>

          <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div class="lg:col-span-2">
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                @for (img of vehicle()?.images; track img) {
                  <img [src]="img" class="h-[300px] w-full rounded-2xl object-cover shadow-lg" [alt]="vehicle()?.name" />
                }
              </div>
              
              <div class="mt-8 rounded-2xl border border-outline-variant/30 bg-surface-container-low p-6">
                <h3 class="mb-4 text-xl font-bold text-on-surface">Description</h3>
                <p class="text-on-surface-variant leading-relaxed">{{ vehicle()?.description }}</p>

                <h3 class="mb-4 mt-8 text-xl font-bold text-on-surface">Specifications</h3>
                <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div class="flex flex-col gap-1 rounded-xl bg-surface-container-high p-4">
                    <span class="material-symbols-outlined text-outline">category</span>
                    <span class="text-xs font-bold uppercase tracking-widest text-outline">Type</span>
                    <span class="font-semibold text-on-surface">{{ vehicle()?.type }}</span>
                  </div>
                  <div class="flex flex-col gap-1 rounded-xl bg-surface-container-high p-4">
                    <span class="material-symbols-outlined text-outline">local_gas_station</span>
                    <span class="text-xs font-bold uppercase tracking-widest text-outline">Fuel</span>
                    <span class="font-semibold text-on-surface">{{ vehicle()?.fuel }}</span>
                  </div>
                  <div class="flex flex-col gap-1 rounded-xl bg-surface-container-high p-4">
                    <span class="material-symbols-outlined text-outline">settings</span>
                    <span class="text-xs font-bold uppercase tracking-widest text-outline">Transmission</span>
                    <span class="font-semibold text-on-surface">{{ vehicle()?.transmission }}</span>
                  </div>
                  <div class="flex flex-col gap-1 rounded-xl bg-surface-container-high p-4">
                    <span class="material-symbols-outlined text-outline">airline_seat_recline_extra</span>
                    <span class="text-xs font-bold uppercase tracking-widest text-outline">Seats</span>
                    <span class="font-semibold text-on-surface">{{ vehicle()?.seats }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="sticky top-24 h-fit rounded-2xl border border-outline-variant/30 bg-surface-container-low p-6 shadow-2xl">
              <h3 class="mb-4 text-xl font-bold text-on-surface">Book this vehicle</h3>
              
              <div class="mb-6 grid grid-cols-3 gap-2">
                <div class="flex flex-col items-center justify-center rounded-xl bg-surface-container-high p-3">
                  <span class="text-xs font-bold uppercase text-outline">Day</span>
                  <span class="font-bold text-secondary">\${{ vehicle()?.pricing?.day }}</span>
                </div>
                <div class="flex flex-col items-center justify-center rounded-xl bg-surface-container-high p-3">
                  <span class="text-xs font-bold uppercase text-outline">Week</span>
                  <span class="font-bold text-secondary">\${{ vehicle()?.pricing?.week }}</span>
                </div>
                <div class="flex flex-col items-center justify-center rounded-xl bg-surface-container-high p-3">
                  <span class="text-xs font-bold uppercase text-outline">Month</span>
                  <span class="font-bold text-secondary">\${{ vehicle()?.pricing?.month }}</span>
                </div>
              </div>

              <form [formGroup]="form" (ngSubmit)="book()" class="flex flex-col gap-4">
                <div>
                  <label class="mb-1 block text-sm font-semibold text-on-surface">Rental Type</label>
                  <select formControlName="rentalType" class="w-full rounded-xl border border-outline-variant/50 bg-surface-container-high px-3 py-2.5 text-on-surface focus:border-primary focus:outline-none">
                    <option value="day">Daily</option>
                    <option value="week">Weekly</option>
                    <option value="month">Monthly</option>
                  </select>
                </div>
                
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="mb-1 block text-sm font-semibold text-on-surface">Start Date</label>
                    <input type="date" formControlName="startDate" class="w-full rounded-xl border border-outline-variant/50 bg-surface-container-high px-3 py-2.5 text-on-surface [color-scheme:dark] focus:border-primary focus:outline-none" />
                  </div>
                  <div>
                    <label class="mb-1 block text-sm font-semibold text-on-surface">End Date</label>
                    <input type="date" formControlName="endDate" class="w-full rounded-xl border border-outline-variant/50 bg-surface-container-high px-3 py-2.5 text-on-surface [color-scheme:dark] focus:border-primary focus:outline-none" />
                  </div>
                </div>

                <div>
                  <label class="mb-1 block text-sm font-semibold text-on-surface">Quantity ({{ form.get('rentalType')?.value }}s)</label>
                  <input type="number" min="1" formControlName="quantity" class="w-full rounded-xl border border-outline-variant/50 bg-surface-container-high px-3 py-2.5 text-on-surface focus:border-primary focus:outline-none" />
                </div>

                @if (submitError()) {
                  <div class="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
                    {{ submitError() }}
                  </div>
                }

                <button type="submit" [disabled]="form.invalid || submitting() || !vehicle()?.available"
                  class="mt-2 w-full rounded-xl bg-primary py-3.5 font-bold text-on-primary shadow-lg shadow-primary/20 hover:brightness-110 disabled:opacity-50 transition-all flex justify-center items-center gap-2">
                  @if (submitting()) {
                    <span class="material-symbols-outlined animate-spin">progress_activity</span> Processing...
                  } @else {
                    Book Now
                  }
                </button>
              </form>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class VehicleDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly vehicleService = inject(VehicleService);
  private readonly bookingService = inject(BookingService);

  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly error = signal('');
  readonly submitError = signal('');
  readonly vehicle = signal<Vehicle | null>(null);

  readonly form = this.fb.nonNullable.group({
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    rentalType: ['day', Validators.required],
    quantity: [1, [Validators.required, Validators.min(1)]],
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.vehicleService.getVehicle(id).subscribe({
        next: (res) => {
          this.vehicle.set(res.vehicle);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Failed to load vehicle');
          this.loading.set(false);
        },
      });
    }
  }

  book(): void {
    if (!this.auth.isAuthenticated()) {
      this.router.navigateByUrl('/login');
      return;
    }
    if (this.form.invalid || !this.vehicle()) return;

    this.submitting.set(true);
    this.submitError.set('');

    const value = this.form.getRawValue();
    this.bookingService.createBooking({
      vehicleId: this.vehicle()!._id,
      ...value,
    }).subscribe({
      next: (res) => {
        // In a real app we might redirect to checkout here.
        this.router.navigate(['/customer/bookings']);
      },
      error: (err) => {
        this.submitError.set(err.error?.message || 'Failed to create booking.');
        this.submitting.set(false);
      },
    });
  }
}
