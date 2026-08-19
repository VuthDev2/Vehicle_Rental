import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BookingService } from '../../../../core/services/booking.service';
import { Booking } from '../../../../models/booking.model';
import { Vehicle } from '../../../../models/vehicle.model';

const STATUS_CONFIG: Record<string, { class: string; dot: string; label: string }> = {
  pending: { class: 'badge-warning', dot: 'warning', label: 'Pending' },
  confirmed: { class: 'badge-info', dot: 'info', label: 'Confirmed' },
  completed: { class: 'badge-success', dot: 'success', label: 'Completed' },
  cancelled: { class: 'badge-danger', dot: 'danger', label: 'Cancelled' },
};

const PAYMENT_CONFIG: Record<string, { class: string; dot: string; label: string }> = {
  unpaid: { class: 'badge-warning', dot: 'warning', label: 'Unpaid' },
  paid: { class: 'badge-success', dot: 'success', label: 'Paid' },
  refunded: { class: 'badge-info', dot: 'info', label: 'Refunded' },
};

export type BookingFilter = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './my-bookings.component.html',
  styleUrl: './my-bookings.component.css',
})
export class MyBookingsComponent implements OnInit {
  private readonly bookingService = inject(BookingService);

  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly bookings = signal<Booking[]>([]);
  readonly filter = signal<BookingFilter>('all');

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
      error: () => {
        this.loading.set(false);
        this.loadError.set(true);
      },
    });
  }

  setFilter(f: BookingFilter): void {
    this.filter.set(f);
  }

  readonly tabs = computed(() => {
    const all = this.bookings();
    const count = (s: BookingFilter) =>
      s === 'all' ? all.length : all.filter((b) => b.status === s).length;
    return [
      { key: 'all' as BookingFilter, label: 'All', count: count('all') },
      { key: 'pending' as BookingFilter, label: 'Pending', count: count('pending') },
      { key: 'confirmed' as BookingFilter, label: 'Confirmed', count: count('confirmed') },
      { key: 'completed' as BookingFilter, label: 'Completed', count: count('completed') },
      { key: 'cancelled' as BookingFilter, label: 'Cancelled', count: count('cancelled') },
    ];
  });

  readonly filteredBookings = computed(() => {
    const f = this.filter();
    const all = this.bookings();
    return f === 'all' ? all : all.filter((b) => b.status === f);
  });

  cancel(id: string) {
    if (confirm('Cancel this booking? This action cannot be undone.')) {
      this.bookingService.cancelBooking(id).subscribe(() => this.loadBookings());
    }
  }

  /** Whether the booking card should show action buttons (pay / cancel). */
  showActions(booking: Booking): boolean {
    return (
      booking.status === 'pending' ||
      (booking.paymentStatus === 'unpaid' && booking.status !== 'cancelled')
    );
  }

  get stats() {
    const all = this.bookings();
    const active = all.filter(
      (b) => b.status === 'pending' || b.status === 'confirmed'
    ).length;
    const unpaid = all.filter((b) => b.paymentStatus === 'unpaid').length;
    const spent = all
      .filter((b) => b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0);
    return [
      {
        label: 'Total Bookings',
        value: String(all.length),
        icon: 'receipt_long',
        bg: 'rgba(59, 130, 246, 0.14)',
        color: '#60a5fa',
      },
      {
        label: 'Active',
        value: String(active),
        icon: 'directions_car',
        bg: 'rgba(16, 185, 129, 0.14)',
        color: '#34d399',
      },
      {
        label: 'Awaiting Payment',
        value: String(unpaid),
        icon: 'payments',
        bg: 'rgba(245, 158, 11, 0.14)',
        color: '#fbbf24',
      },
      {
        label: 'Total Spent',
        value: `$${spent.toFixed(2)}`,
        icon: 'savings',
        bg: 'rgba(139, 92, 246, 0.14)',
        color: '#a78bfa',
      },
    ];
  }

  readonly gettingStarted = [
    {
      icon: 'directions_car',
      title: 'Explore the fleet',
      desc: 'Browse vehicles by type, price and availability.',
    },
    {
      icon: 'calendar_month',
      title: 'Book your ride',
      desc: 'Pick your dates and reserve in minutes.',
    },
    {
      icon: 'receipt_long',
      title: 'Track & pay',
      desc: 'Manage reservations and pay securely anytime.',
    },
  ];

  getVehicleName(v: string | Vehicle | any): string {
    if (typeof v === 'string') return v;
    return v?.name || 'Unknown Vehicle';
  }

  getVehicleMeta(v: string | Vehicle | any): string {
    if (typeof v === 'object') {
      const bits = [v?.brand, v?.year].filter(Boolean);
      return bits.join(' · ');
    }
    return '';
  }

  getVehicleLocation(v: string | Vehicle | any): string {
    if (typeof v === 'object' && v?.location) return v.location;
    return '';
  }

  getVehicleImage(v: string | Vehicle | any): string {
    if (typeof v === 'object' && v?.images?.[0]) return v.images[0];
    return '';
  }

  rentalLabel(booking: Booking): string {
    const type = booking.rentalType || 'day';
    const plural = booking.quantity === 1 ? '' : 's';
    return `${booking.quantity} ${type}${plural}`;
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
