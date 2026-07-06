import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { BookingService } from '../../../core/services/booking.service';
import { Booking, BookingStatus } from '../../../models/booking.model';

@Component({
  selector: 'app-manage-bookings',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="p-6 bg-background min-h-screen pb-16">
      <div class="mb-6">
        <p class="text-xs font-bold uppercase tracking-widest text-outline">Operations</p>
        <h1 class="text-2xl font-bold text-on-surface">Manage Bookings</h1>
      </div>

      <div class="overflow-x-auto rounded-2xl border border-outline-variant/30 bg-surface-container-low">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-outline-variant/30 bg-surface-container-high text-xs font-bold uppercase tracking-wider text-outline">
              <th class="p-4">Customer</th>
              <th class="p-4">Vehicle</th>
              <th class="p-4">Dates / Duration</th>
              <th class="p-4">Price</th>
              <th class="p-4">Status</th>
              <th class="p-4">Payment</th>
              <th class="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-outline-variant/20 text-sm">
            @if (loading()) {
              <tr>
                <td colspan="7" class="p-8 text-center text-on-surface-variant animate-pulse">Loading bookings...</td>
              </tr>
            } @else if (bookings().length === 0) {
              <tr>
                <td colspan="7" class="p-8 text-center text-on-surface-variant">No bookings recorded.</td>
              </tr>
            } @else {
              @for (booking of bookings(); track booking._id) {
                <tr class="hover:bg-surface-container-high/50 transition-colors">
                  <td class="p-4">
                    <p class="font-bold text-on-surface">{{ getCustomerName(booking.userId) }}</p>
                    <p class="text-xs text-on-surface-variant">{{ getCustomerEmail(booking.userId) }}</p>
                  </td>
                  <td class="p-4">
                    <p class="font-bold text-on-surface">{{ getVehicleName(booking.vehicleId) }}</p>
                  </td>
                  <td class="p-4">
                    <p class="font-semibold text-on-surface">{{ booking.startDate | date }} to {{ booking.endDate | date }}</p>
                    <p class="text-xs text-on-surface-variant">{{ booking.quantity }} {{ booking.rentalType }}(s)</p>
                  </td>
                  <td class="p-4 font-bold text-secondary">\${{ booking.totalPrice }}</td>
                  <td class="p-4">
                    <span [class]="getStatusClass(booking.status)"
                      class="rounded-lg px-2.5 py-1 text-xs font-bold uppercase tracking-wider">
                      {{ booking.status }}
                    </span>
                  </td>
                  <td class="p-4">
                    <span [class]="getPaymentStatusClass(booking.paymentStatus)"
                      class="rounded-lg px-2.5 py-1 text-xs font-bold uppercase tracking-wider">
                      {{ booking.paymentStatus }}
                    </span>
                  </td>
                  <td class="p-4 text-right">
                    <div class="flex justify-end gap-1.5">
                      @if (booking.status === 'pending') {
                        <button (click)="updateStatus(booking._id, 'confirmed')" class="rounded-lg bg-green-500/20 px-2.5 py-1 text-xs font-bold text-green-400 hover:bg-green-500/30">
                          Approve
                        </button>
                      }
                      @if (booking.status === 'confirmed') {
                        <button (click)="updateStatus(booking._id, 'completed')" class="rounded-lg bg-primary/20 px-2.5 py-1 text-xs font-bold text-primary hover:bg-primary/30">
                          Complete
                        </button>
                      }
                      @if (booking.status === 'pending' || booking.status === 'confirmed') {
                        <button (click)="updateStatus(booking._id, 'cancelled')" class="rounded-lg bg-red-500/20 px-2.5 py-1 text-xs font-bold text-red-400 hover:bg-red-500/30">
                          Cancel
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class ManageBookingsComponent implements OnInit {
  private readonly bookingService = inject(BookingService);

  readonly bookings = signal<Booking[]>([]);
  readonly loading = signal(true);

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    this.loading.set(true);
    this.bookingService.getBookings().subscribe({
      next: (res) => {
        this.bookings.set(res.bookings);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  updateStatus(id: string, status: BookingStatus) {
    this.bookingService.updateBookingStatus(id, status).subscribe(() => this.loadBookings());
  }

  getCustomerName(user: any): string {
    return user?.name || 'Walk-in Customer';
  }

  getCustomerEmail(user: any): string {
    return user?.email || 'N/A';
  }

  getVehicleName(vehicle: any): string {
    return vehicle?.name || 'Unknown Vehicle';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'confirmed': return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'completed': return 'bg-primary/20 text-primary border border-primary/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border border-red-500/30';
      default: return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
    }
  }

  getPaymentStatusClass(status: string): string {
    switch (status) {
      case 'paid': return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'refunded': return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
      default: return 'bg-red-500/20 text-red-400 border border-red-500/30';
    }
  }
}
