import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VehicleService } from '../../../core/services/vehicle.service';
import { BookingService } from '../../../core/services/booking.service';
import { PaymentService, PaywayQr } from '../../../core/services/payment.service';
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
                    Loading QR...
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

    <!-- ABA PayWay KHQR modal -->
    @if (qr(); as q) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4"
           style="background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);">
        <div class="w-full max-w-sm rounded-2xl bg-surface-container-low border border-outline-variant/20 p-6 text-center">
          <div class="flex items-center justify-center gap-2 mb-1">
            <span class="material-symbols-outlined text-primary">qr_code_2</span>
            <h3 class="text-lg font-bold text-on-surface">Scan to Pay</h3>
          </div>
          <p class="text-sm text-on-surface-variant mb-1">ABA PayWay &middot; KHQR</p>
          <p class="text-2xl font-black text-secondary mb-4">\${{ q.amount }}</p>

          <div class="rounded-2xl bg-white p-3 inline-block mb-4">
            @if (q.qrImage) {
              <img [src]="q.qrImage" alt="ABA KHQR" class="w-56 h-56 object-contain" />
            }
          </div>

          <p class="text-xs text-on-surface-variant mb-5">
            Scan with any ABA / KHQR-supported bank app, then tap "I've Paid".
          </p>

          @if (qrError()) {
            <div class="mb-4 flex items-center gap-2 rounded-xl p-3 text-sm"
                 style="background: rgba(239,68,68,0.08); color: #f87171;">
              <span class="material-symbols-outlined text-lg">error</span>
              {{ qrError() }}
            </div>
          }

          <div class="flex gap-3">
            <button (click)="cancelPayment()" [disabled]="paying()"
              class="flex-1 rounded-xl border border-outline-variant/40 py-3 text-sm font-bold text-on-surface-variant hover:bg-surface-container-high transition-all disabled:opacity-50">
              Cancel
            </button>
            <button (click)="markPaid()" [disabled]="paying()"
              class="btn-primary flex-1 py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
              @if (paying()) {
                <span class="material-symbols-outlined animate-spin text-lg">progress_activity</span>
              } @else {
                <span class="material-symbols-outlined text-lg">check_circle</span>
                I've Paid
              }
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class VehicleDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
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

  // ABA PayWay QR modal state
  readonly qr = signal<PaywayQr | null>(null);
  readonly paying = signal(false);
  readonly qrError = signal('');

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

  /** Create the booking, then generate an ABA KHQR and open the pay modal. */
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
    this.qrError.set('');
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
          this.paymentService.createPaywayQr(res.booking._id).subscribe({
            next: (qr) => {
              this.submitting.set(false);
              this.qr.set(qr);
            },
            error: (err) => {
              this.submitting.set(false);
              this.error.set(err?.error?.message || 'Could not generate the payment QR.');
            },
          });
        },
        error: (err) => {
          this.submitting.set(false);
          this.error.set(err?.error?.message || 'Could not create the booking.');
        },
      });
  }

  /** "I've Paid" — mark the transaction paid, then go to the bookings page. */
  markPaid(): void {
    const q = this.qr();
    if (!q || this.paying()) return;
    this.paying.set(true);
    this.qrError.set('');

    this.paymentService.markPaywayPaid(q.tranId).subscribe({
      next: () => {
        this.paying.set(false);
        this.qr.set(null);
        this.router.navigate(['/customer/bookings'], { queryParams: { paid: 1 } });
      },
      error: (err) => {
        this.paying.set(false);
        this.qrError.set(err?.error?.message || 'Could not confirm the payment.');
      },
    });
  }

  /** "Cancel" — cancel the pending booking and close the modal. */
  cancelPayment(): void {
    const q = this.qr();
    if (!q || this.paying()) return;
    this.paying.set(true);

    this.bookingService.cancelBooking(q.bookingId).subscribe({
      next: () => {
        this.paying.set(false);
        this.qr.set(null);
      },
      error: () => {
        // Even if the cancel call fails, close the modal so the user isn't stuck.
        this.paying.set(false);
        this.qr.set(null);
      },
    });
  }
}
