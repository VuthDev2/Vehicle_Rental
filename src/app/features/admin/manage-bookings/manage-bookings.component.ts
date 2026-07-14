import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { BookingService } from '../../../core/services/booking.service';
import { Booking, BookingStatus } from '../../../models/booking.model';

const STATUS_PILLS = [
  { key: null, label: 'All' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'pending', label: 'Pending' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'completed', label: 'Completed' },
] as const;

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  confirmed: { bg: '#E7F5ED', color: '#1E7B4C' },
  pending: { bg: '#FFF8E1', color: '#8A6D00' },
  cancelled: { bg: '#FFDAD6', color: '#B3261E' },
  completed: { bg: '#D4E3FF', color: '#005DAC' },
};

const PAYMENT_STYLE: Record<string, { bg: string; color: string }> = {
  paid: { bg: '#E7F5ED', color: '#1E7B4C' },
  unpaid: { bg: '#FFF8E1', color: '#8A6D00' },
  refunded: { bg: '#E3E2E2', color: '#49454F' },
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function daysBetween(a: string, b: string): number {
  const d1 = new Date(a);
  const d2 = new Date(b);
  return Math.max(1, Math.round((d2.getTime() - d1.getTime()) / 86400000));
}

@Component({
  selector: 'app-manage-bookings',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div style="background: #FBF9F9; min-height: 100%; padding: 24px;">

      <!-- ==================== HEADER ==================== -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <h1 style="font-size: 28px; font-weight: 700; color: #005DAC; margin: 0;">Bookings</h1>
          <span style="background: #CFE6F2; color: #005DAC; padding: 2px 14px; border-radius: 20px; font-size: 14px; font-weight: 600; line-height: 28px;">
            {{ total() }} total
          </span>
        </div>
        <div class="flex items-center gap-3">
          <div style="position: relative;">
            <span class="material-symbols-outlined" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 20px; color: #76777D; pointer-events: none;">search</span>
            <input
              type="text"
              placeholder="Search bookings..."
              [value]="searchQuery()"
              (input)="searchQuery.set($any($event.target).value); loadBookings()"
              style="width: 280px; border: 1px solid #C1C6D4; border-radius: 8px; padding: 10px 14px 10px 40px; font-size: 14px; color: #1B1C1C; outline: none; background: #FFFFFF; box-sizing: border-box;"
            />
          </div>
          <button style="width: 44px; height: 44px; border: 1px solid #C1C6D4; border-radius: 8px; background: #FFFFFF; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #414752;">
            <span class="material-symbols-outlined" style="font-size: 22px;">filter_list</span>
          </button>
        </div>
      </div>

      <!-- ==================== STAT CARDS ==================== -->
      <div class="grid grid-cols-4 gap-4 mb-6">
        @for (stat of statCards(); track stat.label) {
          <div style="background: #FFFFFF; border: 1px solid #C1C6D4; border-radius: 12px; padding: 16px 20px; display: flex; align-items: center; gap: 16px;">
            <div style="width: 48px; height: 48px; border-radius: 12px; background: {{ stat.bg }}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <span class="material-symbols-outlined" style="font-size: 24px; color: {{ stat.color }};">{{ stat.icon }}</span>
            </div>
            <div>
              <p style="font-size: 13px; color: #717783; margin: 0; font-weight: 500;">{{ stat.label }}</p>
              <p style="font-size: 28px; font-weight: 700; color: #1B1C1C; margin: 0; line-height: 1.2;">{{ stat.value() }}</p>
            </div>
          </div>
        }
      </div>

      <!-- ==================== TABLE CONTROLS ==================== -->
      <div class="flex items-center justify-between mb-4">
        <select (change)="activeFilter.set($any($event.target).value || null); currentPage.set(1); loadBookings()"
                style="border: 1px solid #C1C6D4; border-radius: 6px; padding: 8px 16px; font-size: 14px; color: #1B1C1C; background: #FFFFFF; cursor: pointer; outline: none;">
          @for (pill of statusPills; track pill.key) {
            <option [value]="pill.key ?? ''">{{ pill.label }}</option>
          }
        </select>

        <button (click)="openAddModal()"
                style="background: #005DAC; color: #FFFFFF; border: none; border-radius: 8px; padding: 10px 24px; font-size: 14px; font-weight: 700; cursor: pointer; white-space: nowrap;">
          + Add Booking
        </button>
      </div>

      <!-- ==================== TABLE ==================== -->
      @if (loading()) {
        @for (i of [1,2,3,4,5]; track i) {
          <div style="background: #FFFFFF; border: 1px solid #C1C6D4; border-radius: 8px; padding: 16px; margin-bottom: 8px; display: flex; gap: 16px; align-items: center;">
            <div class="skeleton" style="width: 40px; height: 40px; border-radius: 50%;"></div>
            <div style="flex: 1;"><div class="skeleton" style="height: 16px; width: 60%;"></div></div>
            <div style="flex: 1;"><div class="skeleton" style="height: 16px; width: 40%;"></div></div>
            <div style="width: 80px;"><div class="skeleton" style="height: 16px;"></div></div>
          </div>
        }
      } @else if (bookings().length === 0) {
        <div style="background: #FFFFFF; border: 1px solid #C1C6D4; border-radius: 12px; text-align: center; padding: 80px 20px;">
          <span class="material-symbols-outlined" style="font-size: 48px; color: #C1C6D4; margin-bottom: 16px;">calendar_month</span>
          <p style="font-size: 18px; font-weight: 600; color: #717783; margin: 0 0 4px;">No bookings found</p>
          <p style="font-size: 14px; color: #76777D; margin: 0;">Bookings will appear here once customers make reservations.</p>
        </div>
      } @else {
        <div style="background: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #C1C6D4;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #F5F3F3;">
                <th style="padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 700; color: #49454F; text-transform: uppercase; letter-spacing: 0.5px;">ID</th>
                <th style="padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 700; color: #49454F; text-transform: uppercase; letter-spacing: 0.5px;">Customer</th>
                <th style="padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 700; color: #49454F; text-transform: uppercase; letter-spacing: 0.5px;">Vehicle</th>
                <th style="padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 700; color: #49454F; text-transform: uppercase; letter-spacing: 0.5px;">Date</th>
                <th style="padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 700; color: #49454F; text-transform: uppercase; letter-spacing: 0.5px;">Type</th>
                <th style="padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 700; color: #49454F; text-transform: uppercase; letter-spacing: 0.5px;">Amount</th>
                <th style="padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 700; color: #49454F; text-transform: uppercase; letter-spacing: 0.5px;">Status</th>
                <th style="padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 700; color: #49454F; text-transform: uppercase; letter-spacing: 0.5px;">Payment</th>
                <th style="padding: 12px 16px; text-align: right; font-size: 12px; font-weight: 700; color: #49454F; text-transform: uppercase; letter-spacing: 0.5px;">Actions</th>
              </tr>
            </thead>
            <tbody style="border-top: 1px solid #E9E8E7;">
              @for (booking of bookings(); track booking._id) {
                @let cancelled = booking.status === 'cancelled';
                <tr style="border-bottom: 1px solid #F0EFEF; {{ cancelled ? 'opacity: 0.6; background: #FAFAFA;' : '' }}">
                  <!-- ID -->
                  <td style="padding: 16px;">
                    <span style="color: #005DAC; font-weight: 700; font-size: 14px;">#{{ booking._id.slice(-6).toUpperCase() }}</span>
                  </td>

                  <!-- Customer -->
                  <td style="padding: 16px;">
                    <div class="flex items-center gap-3">
                      <div style="width: 36px; height: 36px; border-radius: 50%; background: #FD761A; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #FFFFFF; flex-shrink: 0;">
                        {{ getInitials(getCustomerName(booking)) }}
                      </div>
                      <div>
                        <p style="font-size: 14px; font-weight: 600; color: #1B1C1C; margin: 0; line-height: 1.3;">{{ getCustomerName(booking) }}</p>
                        <p style="font-size: 12px; color: #717783; margin: 0;">{{ getCustomerEmail(booking) }}</p>
                      </div>
                    </div>
                  </td>

                  <!-- Vehicle -->
                  <td style="padding: 16px;">
                    <div class="flex items-center gap-3">
                      <div style="width: 48px; height: 48px; border-radius: 8px; overflow: hidden; flex-shrink: 0; background: #E5EEFF;">
                        @if (getVehicleImage(booking); as img) {
                          <img [src]="img" style="width: 100%; height: 100%; object-fit: cover;" />
                        } @else {
                          <span class="material-symbols-outlined" style="font-size: 24px; color: #3980F4; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">directions_car</span>
                        }
                      </div>
                      <span style="font-size: 14px; font-weight: 600; color: #1B1C1C;">{{ getVehicleName(booking) }}</span>
                    </div>
                  </td>

                  <!-- Date -->
                  <td style="padding: 16px;">
                    <p style="font-size: 14px; font-weight: 600; color: #1B1C1C; margin: 0; {{ cancelled ? 'text-decoration: line-through;' : '' }}">
                      {{ booking.startDate | date:'MMM d' }} – {{ booking.endDate | date:'MMM d, y' }}
                    </p>
                    <p style="font-size: 12px; color: #717783; margin: 0;">{{ bookingDays(booking) }} days</p>
                  </td>

                  <!-- Type -->
                  <td style="padding: 16px;">
                    <span style="font-size: 14px; color: #1B1C1C;">{{ rentalTypeLabel(booking.rentalType) }}</span>
                  </td>

                  <!-- Amount -->
                  <td style="padding: 16px;">
                    <span style="font-size: 16px; font-weight: 700; color: #1B1C1C;">\${{ booking.totalPrice.toFixed(2) }}</span>
                    @if (booking.discount > 0) {
                      <span style="font-size: 11px; color: #991B1B; margin-left: 4px;">-{{ booking.discount }}%</span>
                    }
                  </td>

                  <!-- Status -->
                  <td style="padding: 16px;">
                    <span style="display: inline-block; padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; letter-spacing: 0.3px; background: {{ STATUS_STYLE[booking.status]?.bg || '#E3E2E2' }}; color: {{ STATUS_STYLE[booking.status]?.color || '#49454F' }};">
                      {{ booking.status.charAt(0).toUpperCase() + booking.status.slice(1) }}
                    </span>
                  </td>

                  <!-- Payment -->
                  <td style="padding: 16px;">
                    <span style="display: inline-block; padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; letter-spacing: 0.3px; background: {{ PAYMENT_STYLE[booking.paymentStatus]?.bg || '#E3E2E2' }}; color: {{ PAYMENT_STYLE[booking.paymentStatus]?.color || '#49454F' }};">
                      {{ paymentLabel(booking.paymentStatus) }}
                    </span>
                  </td>

                  <!-- Actions -->
                  <td style="padding: 16px; text-align: right;">
                    <div class="flex items-center justify-end gap-1">
                      @if (booking.status === 'pending') {
                        <button (click)="updateStatus(booking._id, 'confirmed')"
                                style="background: #E7F5ED; color: #1E7B4C; border: none; border-radius: 6px; padding: 6px 12px; font-size: 12px; font-weight: 700; cursor: pointer; white-space: nowrap;">
                          Approve
                        </button>
                      }
                      @if (booking.status === 'confirmed' && booking.paymentStatus !== 'paid') {
                        <button (click)="updatePayment(booking._id, 'paid')"
                                style="background: #D4E3FF; color: #005DAC; border: none; border-radius: 6px; padding: 6px 12px; font-size: 12px; font-weight: 700; cursor: pointer; white-space: nowrap;">
                          Verify
                        </button>
                      }
                      @if (booking.status === 'confirmed' && booking.paymentStatus === 'paid') {
                        <button (click)="updateStatus(booking._id, 'completed')"
                                style="background: #D4E3FF; color: #005DAC; border: none; border-radius: 6px; padding: 6px 12px; font-size: 12px; font-weight: 700; cursor: pointer; white-space: nowrap;">
                          Complete
                        </button>
                      }
                      @if (booking.status !== 'cancelled' && booking.status !== 'completed') {
                        <button (click)="cancelBooking(booking._id)"
                                style="background: none; border: none; cursor: pointer; color: #B3261E; padding: 6px;">
                          <span class="material-symbols-outlined" style="font-size: 20px;">cancel</span>
                        </button>
                      }
                      <button style="background: none; border: none; cursor: pointer; color: #717783; padding: 6px;">
                        <span class="material-symbols-outlined" style="font-size: 20px;">more_vert</span>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- ==================== PAGINATION ==================== -->
        <div style="border-top: 1px solid #C1C6D4; padding-top: 20px; margin-top: 20px; display: flex; align-items: center; justify-content: space-between;">
          <span style="font-size: 14px; color: #717783;">
            {{ (currentPage() - 1) * pageSize + 1 }}–{{ Math.min(currentPage() * pageSize, total()) }} of {{ total() }}
          </span>
          <div class="flex items-center gap-1">
            <button (click)="goToPage(currentPage() - 1)" [disabled]="currentPage() <= 1"
                    style="width: 40px; height: 40px; border: 1px solid #C1C6D4; border-radius: 8px; background: #FFFFFF; cursor: {{ currentPage() <= 1 ? 'not-allowed' : 'pointer' }}; color: {{ currentPage() <= 1 ? '#C1C6D4' : '#414752' }}; display: flex; align-items: center; justify-content: center;">
              <span class="material-symbols-outlined" style="font-size: 18px;">chevron_left</span>
            </button>
            @for (p of pageNumbers(); track p) {
              @if (p === '...') {
                <span style="padding: 0 4px; color: #717783; font-size: 14px;">...</span>
              } @else {
                <button (click)="goToPage(p)"
                        style="width: 40px; height: 40px; border: none; border-radius: 8px; background: {{ currentPage() === p ? '#005DAC' : 'transparent' }}; color: {{ currentPage() === p ? '#FFFFFF' : '#414752' }}; font-size: 14px; font-weight: {{ currentPage() === p ? '700' : '500' }}; cursor: pointer;">
                  {{ p }}
                </button>
              }
            }
            <button (click)="goToPage(currentPage() + 1)" [disabled]="currentPage() >= totalPages()"
                    style="width: 40px; height: 40px; border: 1px solid #C1C6D4; border-radius: 8px; background: #FFFFFF; cursor: {{ currentPage() >= totalPages() ? 'not-allowed' : 'pointer' }}; color: {{ currentPage() >= totalPages() ? '#C1C6D4' : '#414752' }}; display: flex; align-items: center; justify-content: center;">
              <span class="material-symbols-outlined" style="font-size: 18px;">chevron_right</span>
            </button>
          </div>
        </div>
      }

      <!-- ==================== FOOTER ==================== -->
      <div style="border-top: 1px solid #E9E8E7; margin-top: 32px; padding-top: 20px; display: flex; justify-content: space-between; font-size: 13px; color: #717783;">
        <span>&copy; 2025 Vehicle Rental. All rights reserved.</span>
        <div class="flex items-center gap-4">
          <a href="#" style="color: #717783; text-decoration: none;">Privacy Policy</a>
          <a href="#" style="color: #717783; text-decoration: none;">Terms of Service</a>
          <a href="#" style="color: #717783; text-decoration: none;">Support</a>
        </div>
      </div>

    </div>
  `,
})
export class ManageBookingsComponent implements OnInit {
  protected readonly Math = Math;
  protected readonly STATUS_STYLE = STATUS_STYLE;
  protected readonly PAYMENT_STYLE = PAYMENT_STYLE;
  protected readonly statusPills = STATUS_PILLS;

  private readonly bookingService = inject(BookingService);

  readonly bookings = signal<Booking[]>([]);
  readonly loading = signal(true);
  readonly activeFilter = signal<string | null>(null);
  readonly currentPage = signal(1);
  readonly totalPages = signal(1);
  readonly total = signal(0);
  readonly searchQuery = signal('');
  readonly pageSize = 10;

  readonly statCards = computed(() => {
    const all = this.bookings();
    const confirmed = all.filter(b => b.status === 'confirmed').length;
    const pending = all.filter(b => b.status === 'pending').length;
    const cancelled = all.filter(b => b.status === 'cancelled').length;
    return [
      { label: 'Total Bookings', icon: 'calendar_month', bg: '#D4E3FF', color: '#005DAC', value: () => this.total() },
      { label: 'Active Now', icon: 'trending_up', bg: '#CFE6F2', color: '#00668C', value: () => confirmed },
      { label: 'Pending', icon: 'schedule', bg: '#FFDBC7', color: '#8A6D00', value: () => pending },
      { label: 'Cancelled', icon: 'cancel', bg: '#FFDAD6', color: '#B3261E', value: () => cancelled },
    ];
  });

  readonly pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | '...')[] = [1];
    if (current > 3) pages.push('...');
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (current < total - 2) pages.push('...');
    pages.push(total);
    return pages;
  });

  ngOnInit() { this.loadBookings(); }

  loadBookings() {
    this.loading.set(true);
    this.bookingService.getBookings(
      this.activeFilter() || undefined,
      this.currentPage(),
      this.pageSize
    ).subscribe({
      next: (res) => {
        this.bookings.set(res.bookings);
        this.totalPages.set(res.totalPages);
        this.total.set(res.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadBookings();
  }

  updateStatus(id: string, status: BookingStatus) {
    this.bookingService.updateBookingStatus(id, status).subscribe(() => this.loadBookings());
  }

  updatePayment(id: string, status: string) {
    this.bookingService.updateBookingStatus(id, status as BookingStatus).subscribe(() => this.loadBookings());
  }

  cancelBooking(id: string) {
    if (confirm('Cancel this booking?')) {
      this.bookingService.cancelBooking(id).subscribe(() => this.loadBookings());
    }
  }

  openAddModal() {
    console.warn('Add Booking modal not yet implemented');
  }

  getCustomerName(booking: Booking): string {
    const u = booking.userId;
    return typeof u === 'object' && u !== null ? u.name : 'Walk-in Customer';
  }

  getCustomerEmail(booking: Booking): string {
    const u = booking.userId;
    return typeof u === 'object' && u !== null ? u.email : 'N/A';
  }

  getVehicleName(booking: Booking): string {
    const v = booking.vehicleId;
    return typeof v === 'object' && v !== null ? v.name : 'Unknown Vehicle';
  }

  getVehicleImage(booking: Booking): string | null {
    const v = booking.vehicleId;
    if (typeof v === 'object' && v !== null && v.images?.length > 0) {
      return v.images[0];
    }
    return null;
  }

  bookingDays(booking: Booking): number {
    return daysBetween(booking.startDate, booking.endDate);
  }

  rentalTypeLabel(type: string): string {
    return type.charAt(0).toUpperCase() + type.slice(1);
  }

  paymentLabel(status: string): string {
    switch (status) {
      case 'paid': return 'Paid';
      case 'unpaid': return 'Pending Payment';
      case 'refunded': return 'Refunded';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  }

  protected getInitials = getInitials;
}
