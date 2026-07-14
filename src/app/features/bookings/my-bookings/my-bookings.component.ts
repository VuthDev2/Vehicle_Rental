import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BookingService } from '../../../core/services/booking.service';
import { Booking } from '../../../models/booking.model';
import { Vehicle } from '../../../models/vehicle.model';

const STATUS_CONFIG: Record<string, { class: string; dot: string }> = {
  pending: { class: 'badge-warning', dot: 'warning' },
  confirmed: { class: 'badge-info', dot: 'info' },
  completed: { class: 'badge-success', dot: 'success' },
  cancelled: { class: 'badge-danger', dot: 'danger' },
};

const PAYMENT_CONFIG: Record<string, { class: string; dot: string }> = {
  unpaid: { class: 'badge-warning', dot: 'warning' },
  paid: { class: 'badge-success', dot: 'success' },
  refunded: { class: 'badge-info', dot: 'info' },
};

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [DatePipe, RouterLink],
  template: `
    <div class="page-container">
      <div class="page-header flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p class="eyebrow">Customer</p>
          <h1>My Bookings</h1>
          <p>Manage your vehicle reservations</p>
        </div>
        <a routerLink="/vehicles"
           class="btn-primary text-sm px-5 py-2.5 whitespace-nowrap">
          <span class="material-symbols-outlined">add</span>
          New Booking
        </a>
      </div>

      @if (loading()) {
        <div class="flex flex-col gap-4">
          @for (i of [1,2,3]; track i) {
            <div class="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-5">
              <div class="flex gap-4">
                <div class="w-16 h-16 rounded-xl skeleton flex-shrink-0"></div>
                <div class="flex-1 space-y-3">
                  <div class="h-5 w-1/3 skeleton"></div>
                  <div class="h-4 w-1/2 skeleton"></div>
                </div>
              </div>
            </div>
          }
        </div>
      } @else if (bookings().length === 0) {
        <div class="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-16 text-center">
          <div class="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5"
               style="background: rgba(255,255,255,0.04);">
            <span class="material-symbols-outlined text-4xl text-outline">receipt_long</span>
          </div>
          <h2 class="text-xl font-bold text-on-surface mb-2">No bookings yet</h2>
          <p class="text-on-surface-variant text-sm mb-8 max-w-xs mx-auto">Start by browsing our fleet and booking your first vehicle.</p>
          <a routerLink="/vehicles" class="btn-primary text-sm">
            <span class="material-symbols-outlined">search</span>
            Browse Vehicles
          </a>
        </div>
      } @else {
        <div class="flex flex-col gap-4">
          @for (booking of bookings(); track booking._id) {
            <div class="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-5 transition-all duration-200 hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5">
              <div class="flex flex-col sm:flex-row sm:items-center gap-4">
                <div class="w-full sm:w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-surface-container-high">
                  @if (getVehicleImage(booking.vehicleId)) {
                    <img [src]="getVehicleImage(booking.vehicleId)" class="w-full h-full object-cover" />
                  } @else {
                    <div class="w-full h-full flex items-center justify-center">
                      <span class="material-symbols-outlined text-2xl text-outline">directions_car</span>
                    </div>
                  }
                </div>

                <div class="flex-1 min-w-0">
                  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h3 class="font-bold text-on-surface text-base truncate">{{ getVehicleName(booking.vehicleId) }}</h3>
                      <p class="text-sm text-on-surface-variant flex items-center gap-1.5 mt-0.5">
                        <span class="material-symbols-outlined text-base">calendar_month</span>
                        {{ booking.startDate | date:'mediumDate' }} — {{ booking.endDate | date:'mediumDate' }}
                      </p>
                    </div>
                    <div class="flex items-baseline gap-1">
                      <span class="text-xl font-black text-secondary">\${{ booking.totalPrice }}</span>
                    </div>
                  </div>

                  <div class="flex flex-wrap items-center gap-2 mt-3">
                    <span [class]="'badge ' + getStatusClass(booking.status)">
                      <span [class]="'status-dot ' + getStatusDot(booking.status)"></span>
                      {{ booking.status }}
                    </span>
                    <span [class]="'badge ' + getPaymentClass(booking.paymentStatus)">
                      <span [class]="'status-dot ' + getPaymentDot(booking.paymentStatus)"></span>
                      {{ booking.paymentStatus }}
                    </span>
                    <span class="text-xs text-on-surface-variant">
                      {{ booking.quantity }} {{ booking.rentalType }}(s)
                    </span>
                  </div>
                </div>

                @if (booking.status === 'pending') {
                  <div class="flex sm:flex-col gap-2">
                    @if (booking.paymentStatus === 'unpaid') {
                      <a [routerLink]="['/customer/checkout', booking._id]"
                         class="btn-primary text-xs px-4 py-2.5 whitespace-nowrap">
                        <span class="material-symbols-outlined text-sm">payments</span>
                        Pay Now
                      </a>
                    }
                    <button (click)="cancel(booking._id)"
                            class="flex items-center justify-center gap-1.5 rounded-xl border border-red-500/30 px-4 py-2.5 text-xs font-bold text-red-400 hover:bg-red-500/10 transition-all whitespace-nowrap">
                      <span class="material-symbols-outlined text-sm">close</span>
                      Cancel
                    </button>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class MyBookingsComponent implements OnInit {
  private readonly bookingService = inject(BookingService);

  readonly loading = signal(true);
  readonly bookings = signal<Booking[]>([]);

  ngOnInit() { this.loadBookings(); }

  loadBookings() {
    this.bookingService.getBookings().subscribe({
      next: (res) => {
        this.bookings.set(res.bookings);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  cancel(id: string) {
    if (confirm('Cancel this booking? This action cannot be undone.')) {
      this.bookingService.cancelBooking(id).subscribe(() => this.loadBookings());
    }
  }

  getVehicleName(v: string | Vehicle | any): string {
    if (typeof v === 'string') return v;
    return v?.name || 'Unknown Vehicle';
  }

  getVehicleImage(v: string | Vehicle | any): string {
    if (typeof v === 'object' && v?.images?.[0]) return v.images[0];
    return '';
  }

  getStatusClass(status: string): string {
    return STATUS_CONFIG[status]?.class || 'badge-neutral';
  }

  getStatusDot(status: string): string {
    return STATUS_CONFIG[status]?.dot || 'neutral';
  }

  getPaymentClass(status: string): string {
    return PAYMENT_CONFIG[status]?.class || 'badge-neutral';
  }

  getPaymentDot(status: string): string {
    return PAYMENT_CONFIG[status]?.dot || 'neutral';
  }
}
