import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../../core/services/booking.service';
import { Booking, BookingStatus } from '../../../models/booking.model';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

const STATUS_STYLE: Record<string, { bg: string; color: string; border: string; dot: string }> = {
  pending:    { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A', dot: '#F59E0B' },
  confirmed:  { bg: '#EFF6FF', color: '#005DAC', border: '#DBEAFE', dot: '#3980F4' },
  active:     { bg: '#ECFDF5', color: '#059669', border: '#A7F3D0', dot: '#10B981' },
  completed:  { bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0', dot: '#22C55E' },
  cancelled:  { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA', dot: '#F87171' },
  overdue:    { bg: '#FFF7ED', color: '#EA580C', border: '#FED7AA', dot: '#F97316' },
};

const PAYMENT_STYLE: Record<string, { bg: string; color: string; border: string; dot: string }> = {
  paid:     { bg: '#ECFDF5', color: '#059669', border: '#A7F3D0', dot: '#10B981' },
  unpaid:   { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A', dot: '#F59E0B' },
  refunded: { bg: '#F3F4F6', color: '#6B7280', border: '#E5E7EB', dot: '#9CA3AF' },
  failed:   { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA', dot: '#F87171' },
};

const QUICK_FILTERS = [
  { key: null, label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'overdue', label: 'Overdue' },
] as const;

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'price_high', label: 'Amount High \u2192 Low' },
  { value: 'price_low', label: 'Amount Low \u2192 High' },
];

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function daysBetween(a: string, b: string): number {
  return Math.max(1, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000));
}

const CUSTOMER_AVATARS = ['#005DAC', '#7C3AED', '#059669', '#DC2626', '#D97706', '#DB2777', '#0D9488', '#4F46E5'];

@Component({
  selector: 'app-manage-bookings',
  standalone: true,
  imports: [DatePipe, FormsModule],
  templateUrl: './manage-bookings.component.html',
})
export class ManageBookingsComponent implements OnInit {
  private readonly bookingService = inject(BookingService);
  private readonly searchSubject = new Subject<string>();

  readonly bookings = signal<Booking[]>([]);
  readonly loading = signal(true);
  readonly activeFilter = signal<string | null>(null);
  readonly statusFilter = signal('');
  readonly searchQuery = signal('');
  readonly sortBy = signal('newest');
  readonly currentPage = signal(1);
  readonly totalPages = signal(0);
  readonly total = signal(0);
  readonly pageSize = 10;

  readonly selectedBookings = signal<Set<string>>(new Set());
  readonly showBookingDrawer = signal<Booking | null>(null);
  readonly showQuickMenu = signal<string | null>(null);
  readonly showExportMenu = signal(false);
  readonly showWizard = signal(false);
  readonly wizardStep = signal(1);

  readonly quickFilters = QUICK_FILTERS;
  readonly sortOptions = SORT_OPTIONS;

  constructor() {
    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => { this.currentPage.set(1); this.loadBookings(); });
  }

  ngOnInit() { this.loadBookings(); }

  get pageEnd() {
    return Math.min(this.currentPage() * this.pageSize, this.total());
  }

  get pageNumbers() {
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
  }

  readonly statCards = computed(() => {
    const all = this.bookings();
    const pending = all.filter(b => b.status === 'pending').length;
    const confirmed = all.filter(b => b.status === 'confirmed').length;
    const completed = all.filter(b => b.status === 'completed').length;
    const cancelled = all.filter(b => b.status === 'cancelled').length;
    const totalRev = all.reduce((s, b) => s + b.totalPrice, 0);
    const lastMonth = all.filter(b => {
      const d = new Date(b.createdAt || b.startDate);
      const now = new Date();
      return d.getMonth() === (now.getMonth() - 1 + 12) % 12;
    });
    const lastMonthRev = lastMonth.reduce((s, b) => s + b.totalPrice, 0);
    const trend = lastMonthRev > 0 ? Math.round((totalRev - lastMonthRev) / lastMonthRev * 100) : 0;
    return [
      { label: 'Total Bookings', icon: 'calendar_month', value: this.total(),
        bg: 'background:#EFF6FF', iconColor: 'color:#3980F4', trend },
      { label: 'Active Rentals', icon: 'trending_up', value: confirmed,
        bg: 'background:#ECFDF5', iconColor: 'color:#10B981', trend: null },
      { label: 'Pending', icon: 'schedule', value: pending,
        bg: 'background:#FFFBEB', iconColor: 'color:#F59E0B', trend: null },
      { label: 'Completed', icon: 'check_circle', value: completed,
        bg: 'background:#F0FDF4', iconColor: 'color:#22C55E', trend: null },
      { label: 'Cancelled', icon: 'cancel', value: cancelled,
        bg: 'background:#FEF2F2', iconColor: 'color:#F87171', trend: null },
      { label: 'Revenue', icon: 'payments', value: '$' + totalRev.toLocaleString(),
        bg: 'background:#F5F3FF', iconColor: 'color:#8B5CF6', trend },
    ];
  });

  get revenueCards() {
    const all = this.bookings();
    const totalRev = all.reduce((s, b) => s + b.totalPrice, 0);
    const today = all.filter(b => {
      const d = new Date(b.createdAt || b.startDate);
      const now = new Date();
      return d.toDateString() === now.toDateString();
    });
    const todayRev = today.reduce((s, b) => s + b.totalPrice, 0);
    const thisWeek = all.filter(b => {
      const d = new Date(b.createdAt || b.startDate);
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      return d >= weekStart;
    });
    const weekRev = thisWeek.reduce((s, b) => s + b.totalPrice, 0);
    const avgVal = all.length > 0 ? totalRev / all.length : 0;
    return [
      { label: "Today's Revenue", value: '$' + todayRev.toLocaleString() },
      { label: 'This Week', value: '$' + weekRev.toLocaleString() },
      { label: 'Avg Booking Value', value: '$' + avgVal.toFixed(2) },
      { label: 'Occupancy', value: all.length > 0 ? Math.round(all.filter(b => b.status === 'confirmed').length / all.length * 100) + '%' : '0%' },
    ];
  }

  onSearch(query: string) {
    this.searchQuery.set(query);
    this.searchSubject.next(query);
  }

  onFilterChange() {
    this.currentPage.set(1);
    this.loadBookings();
  }

  setQuickFilter(key: string | null) {
    this.activeFilter.set(key);
    this.statusFilter.set(key ?? '');
    this.currentPage.set(1);
    this.loadBookings();
  }

  resetFilters() {
    this.searchQuery.set('');
    this.activeFilter.set(null);
    this.statusFilter.set('');
    this.sortBy.set('newest');
    this.currentPage.set(1);
    this.loadBookings();
  }

  loadBookings() {
    this.loading.set(true);
    const status = this.activeFilter() || this.statusFilter() || undefined;
    this.bookingService.getBookings(status, this.currentPage(), this.pageSize).subscribe({
      next: (res) => {
        this.bookings.set(res.bookings);
        this.totalPages.set(res.totalPages);
        this.total.set(res.total);
        this.loading.set(false);
        this.selectedBookings.set(new Set());
      },
      error: () => this.loading.set(false),
    });
  }

  goToPage(page: string | number) {
    page = typeof page === 'string' ? parseInt(page, 10) : page;
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadBookings();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  allSelected(): boolean {
    return this.bookings().length > 0 && this.selectedBookings().size === this.bookings().length;
  }

  toggleSelect(id: string) {
    const set = new Set(this.selectedBookings());
    if (set.has(id)) set.delete(id); else set.add(id);
    this.selectedBookings.set(set);
  }

  toggleSelectAll() {
    if (this.allSelected()) this.selectedBookings.set(new Set());
    else this.selectedBookings.set(new Set(this.bookings().map(b => b._id)));
  }

  deselectAll() { this.selectedBookings.set(new Set()); }

  toggleQuickMenu(id: string) {
    this.showQuickMenu.set(this.showQuickMenu() === id ? null : id);
  }

  openBookingDrawer(booking: Booking) {
    this.showBookingDrawer.set(booking);
  }

  openBookingWizard() {
    this.wizardStep.set(1);
    this.showWizard.set(true);
  }

  nextStep() { if (this.wizardStep() < 4) this.wizardStep.update(s => s + 1); }
  prevStep() { if (this.wizardStep() > 1) this.wizardStep.update(s => s - 1); }

  quickStatus(id: string, status: BookingStatus) {
    this.bookingService.updateBookingStatus(id, status).subscribe(() => this.loadBookings());
  }

  cancelBooking(id: string) {
    if (confirm('Cancel this booking?')) {
      this.bookingService.cancelBooking(id).subscribe(() => this.loadBookings());
    }
  }

  bulkApprove() {
    const ids = Array.from(this.selectedBookings());
    ids.forEach(id => this.bookingService.updateBookingStatus(id, 'confirmed').subscribe());
    this.deselectAll();
    setTimeout(() => this.loadBookings(), 500);
  }

  bulkCancel() {
    const ids = Array.from(this.selectedBookings());
    ids.forEach(id => this.bookingService.cancelBooking(id).subscribe());
    this.deselectAll();
    setTimeout(() => this.loadBookings(), 500);
  }

  getStatusBadge(status: string): { bg: string; color: string; border: string; dot: string; label: string } | null {
    const s = STATUS_STYLE[status];
    if (!s) return null;
    return { ...s, label: status.charAt(0).toUpperCase() + status.slice(1) };
  }

  getPaymentBadge(status: string): { bg: string; color: string; border: string; dot: string; label: string } | null {
    const s = PAYMENT_STYLE[status];
    if (!s) return null;
    const labels: Record<string, string> = { paid: 'Paid', unpaid: 'Pending', refunded: 'Refunded', failed: 'Failed' };
    return { ...s, label: labels[status] || status };
  }

  getInitials = getInitials;

  getAvatarColor(name: string): string {
    const colors = ['#005DAC', '#7C3AED', '#059669', '#DC2626', '#D97706', '#DB2777', '#0D9488', '#4F46E5'];
    return 'background: ' + colors[name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length] + ';';
  }

  getCustomerName(booking: Booking): string {
    const u = booking.userId;
    return typeof u === 'object' && u !== null ? u.name : 'Walk-in';
  }

  getCustomerEmail(booking: Booking): string {
    const u = booking.userId;
    return typeof u === 'object' && u !== null ? u.email : 'N/A';
  }

  getVehicleName(booking: Booking): string {
    const v = booking.vehicleId;
    return typeof v === 'object' && v !== null ? v.name : 'Unknown';
  }

  getVehicleBrand(booking: Booking): string {
    const v = booking.vehicleId;
    return typeof v === 'object' && v !== null ? v.brand : '';
  }

  getVehicleImage(booking: Booking): string | null {
    const v = booking.vehicleId;
    if (typeof v === 'object' && v !== null && v.images?.length > 0) return v.images[0];
    return null;
  }

  bookingDays(booking: Booking): number {
    return daysBetween(booking.startDate, booking.endDate);
  }

  rentalTypeLabel(type: string): string {
    return type.charAt(0).toUpperCase() + type.slice(1);
  }

  getTimeline(booking: Booking): { label: string; time: string; color: string }[] {
    const events: { label: string; time: string; color: string }[] = [];
    const created = booking.createdAt || booking.startDate;
    events.push({ label: 'Booking Created', time: new Date(created).toLocaleDateString(), color: '#3980F4' });
    if (['confirmed', 'completed', 'cancelled'].includes(booking.status)) {
      if (booking.paymentStatus === 'paid') events.push({ label: 'Payment Completed', time: 'Completed', color: '#10B981' });
      else events.push({ label: 'Payment Pending', time: 'Awaiting', color: '#F59E0B' });
    }
    if (booking.status === 'confirmed' || booking.status === 'completed') {
      events.push({ label: 'Booking Confirmed', time: new Date(booking.startDate).toLocaleDateString(), color: '#3980F4' });
    }
    if (booking.status === 'completed') {
      events.push({ label: 'Booking Completed', time: new Date(booking.endDate).toLocaleDateString(), color: '#22C55E' });
    }
    if (booking.status === 'cancelled') {
      events.push({ label: 'Booking Cancelled', time: 'Cancelled', color: '#F87171' });
    }
    return events.length > 1 ? events : [
      { label: 'Booking Created', time: new Date(created).toLocaleDateString(), color: '#3980F4' },
      { label: 'In Progress', time: 'Awaiting updates', color: '#9CA3AF' },
    ];
  }
}
