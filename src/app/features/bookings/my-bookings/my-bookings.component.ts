import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BookingService } from '../../../core/services/booking.service';
import { Booking } from '../../../models/booking.model';
import { Vehicle } from '../../../models/vehicle.model';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [DatePipe, RouterLink],
  template: `
    <div class="p-6">
      <div class="mb-6 flex items-center justify-between">
        <div>
          <p class="text-xs font-bold uppercase tracking-widest text-outline">Customer</p>
          <h1 class="text-2xl font-bold text-on-surface">My Bookings</h1>
        </div>
      </div>

      <div class="flex flex-col gap-4">
        @if (loading()) {
          <div class="animate-pulse rounded-2xl border border-outline-variant/30 bg-surface-container-low p-6 h-32"></div>
        } @else if (bookings().length === 0) {
          <div class="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-12 text-center">
            <h2 class="text-lg font-bold text-on-surface">No bookings yet</h2>
            <p class="text-on-surface-variant">Your travel history will appear here.</p>
          </div>
        } @else {
          @for (booking of bookings(); track booking._id) {
            <div class="flex flex-col gap-4 rounded-2xl border border-outline-variant/30 bg-surface-container-low p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 class="font-bold text-on-surface">{{ getVehicleName(booking.vehicleId) }}</h3>
                <p class="text-sm text-on-surface-variant">{{ booking.startDate | date }} - {{ booking.endDate | date }}</p>
                <p class="text-sm font-semibold text-secondary">\${{ booking.totalPrice }}</p>
              </div>
              <div class="flex items-center gap-3">
                <span class="rounded-lg bg-surface-container-high px-3 py-1 text-xs font-bold uppercase tracking-wider text-on-surface">{{ booking.status }}</span>
                <span class="rounded-lg bg-surface-container-high px-3 py-1 text-xs font-bold uppercase tracking-wider text-on-surface">{{ booking.paymentStatus }}</span>
                
                @if (booking.status === 'pending') {
                  <button (click)="cancel(booking._id)" class="rounded-lg border border-red-500/30 px-3 py-1 text-xs font-bold text-red-400 hover:bg-red-500/10">
                    Cancel
                  </button>
                  @if (booking.paymentStatus === 'unpaid') {
                    <a [routerLink]="['/customer/checkout', booking._id]" class="rounded-lg bg-primary px-3 py-1 text-xs font-bold text-on-primary hover:brightness-110">
                      Pay Now
                    </a>
                  }
                }
              </div>
            </div>
          }
        }
      </div>
    </div>
  `,
})
export class MyBookingsComponent implements OnInit {
  private readonly bookingService = inject(BookingService);

  readonly loading = signal(true);
  readonly bookings = signal<Booking[]>([]);

  ngOnInit() {
    this.loadBookings();
  }

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
    if (confirm('Are you sure you want to cancel this booking?')) {
      this.bookingService.cancelBooking(id).subscribe(() => this.loadBookings());
    }
  }

  getVehicleName(vehicleId: string | Vehicle | any): string {
    if (typeof vehicleId === 'string') return vehicleId;
    return vehicleId?.name || 'Unknown Vehicle';
  }
}
