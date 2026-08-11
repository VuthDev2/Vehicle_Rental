import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BookingService } from '../../../core/services/booking.service';
import { AuthService } from '../../../core/services/auth.service';
import { Booking } from '../../../models/booking.model';
import { Vehicle } from '../../../models/vehicle.model';

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

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private readonly bookingService = inject(BookingService);
  readonly auth = inject(AuthService);

  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly bookings = signal<Booking[]>([]);

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading.set(true);
    this.loadError.set(false);
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

  readonly greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  });

  get todayLabel(): string {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }

  get firstName(): string {
    return this.auth.user()?.name?.split(' ')[0] || 'there';
  }

  get stats() {
    const all = this.bookings();
    const active = all.filter((b) => b.status === 'pending' || b.status === 'confirmed').length;
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

  /** Nearest upcoming (or in-progress) trip. */
  get nextTrip(): Booking | null {
    const now = Date.now();
    const upcoming = this.bookings()
      .filter((b) => b.status === 'pending' || b.status === 'confirmed')
      .filter((b) => new Date(b.endDate).getTime() >= now - 86400000)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    return upcoming[0] ?? null;
  }

  get daysUntilNext(): number {
    const trip = this.nextTrip;
    if (!trip) return 0;
    const ms = new Date(trip.startDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(ms / 86400000));
  }

  get startLabel(): string {
    const days = this.daysUntilNext;
    if (days === 0) return 'Starts today';
    if (days === 1) return 'Starts tomorrow';
    return `Starts in ${days} days`;
  }

  get recentBookings(): Booking[] {
    return [...this.bookings()]
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      )
      .slice(0, 3);
  }

  getVehicleName(v: string | Vehicle | any): string {
    if (typeof v === 'string') return v;
    return v?.name || 'Unknown Vehicle';
  }

  getVehicleImage(v: string | Vehicle | any): string {
    if (typeof v === 'object' && v?.images?.[0]) return v.images[0];
    return '';
  }

  getVehicleLocation(v: string | Vehicle | any): string {
    if (typeof v === 'object' && v?.location) return v.location;
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
