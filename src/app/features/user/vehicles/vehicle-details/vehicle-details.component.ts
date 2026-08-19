import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VehicleService } from '../../../../core/services/vehicle.service';
import { BookingService } from '../../../../core/services/booking.service';
import { Vehicle } from '../../../../models/vehicle.model';

@Component({
  selector: 'app-vehicle-details',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './vehicle-details.component.html',
  styleUrl: './vehicle-details.component.css',
})
export class VehicleDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly vehicleService = inject(VehicleService);
  private readonly bookingService = inject(BookingService);
  private readonly router = inject(Router);

  protected readonly Math = Math;

  readonly loading = signal(true);
  readonly vehicle = signal<Vehicle | null>(null);
  readonly selectedImage = signal(0);
  readonly startDate = signal('');
  readonly endDate = signal('');
  readonly qty = signal(1);
  readonly rentalType = signal<'daily' | 'hourly'>('daily');
  readonly submitting = signal(false);
  readonly bookingError = signal('');

  get today(): string {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  }

  get tomorrow(): string {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }

  ngOnInit() {
    // Initialise default dates if unset
    if (!this.startDate()) {
      this.startDate.set(this.today);
    }
    if (!this.endDate()) {
      this.endDate.set(this.tomorrow);
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.vehicleService.getVehicle(id).subscribe({
        next: (res) => {
          this.vehicle.set(res.vehicle);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    }
  }

  setStartDate(val: string) {
    this.startDate.set(val);
    this.bookingError.set('');
    // If end date is before new start date, adjust end date
    if (this.endDate() && this.endDate() < val) {
      this.endDate.set(val);
    }
  }

  setEndDate(val: string) {
    this.endDate.set(val);
    this.bookingError.set('');
  }

  setRentalType(type: 'daily' | 'hourly') {
    this.rentalType.set(type);
    this.bookingError.set('');
  }

  get specs() {
    const v = this.vehicle();
    if (!v) return [];
    return [
      { icon: 'groups', label: 'Seats', value: (v.seats || 4) + ' Seats' },
      { icon: this.getFuelIcon(v.fuel), label: 'Fuel Type', value: v.fuel || 'Petrol' },
      { icon: 'settings', label: 'Transmission', value: v.transmission || 'Automatic' },
      { icon: 'calendar_today', label: 'Model Year', value: String(v.year || '2024') },
    ];
  }

  getFuelIcon(fuel?: string): string {
    const map: Record<string, string> = {
      Petrol: 'local_gas_station',
      Diesel: 'local_gas_station',
      Hybrid: 'eco',
      Electric: 'bolt',
      'N/A': 'help',
    };
    return (fuel && map[fuel]) || 'local_gas_station';
  }

  /** Days between the selected dates (min 1). */
  get rentalDays(): number {
    const start = this.startDate();
    const end = this.endDate();
    if (start && end && end >= start) {
      const ms = new Date(end).getTime() - new Date(start).getTime();
      const d = Math.round(ms / 86_400_000);
      return Math.max(1, d);
    }
    return 1;
  }

  /** Number of billable units (days, or hours when hourly) used for the estimate & API. */
  get estimateUnits(): number {
    return this.rentalType() === 'hourly' ? this.rentalDays * 8 : this.rentalDays;
  }

  get estimate(): number {
    const v = this.vehicle();
    if (!v) return 0;
    const rate =
      this.rentalType() === 'hourly' ? v.pricing?.hour || 0 : v.pricing?.day || 0;
    return rate * this.estimateUnits * this.qty();
  }

  get rates() {
    const v = this.vehicle();
    if (!v || !v.pricing) return [];
    const p = v.pricing;
    return [
      { label: 'Hourly', value: p.hour, suffix: 'hr' },
      { label: 'Daily', value: p.day, suffix: 'day' },
      { label: 'Weekly', value: p.week, suffix: 'wk' },
      { label: 'Monthly', value: p.month, suffix: 'mo' },
    ].filter((r) => r.value != null && r.value > 0);
  }

  book(): void {
    if (this.submitting()) return;

    const start = this.startDate();
    const end = this.endDate();
    const v = this.vehicle();

    if (!start || !end) {
      this.bookingError.set('Please select both a start and end date.');
      return;
    }
    if (end < start) {
      this.bookingError.set('The end date must be after or equal to the start date.');
      return;
    }
    if (!v) return;

    this.bookingError.set('');
    this.submitting.set(true);

    this.bookingService
      .createBooking({
        vehicleId: v._id,
        startDate: start,
        endDate: end,
        rentalType: this.rentalType() === 'hourly' ? 'hour' : 'day',
        quantity: Math.max(1, this.estimateUnits) * this.qty(),
      })
      .subscribe({
        next: (res) => this.router.navigate(['/customer/checkout', res.booking._id]),
        error: (err) => {
          this.submitting.set(false);
          this.bookingError.set(
            err.error?.message || 'Unable to create your booking. Please try again.'
          );
        },
      });
  }
}
