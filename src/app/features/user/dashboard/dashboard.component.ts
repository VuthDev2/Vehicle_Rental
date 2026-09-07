import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BookingService } from '../../../core/services/booking.service';
import { AuthService } from '../../../core/services/auth.service';
import { VehicleService } from '../../../core/services/vehicle.service';
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

/** Fleet category info cards shown on the Home page. */
export interface FleetCategory {
  icon: string;
  label: string;
  description: string;
  color: string;
  bg: string;
  count: number | null;
  query: string;
  img?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private readonly bookingService = inject(BookingService);
  private readonly vehicleService = inject(VehicleService);
  readonly auth = inject(AuthService);

  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly bookings = signal<Booking[]>([]);

  /** Counts of vehicles per category loaded from the API. */
  readonly vehicleCounts = signal<Record<string, number>>({});
  readonly totalVehicles = signal(0);
  readonly availableVehicles = signal(0);

  readonly fleetCategories: FleetCategory[] = [
    {
      icon: 'pedal_bike',
      label: 'Bicycles',
      description: '',
      color: '#064e3b',
      bg: 'rgba(6, 78, 59, 0.05)',
      count: null,
      query: 'Bicycle',
      img: '/bicycle.jpg'
    },
    {
      icon: 'two_wheeler',
      label: 'Motos',
      description: '',
      color: '#064e3b',
      bg: 'rgba(6, 78, 59, 0.05)',
      count: null,
      query: 'Scooter',
      img: '/click.jpg'
    },
    {
      icon: 'directions_car',
      label: 'Cars',
      description: '',
      color: '#064e3b',
      bg: 'rgba(6, 78, 59, 0.05)',
      count: null,
      query: 'Sedan',
      img: '/camry.jpg'
    },
  ];


  readonly featuredVehicles = signal<Vehicle[]>([]);

  ngOnInit() {
    this.loadBookings();
    this.loadVehicleStats();
  }

  loadBookings(): void {
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

  loadVehicleStats(): void {
    this.vehicleService.getVehicleStats().subscribe({
      next: (res) => {
        this.totalVehicles.set(res.totalVehicles);
        this.availableVehicles.set(res.availableVehicles);
        this.vehicleCounts.set(res.typeCounts);
      },
      error: () => { /* keep defaults */ },
    });

    // Also load featured vehicles
    this.vehicleService.getVehicles({}, 1, 12).subscribe({
      next: (res) => {
        this.featuredVehicles.set(res.vehicles || []);
      },
      error: () => {},
    });
  }

  getCategoryCount(query: string): number {
    const counts = this.vehicleCounts();
    const keywords: Record<string, string[]> = {
      bicycle: ['bike', 'e-bike', 'bicycle'],
      scooter: ['motorcycle', 'scooter', 'moto', 'tuk-tuk'],
      sedan: ['car', 'suv', 'van', 'truck', 'sedan'],
    };
    const terms = keywords[query.toLowerCase()] || [query.toLowerCase()];
    let total = 0;
    for (const [type, cnt] of Object.entries(counts)) {
      if (terms.some((term) => type.toLowerCase().includes(term))) {
        total += cnt;
      }
    }
    if (total > 0) return total;
    return 0;
  }

  categoryCountLabel(query: string): string {
    const count = this.getCategoryCount(query);
    return `${count} Vehicles`;
  }

  readonly greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  });

  get todayLabel(): string {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric',
    });
  }

  get firstName(): string {
    const raw = this.auth.user()?.name?.split(' ')[0] || 'there';
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }

  get stats() {
    const all = this.bookings();
    const active = all.filter((b) => b.status === 'pending' || b.status === 'confirmed').length;
    return [
      { label: 'Vehicles', value: String(this.totalVehicles()), icon: 'directions_car', bg: 'rgba(123, 160, 91, 0.1)', color: 'var(--color-primary)' },
      { label: 'Available', value: String(this.availableVehicles()), icon: 'check_circle', bg: 'rgba(123, 160, 91, 0.1)', color: 'var(--color-primary)' },
      { label: 'Currently Booked', value: String(active), icon: 'event_busy', bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' },
      { label: 'Your Bookings', value: String(all.length), icon: 'receipt_long', bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' },
    ];
  }

  /** Nearest upcoming (or in-progress) booking. */
  get nextTrip(): Booking | null {
    const now = Date.now();
    const upcoming = this.bookings()
      .filter((b) => b.status === 'pending' || b.status === 'confirmed')
      .filter((b) => new Date(b.endDate).getTime() >= now - 86_400_000)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    return upcoming[0] ?? null;
  }

  get daysUntilNext(): number {
    const trip = this.nextTrip;
    if (!trip) return 0;
    const ms = new Date(trip.startDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(ms / 86_400_000));
  }

  get startLabel(): string {
    const d = this.daysUntilNext;
    if (d === 0) return 'Starts today';
    if (d === 1) return 'Starts tomorrow';
    return `Starts in ${d} days`;
  }

  getVehicleName(v: string | any): string {
    if (typeof v === 'string') return v;
    return v?.name || 'Premium Vehicle';
  }

  getVehicleImage(v: string | any): string {
    if (typeof v === 'object' && v?.images?.[0]) return v.images[0];
    const type = this.getVehicleType(v)?.toLowerCase() || '';
    if (type.includes('scooter') || type.includes('moto')) return '/scoopy.jpg';
    if (type.includes('motorcycle')) return '/click.jpg';
    return '/camry.jpg';
  }

  getVehicleLocation(v: string | any): string {
    if (typeof v === 'object' && v?.location) return v.location;
    return 'Phnom Penh';
  }

  getVehicleType(v: string | any): string {
    if (typeof v === 'object' && v?.type) return v.type;
    return 'Vehicle';
  }

  getStatusClass(status: string): string { return STATUS_CONFIG[status]?.class || 'badge-neutral'; }
  getStatusDot(status: string): string { return STATUS_CONFIG[status]?.dot || 'neutral'; }
  getStatusLabel(status: string): string { return STATUS_CONFIG[status]?.label || status; }
  getPaymentClass(s: string): string { return PAYMENT_CONFIG[s]?.class || 'badge-neutral'; }
  getPaymentDot(s: string): string { return PAYMENT_CONFIG[s]?.dot || 'neutral'; }
}
