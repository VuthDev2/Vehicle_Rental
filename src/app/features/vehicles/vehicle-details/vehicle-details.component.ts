import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VehicleService } from '../../../core/services/vehicle.service';
import { BookingService } from '../../../core/services/booking.service';
import { PaymentService, PaywayForm } from '../../../core/services/payment.service';
import { Vehicle } from '../../../models/vehicle.model';

@Component({
  selector: 'app-vehicle-details',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="page-container">
      @if (loading()) {
        <div class="flex flex-col gap-6">
          <div class="h-8 w-1/4 skeleton"></div>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="aspect-[16/9] rounded-2xl skeleton"></div>
            <div class="space-y-4">
              <div class="h-8 w-2/3 skeleton"></div>
              <div class="h-4 w-1/3 skeleton"></div>
              <div class="h-20 skeleton"></div>
            </div>
          </div>
        </div>
      } @else if (vehicle()) {
        <a routerLink="/vehicles" class="inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary transition-colors mb-4">
          <span class="material-symbols-outlined">chevron_left</span>
          Back to Fleet
        </a>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <div>
            <div class="relative aspect-[16/9] rounded-2xl overflow-hidden bg-surface-container-high">
              @if (vehicle()!.images?.[selectedImage()]) {
                <img [src]="vehicle()!.images[selectedImage()]" class="w-full h-full object-cover transition-all duration-300" />
              } @else {
                <div class="w-full h-full flex items-center justify-center">
                  <span class="material-symbols-outlined text-6xl text-outline">directions_car</span>
                </div>
              }
              <span class="absolute top-4 left-4 badge badge-primary">{{ vehicle()!.type }}</span>
            </div>
            @if (vehicle()!.images?.length > 1) {
              <div class="flex gap-3 mt-3 overflow-x-auto pb-1">
                @for (img of vehicle()!.images; track $index) {
                  <button (click)="selectedImage.set($index)"
                    [class]="$index === selectedImage()
                      ? 'w-20 h-16 rounded-xl overflow-hidden flex-shrink-0 ring-2 ring-primary ring-offset-2 ring-offset-bg-surface transition-all'
                      : 'w-20 h-16 rounded-xl overflow-hidden flex-shrink-0 opacity-60 hover:opacity-100 transition-all'">
                    <img [src]="img" class="w-full h-full object-cover" />
                  </button>
                }
              </div>
            }
          </div>

          <div>
            <div class="flex items-start justify-between gap-4">
              <div>
                <h1 class="text-2xl sm:text-3xl font-black text-on-surface">{{ vehicle()!.name }}</h1>
                <p class="text-sm text-on-surface-variant mt-1">{{ vehicle()!.type }} &middot; {{ vehicle()!.year }}</p>
              </div>
              <div class="text-right flex-shrink-0">
                <p class="text-2xl sm:text-3xl font-black text-secondary">\${{ vehicle()!.pricing?.day }}</p>
                <p class="text-xs text-on-surface-variant">per day</p>
              </div>
            </div>

            <div class="section-divider my-5"></div>

            <p class="text-sm text-on-surface-variant leading-relaxed">{{ vehicle()!.description || 'No description available.' }}</p>

            <div class="section-divider my-5"></div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              @for (spec of specs; track spec.label) {
                <div class="rounded-xl bg-surface-container-high p-3 text-center">
                  <span class="material-symbols-outlined text-xl text-primary block mb-1">{{ spec.icon }}</span>
                  <p class="text-xs font-semibold text-on-surface">{{ spec.value }}</p>
                  <p class="text-[10px] text-on-surface-variant">{{ spec.label }}</p>
                </div>
              }
            </div>

            <div class="section-divider my-5"></div>

            <div class="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-5">
              <h3 class="text-base font-bold text-on-surface mb-4 flex items-center gap-2">
                <span class="material-symbols-outlined text-primary">calendar_today</span>
                Book This Vehicle
              </h3>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="mb-1.5 block text-sm font-semibold text-on-surface-variant">Start Date</label>
                  <input type="date" [(ngModel)]="startDate" [min]="today"
                    class="w-full rounded-xl border border-outline-variant/50 bg-surface-container-high py-2.5 px-4 text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
                <div>
                  <label class="mb-1.5 block text-sm font-semibold text-on-surface-variant">End Date</label>
                  <input type="date" [(ngModel)]="endDate" [min]="startDate() || today"
                    class="w-full rounded-xl border border-outline-variant/50 bg-surface-container-high py-2.5 px-4 text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label class="mb-1.5 block text-sm font-semibold text-on-surface-variant">Quantity</label>
                  <div class="flex items-center rounded-xl border border-outline-variant/50 bg-surface-container-high overflow-hidden">
                    <button (click)="qty.set(Math.max(1, qty() - 1))"
                      class="px-3 py-2.5 text-outline hover:text-on-surface hover:bg-surface-container-high/80 transition-all text-lg font-bold">–</button>
                    <span class="flex-1 text-center font-bold text-on-surface bg-transparent">{{ qty() }}</span>
                    <button (click)="qty.set(qty() + 1)"
                      class="px-3 py-2.5 text-outline hover:text-on-surface hover:bg-surface-container-high/80 transition-all text-lg font-bold">+</button>
                  </div>
                </div>
                <div>
                  <label class="mb-1.5 block text-sm font-semibold text-on-surface-variant">Rental Type</label>
                  <select [(ngModel)]="rentalType"
                    class="w-full rounded-xl border border-outline-variant/50 bg-surface-container-high py-2.5 px-4 text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all">
                    <option value="day">Daily</option>
                    <option value="hour">Hourly</option>
                    <option value="week">Weekly</option>
                    <option value="month">Monthly</option>
                  </select>
                </div>
              </div>
              <div class="section-divider my-4"></div>
              @if (error()) {
                <div class="mb-4 flex items-center gap-2 rounded-xl p-3 text-sm"
                     style="background: rgba(239,68,68,0.08); color: #f87171;">
                  <span class="material-symbols-outlined text-lg">error</span>
                  {{ error() }}
                </div>
              }
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-xs text-on-surface-variant">Estimated Total</p>
                  <p class="text-xl font-black text-secondary">\${{ estimate }}</p>
                </div>
                <button (click)="book()" [disabled]="submitting()"
                  class="btn-primary text-sm px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed">
                  @if (submitting()) {
                    <span class="material-symbols-outlined animate-spin">progress_activity</span>
                    Redirecting...
                  } @else {
                    <span class="material-symbols-outlined">shopping_cart</span>
                    Book Now
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      } @else {
        <div class="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-16 text-center">
          <h2 class="text-xl font-bold text-on-surface mb-2">Vehicle not found</h2>
          <p class="text-on-surface-variant text-sm mb-8">The vehicle may have been removed.</p>
          <a routerLink="/vehicles" class="btn-primary text-sm">Browse Fleet</a>
        </div>
      }
    </div>
  `,
})
export class VehicleDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly vehicleService = inject(VehicleService);
  private readonly bookingService = inject(BookingService);
  private readonly paymentService = inject(PaymentService);

  protected readonly Math = Math;

  readonly loading = signal(true);
  readonly vehicle = signal<Vehicle | null>(null);
  readonly selectedImage = signal(0);
  readonly startDate = signal('');
  readonly endDate = signal('');
  readonly qty = signal(1);
  readonly rentalType = signal('day');
  readonly submitting = signal(false);
  readonly error = signal('');

  get today(): string {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  }

  ngOnInit() {
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

  get specs() {
    const v = this.vehicle();
    if (!v) return [];
    return [
      { icon: 'groups', label: 'Seats', value: String(v.seats) },
      { icon: 'local_gas_station', label: 'Fuel', value: v.fuel },
      { icon: 'settings', label: 'Transmission', value: v.transmission },
      { icon: 'speed', label: 'Year', value: String(v.year) },
    ];
  }

  get estimate(): number {
    // Mirrors the backend pricing: pricing[rentalType] * quantity.
    const pricing = this.vehicle()?.pricing as Record<string, number> | undefined;
    const rate = pricing?.[this.rentalType()] || 0;
    return rate * this.qty();
  }

  /** Create the booking, then redirect to ABA PayWay's hosted checkout page. */
  book(): void {
    const v = this.vehicle();
    if (!v || this.submitting()) return;

    if (!this.startDate() || !this.endDate()) {
      this.error.set('Please select a start and end date.');
      return;
    }
    if (this.endDate() < this.startDate()) {
      this.error.set('End date must be on or after the start date.');
      return;
    }

    this.error.set('');
    this.submitting.set(true);

    this.bookingService
      .createBooking({
        vehicleId: v._id,
        startDate: this.startDate(),
        endDate: this.endDate(),
        rentalType: this.rentalType(),
        quantity: this.qty(),
      })
      .subscribe({
        next: (res) => {
          this.paymentService.createPaywayForm(res.booking._id).subscribe({
            next: (payload) => this.submitPaywayForm(payload),
            error: (err) => {
              this.submitting.set(false);
              this.error.set(err?.error?.message || 'Could not start the payment.');
            },
          });
        },
        error: (err) => {
          this.submitting.set(false);
          this.error.set(err?.error?.message || 'Could not create the booking.');
        },
      });
  }

  /** Build a hidden form from the signed fields and POST it to ABA's checkout. */
  private submitPaywayForm(payload: PaywayForm): void {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = payload.actionUrl;
    form.enctype = 'multipart/form-data';
    form.style.display = 'none';

    for (const [name, value] of Object.entries(payload.fields)) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value ?? '';
      form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();
  }
}
