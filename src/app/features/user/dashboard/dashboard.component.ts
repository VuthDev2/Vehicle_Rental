import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BookingService } from '../../../core/services/booking.service';
import { AuthService } from '../../../core/services/auth.service';
import { VehicleService } from '../../../core/services/vehicle.service';
import { Booking } from '../../../models/booking.model';
import { Vehicle } from '../../../models/vehicle.model';

const STATUS_CONFIG: Record<string, { class: string; dot: string; label: string }> = {
  pending:   { class: 'badge-warning', dot: 'warning',  label: 'Pending'   },
  confirmed: { class: 'badge-info',    dot: 'info',     label: 'Confirmed' },
  completed: { class: 'badge-success', dot: 'success',  label: 'Completed' },
  cancelled: { class: 'badge-danger',  dot: 'danger',   label: 'Cancelled' },
};

const PAYMENT_CONFIG: Record<string, { class: string; dot: string; label: string }> = {
  unpaid:   { class: 'badge-warning', dot: 'warning', label: 'Unpaid'   },
  paid:     { class: 'badge-success', dot: 'success', label: 'Paid'     },
  refunded: { class: 'badge-info',    dot: 'info',    label: 'Refunded' },
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
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private readonly bookingService = inject(BookingService);
  private readonly vehicleService = inject(VehicleService);
  readonly auth = inject(AuthService);

  readonly loading     = signal(true);
  readonly loadError   = signal(false);
  readonly bookings    = signal<Booking[]>([]);

  /** Counts of vehicles per category loaded from the API. */
  readonly vehicleCounts = signal<Record<string, number>>({});
  readonly totalVehicles = signal(0);
  readonly availableVehicles = signal(0);

  /** Static fleet category definitions — counts filled in from API. */
  readonly fleetCategories: FleetCategory[] = [
    {
      icon: 'directions_car',
      label: 'Sedans & Saloons',
      description: 'Comfortable city and long-range sedans perfect for business trips, airport transfers, and family outings.',
      color: '#0284c7',
      bg: 'rgba(2, 132, 199, 0.08)',
      count: null,
      query: 'Sedan',
    },
    {
      icon: 'directions_car',
      label: 'SUVs & Crossovers',
      description: 'Spacious, powerful SUVs ideal for group travel, rugged terrain, and ultimate road-trip comfort.',
      color: '#16a34a',
      bg: 'rgba(22, 163, 74, 0.08)',
      count: null,
      query: 'SUV',
    },
    {
      icon: 'two_wheeler',
      label: 'Motorcycles',
      description: 'Nimble sport and cruiser motorcycles for urban commuting, scenic rides, and adrenaline adventures.',
      color: '#d97706',
      bg: 'rgba(217, 119, 6, 0.08)',
      count: null,
      query: 'Motorcycle',
    },
    {
      icon: 'electric_bike',
      label: 'Electric Vehicles',
      description: 'Zero-emission EVs and hybrids — enjoy a green, quiet, and cost-efficient ride across the city.',
      color: '#7c3aed',
      bg: 'rgba(124, 58, 237, 0.08)',
      count: null,
      query: 'Electric',
    },
  ];

  readonly howItWorks = [
    {
      step: '01',
      icon: 'search',
      title: 'Browse the Fleet',
      desc: 'Filter by vehicle type, location, price range, or availability. Find your perfect match in seconds.',
      color: '#0284c7',
      bg: 'rgba(2, 132, 199, 0.08)',
    },
    {
      step: '02',
      icon: 'calendar_today',
      title: 'Book Online',
      desc: 'Choose your rental dates, select daily or hourly billing, and confirm with a single click. No paperwork.',
      color: '#16a34a',
      bg: 'rgba(22, 163, 74, 0.08)',
    },
    {
      step: '03',
      icon: 'directions_car',
      title: 'Ride & Return',
      desc: 'Pick up from any Cambo Rent hub across Phnom Penh, Siem Reap, and Sihanoukville. We handle the rest.',
      color: '#d97706',
      bg: 'rgba(217, 119, 6, 0.08)',
    },
  ];

  readonly trustHighlights = [
    {
      icon: 'verified_user',
      title: 'Verified & Insured Fleet',
      desc: 'Every vehicle is safety-checked, fully insured, and serviced before each rental.',
      color: '#16a34a',
      bg: 'rgba(22, 163, 74, 0.08)',
    },
    {
      icon: 'schedule',
      title: 'Flexible Rental Terms',
      desc: 'Rent by the hour, day, week, or month. No hidden fees — the price you see is what you pay.',
      color: '#0284c7',
      bg: 'rgba(2, 132, 199, 0.08)',
    },
    {
      icon: 'support_agent',
      title: '24/7 Concierge Support',
      desc: 'Our team is available round the clock for roadside assistance, location changes, and any queries.',
      color: '#d97706',
      bg: 'rgba(217, 119, 6, 0.08)',
    },
  ];

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
    this.vehicleService.getVehicles({}, 1, 200).subscribe({
      next: (res) => {
        const all: Vehicle[] = res.vehicles || [];
        this.totalVehicles.set(all.length);
        this.availableVehicles.set(all.filter((v) => v.available).length);
        const counts: Record<string, number> = {};
        for (const v of all) {
          const t = v.type || 'Other';
          counts[t] = (counts[t] || 0) + 1;
        }
        this.vehicleCounts.set(counts);
      },
      error: () => { /* keep defaults */ },
    });
  }

  getCategoryCount(query: string): number | null {
    const counts = this.vehicleCounts();
    if (Object.keys(counts).length === 0) return null;
    // Sum types that loosely match the category label
    let total = 0;
    for (const [type, cnt] of Object.entries(counts)) {
      if (type.toLowerCase().includes(query.toLowerCase())) {
        total += cnt;
      }
    }
    return total;
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
    return this.auth.user()?.name?.split(' ')[0] || 'there';
  }

  get stats() {
    const all     = this.bookings();
    const active  = all.filter((b) => b.status === 'pending' || b.status === 'confirmed').length;
    const unpaid  = all.filter((b) => b.paymentStatus === 'unpaid').length;
    const spent   = all
      .filter((b) => b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0);
    return [
      { label: 'Total Bookings',    value: String(all.length),   icon: 'receipt_long',   bg: 'rgba(59, 130, 246, 0.1)',  color: '#3b82f6' },
      { label: 'Active Rentals',    value: String(active),        icon: 'directions_car', bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' },
      { label: 'Awaiting Payment',  value: String(unpaid),        icon: 'payments',       bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' },
      { label: 'Total Spent',       value: `$${spent.toFixed(0)}`, icon: 'savings',       bg: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' },
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
    return '/car_card.png';
  }

  getVehicleLocation(v: string | any): string {
    if (typeof v === 'object' && v?.location) return v.location;
    return 'Phnom Penh';
  }

  getVehicleType(v: string | any): string {
    if (typeof v === 'object' && v?.type) return v.type;
    return 'Vehicle';
  }

  getStatusClass(status: string): string { return STATUS_CONFIG[status]?.class  || 'badge-neutral'; }
  getStatusDot  (status: string): string { return STATUS_CONFIG[status]?.dot    || 'neutral'; }
  getStatusLabel(status: string): string { return STATUS_CONFIG[status]?.label  || status; }
  getPaymentClass(s: string):     string { return PAYMENT_CONFIG[s]?.class      || 'badge-neutral'; }
  getPaymentDot  (s: string):     string { return PAYMENT_CONFIG[s]?.dot        || 'neutral'; }
}
