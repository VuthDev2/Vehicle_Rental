import { Component, inject, signal, computed, ViewChildren, QueryList, ElementRef, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Chart } from 'chart.js/auto';
import { ReportService } from '../../../core/services/report.service';
import { BookingService } from '../../../core/services/booking.service';
import { VehicleService } from '../../../core/services/vehicle.service';
import { PaymentService } from '../../../core/services/payment.service';
import { UserService } from '../../../core/services/user.service';
import { Booking } from '../../../models/booking.model';

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly';
type Metric = 'revenue' | 'bookings' | 'profit' | 'expenses';
type RevenueChartType = 'line' | 'bar' | 'area';
type DoughnutType = 'doughnut' | 'pie';

interface ChartDataPoint {
  label: string;
  value: number;
  secondary?: number;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './reports.component.html',
})
export class ReportsComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly reportService = inject(ReportService);
  private readonly bookingService = inject(BookingService);
  private readonly vehicleService = inject(VehicleService);
  private readonly paymentService = inject(PaymentService);
  private readonly userService = inject(UserService);

  @ViewChildren('revenueChart') revenueChartRef!: QueryList<ElementRef<HTMLCanvasElement>>;
  @ViewChildren('bookingChart') bookingChartRef!: QueryList<ElementRef<HTMLCanvasElement>>;
  @ViewChildren('customerChart') customerChartRef!: QueryList<ElementRef<HTMLCanvasElement>>;
  @ViewChildren('categoryChart') categoryChartRef!: QueryList<ElementRef<HTMLCanvasElement>>;

  readonly loading = signal(true);
  readonly selectedPeriod = signal('30');
  readonly selectedMetric = signal<Metric>('revenue');
  readonly selectedChartType = signal<RevenueChartType>('line');
  readonly chartPeriod = signal<Period>('monthly');
  readonly doughnutType = signal<DoughnutType>('doughnut');

  readonly periods: Period[] = ['daily', 'weekly', 'monthly', 'yearly'];
  readonly metrics: Metric[] = ['revenue', 'bookings', 'profit', 'expenses'];
  readonly chartTypes: RevenueChartType[] = ['line', 'bar', 'area'];

  private charts: Chart[] = [];

  // Raw data signals
  private allBookings = signal<Booking[]>([]);
  private allVehicles = signal<any[]>([]);
  private allPayments = signal<any[]>([]);
  private allUsers = signal<any[]>([]);
  private summaryData = signal<any>(null);
  private revenueRaw = signal<ChartDataPoint[]>([]);

  readonly executiveInsights = computed(() => [
    {
      label: 'Revenue',
      icon: 'trending_up',
      text: `Revenue increased by ${this.revenueGrowth()}% compared to last ${this.selectedPeriod() < '60' ? 'week' : 'month'}.`,
      bg: '#E7F5ED',
      border: '#D1FAE5',
      badgeBg: '#D1FAE5',
      color: '#059669',
    },
    {
      label: 'Top Category',
      icon: 'directions_car',
      text: `${this.topCategory()}s generated the highest revenue this period.`,
      bg: '#E5EEFF',
      border: '#DBEAFE',
      badgeBg: '#DBEAFE',
      color: '#005DAC',
    },
    {
      label: 'Fleet',
      icon: 'local_shipping',
      text: `Fleet utilization reached ${this.fleetUtilizationPercent()}%, indicating strong vehicle demand.`,
      bg: '#FFF3E0',
      border: '#FEEABC',
      badgeBg: '#FEEABC',
      color: '#E65100',
    },
    {
      label: 'Bookings',
      icon: 'receipt_long',
      text: `${this.bookingStatusData()[2]?.value || 0} bookings are awaiting approval.`,
      bg: '#F3F0FF',
      border: '#E9DFFF',
      badgeBg: '#E9DFFF',
      color: '#7C3AED',
    },
  ]);

  readonly kpiCards = computed(() => {
    const s = this.summaryData();
    const totalRev = s?.totalRevenue || 0;
    const totalBook = s?.totalBookings || 0;
    const totalVeh = s?.totalVehicles || 0;
    const activeRentals = this.allBookings().filter(b => b.status === 'confirmed').length;
    return [
      { label: 'Total Revenue', icon: 'payments', value: '$' + totalRev.toLocaleString(), bg: '#E7F5ED', color: '#059669', trend: '+18%', trendColor: '#059669', trendIcon: 'trending_up' },
      { label: 'Total Bookings', icon: 'receipt_long', value: totalBook.toLocaleString(), bg: '#E5EEFF', color: '#005DAC', trend: '+12%', trendColor: '#059669', trendIcon: 'trending_up' },
      { label: 'Fleet Utilization', icon: 'local_shipping', value: this.fleetUtilizationPercent() + '%', bg: '#FFF3E0', color: '#E65100', trend: '+5%', trendColor: '#059669', trendIcon: 'trending_up' },
      { label: 'Active Rentals', icon: 'key', value: activeRentals.toString(), bg: '#FFEAEA', color: '#DC2626', trend: 'Live', trendColor: '#059669', trendIcon: 'fiber_manual_record' },
      { label: 'Avg. Booking', icon: 'receipt', value: '$' + (totalBook > 0 ? Math.round(totalRev / totalBook) : 0).toLocaleString(), bg: '#F3F0FF', color: '#7C3AED', trend: '+8%', trendColor: '#059669', trendIcon: 'trending_up' },
      { label: 'Rev. per Booking', icon: 'trending_up', value: '$' + (totalBook > 0 ? Math.round(totalRev / totalBook) : 0).toLocaleString(), bg: '#E7F5ED', color: '#059669', trend: '+6%', trendColor: '#059669', trendIcon: 'trending_up' },
      { label: 'Customer Growth', icon: 'group_add', value: '+34', bg: '#E5EEFF', color: '#005DAC', trend: 'This Month', trendColor: '#6B7280', trendIcon: 'schedule' },
    ];
  });

  readonly revenueBreakdown = computed(() => {
    const s = this.summaryData();
    const total = s?.totalRevenue || 0;
    return [
      { label: "Today's Revenue", value: Math.round(total * 0.03) },
      { label: 'This Week', value: Math.round(total * 0.18) },
      { label: 'This Month', value: Math.round(total * 0.65) },
      { label: 'This Year', value: total },
    ];
  });

  readonly fleetData = computed(() => {
    const vehicles = this.allVehicles();
    const bookings = this.allBookings();
    const types = ['SUV', 'Sedan', 'Motorbike', 'Van', 'Truck'];
    const colors = ['#059669', '#005DAC', '#7C3AED', '#E65100', '#DC2626'];
    const counts: Record<string, number> = {};
    vehicles.forEach(v => {
      const t = v.type || 'Other';
      counts[t] = (counts[t] || 0) + 1;
    });
    return types.map((t, i) => {
      const total = counts[t] || 1;
      const booked = bookings.filter(b => {
        const vid = typeof b.vehicleId === 'object' ? b.vehicleId?._id : b.vehicleId;
        const v = vehicles.find(ve => ve._id === vid);
        return v?.type === t && (b.status === 'confirmed' || b.status === 'completed');
      }).length;
      const percent = Math.min(100, Math.round((booked / Math.max(total, 1)) * 100));
      return { label: t, percent, count: total, color: colors[i] };
    });
  });

  readonly fleetUtilizationPercent = computed(() => {
    const items = this.fleetData();
    const total = items.reduce((s, i) => s + i.percent, 0);
    return items.length > 0 ? Math.round(total / items.length) : 0;
  });

  readonly bookingStatusData = computed(() => {
    const bookings = this.allBookings();
    const statuses = ['completed', 'confirmed', 'pending', 'cancelled'];
    const labels = ['Completed', 'Active', 'Pending', 'Cancelled'];
    const colors = ['#059669', '#005DAC', '#F59E0B', '#DC2626'];
    return statuses.map((s, i) => ({
      label: labels[i],
      value: bookings.filter(b => b.status === s).length,
      color: colors[i],
    }));
  });

  readonly topVehicles = computed(() => this.popularVehiclesCache());

  readonly customerData = computed(() => {
    const users = this.allUsers();
    const bookings = this.allBookings();
    const total = Math.max(users.length, 1);
    const customerUsers = users.filter(u => u.role === 'customer');
    const activeCustomers = new Set(bookings.map(b => typeof b.userId === 'object' ? b.userId?._id : b.userId));
    const newC = Math.round(customerUsers.length * 0.15);
    const returning = activeCustomers.size;
    const vip = Math.round(customerUsers.length * 0.08);
    const inactive = customerUsers.length - returning;
    return [
      { label: 'New Customers', value: newC, percent: Math.round((newC / total) * 100), color: '#059669' },
      { label: 'Returning', value: returning, percent: Math.round((returning / total) * 100), color: '#005DAC' },
      { label: 'VIP', value: vip, percent: Math.round((vip / total) * 100), color: '#7C3AED' },
      { label: 'Inactive', value: inactive, percent: Math.round((inactive / total) * 100), color: '#D1D5DB' },
    ];
  });

  readonly monthlyData = computed(() => {
    const raw = this.revenueRaw();
    if (raw.length === 0) {
      const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return MONTHS.slice(0, 6).map((m, i) => ({
        month: m,
        bookings: Math.round(100 + Math.random() * 80),
        revenue: Math.round(5000 + Math.random() * 8000),
        growth: i > 0 ? Math.round((Math.random() * 20) - 2) : 12,
      }));
    }
    return raw.map((r, i) => ({
      month: r.label,
      bookings: r.secondary || 0,
      revenue: r.value,
      growth: i > 0 ? Math.round(((r.value - raw[i - 1].value) / (raw[i - 1].value || 1)) * 100) : 12,
    }));
  });

  private readonly popularVehiclesCache = signal<any[]>([]);

  readonly recentActivity = computed(() => {
    const bookings = this.allBookings();
    const recent = [...bookings].sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()).slice(0, 5);
    const activities = recent.map(b => {
      const time = b.createdAt ? this.timeAgo(b.createdAt) : 'Recently';
      const status = b.status;
      const map: Record<string, { icon: string; bg: string; color: string; label: string }> = {
        completed: { icon: 'check_circle', bg: '#E7F5ED', color: '#059669', label: 'Booking Completed' },
        confirmed: { icon: 'how_to_reg', bg: '#E5EEFF', color: '#005DAC', label: 'Booking Confirmed' },
        pending: { icon: 'schedule', bg: '#FFF3E0', color: '#E65100', label: 'Booking Pending' },
        cancelled: { icon: 'cancel', bg: '#FFEAEA', color: '#DC2626', label: 'Booking Cancelled' },
      };
      const m = map[status] || { icon: 'receipt_long', bg: '#F3F4F6', color: '#6B7280', label: 'Booking ' + status };
      const vehicleName = typeof b.vehicleId === 'object' ? b.vehicleId?.name || 'Vehicle' : 'Vehicle';
      return { ...m, detail: `${vehicleName} · ${this.getUserName(b)}`, time };
    });
    return activities;
  });

  private getUserName(b: Booking): string {
    if (typeof b.userId === 'object' && b.userId?.name) return b.userId.name;
    return 'Customer';
  }

  readonly quickInsights = computed(() => [
    {
      icon: '📈',
      text: `Revenue increased by ${this.revenueGrowth()}% compared to last ${this.selectedPeriod() < '60' ? 'week' : 'month'}.`,
      bg: '#F0FDF4',
      border: '#DCFCE7',
      color: '#059669',
    },
    {
      icon: '🚗',
      text: `${this.topCategory()}s generated the highest income this period.`,
      bg: '#EFF6FF',
      border: '#DBEAFE',
      color: '#005DAC',
    },
    {
      icon: '📅',
      text: 'Weekend bookings are 35% higher than weekdays on average.',
      bg: '#FFF7ED',
      border: '#FFEDD5',
      color: '#E65100',
    },
    {
      icon: '⏱️',
      text: 'Average booking duration is stable at 3.2 days per rental.',
      bg: '#F5F3FF',
      border: '#EDE9FE',
      color: '#7C3AED',
    },
    {
      icon: '📊',
      text: `Fleet utilization reached ${this.fleetUtilizationPercent()}%, indicating strong vehicle demand.`,
      bg: '#FEF2F2',
      border: '#FEE2E2',
      color: '#DC2626',
    },
  ]);

  ngOnInit() {
    this.loadAllData();
  }

  ngAfterViewInit() {
    this.charts = [];
  }

  ngOnDestroy() {
    this.charts.forEach(c => c.destroy());
    this.charts = [];
  }

  private loadAllData() {
    this.loading.set(true);

    this.reportService.getDashboard().subscribe({
      next: (res) => {
        this.summaryData.set(res.summary);
        this.allBookings.set([]);
        this.allVehicles.set([]);
        this.allPayments.set([]);
        this.allUsers.set([]);
        this.popularVehiclesCache.set([]);
        this.setupChartData();
      },
      error: () => { this.fallbackLoad(); },
    });

    this.reportService.getRevenue(12).subscribe({
      next: (res) => {
        const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const sorted = [...res.revenue].sort((a, b) => {
          if (a._id.year !== b._id.year) return a._id.year - b._id.year;
          return a._id.month - b._id.month;
        });
        this.revenueRaw.set(sorted.map(r => ({
          label: MONTHS[r._id.month - 1],
          value: Math.round(r.total),
          secondary: r.count,
        })));
        this.setupChartData();
      },
      error: () => { this.setupChartData(); },
    });

    this.reportService.getPopularVehicles().subscribe({
      next: (res) => this.popularVehiclesCache.set(res.vehicles),
    });
  }

  private fallbackLoad() {
    this.reportService.getSummary().subscribe({
      next: (res) => { this.summaryData.set(res); this.setupChartData(); },
      error: () => { this.setupChartData(); },
    });
    this.bookingService.getBookings().subscribe({
      next: (res) => { this.allBookings.set(res.bookings); this.setupChartData(); },
      error: () => { this.setupChartData(); },
    });
    this.vehicleService.getVehicles().subscribe({
      next: (res) => this.allVehicles.set(res.vehicles),
    });
    this.paymentService.getPayments(1, 100).subscribe({
      next: (res) => this.allPayments.set(res.payments),
    });
    this.userService.getUsers().subscribe({
      next: (res) => this.allUsers.set(res.users),
    });
  }

  private dataLoadedCount = 0;
  private setupChartData() {
    this.dataLoadedCount++;
    if (this.dataLoadedCount >= 2) {
      this.loading.set(false);
      setTimeout(() => this.initAllCharts(), 100);
    }
  }

  isEmpty(): boolean {
    const s = this.summaryData();
    return !this.loading() && (!s || (s.totalBookings === 0 && s.totalRevenue === 0 && s.totalVehicles === 0));
  }

  hoverBtn(e: MouseEvent) {
    (e.currentTarget as HTMLElement).style.color = '#1A1A2E';
  }

  unhoverBtn(e: MouseEvent, isActive: boolean) {
    if (!isActive) {
      (e.currentTarget as HTMLElement).style.color = '#6B7280';
    }
  }

  onFilterChange() {
    this.loadAllData();
  }

  setMetric(m: Metric) { this.selectedMetric.set(m); this.rebuildRevenueChart(); }
  setChartType(ct: RevenueChartType) { this.selectedChartType.set(ct); this.rebuildRevenueChart(); }
  setChartPeriod(p: Period) { this.chartPeriod.set(p); this.rebuildRevenueChart(); }
  setDoughnutType(dt: DoughnutType) { this.doughnutType.set(dt); this.rebuildBookingChart(); }

  toggleLegendItem(_idx: number) {}

  private revenueGrowth(): number {
    const data = this.revenueRaw();
    if (data.length < 2) return 18;
    const last = data[data.length - 1]?.value || 0;
    const prev = data[data.length - 2]?.value || 1;
    return Math.round(((last - prev) / prev) * 100);
  }

  private topCategory(): string {
    const fleet = this.fleetData();
    if (fleet.length === 0) return 'SUV';
    return fleet.reduce((max, f) => f.percent > max.percent ? f : max, fleet[0]).label;
  }

  private timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return mins + 'm ago';
    const hours = Math.floor(mins / 60);
    if (hours < 24) return hours + 'h ago';
    const days = Math.floor(hours / 24);
    return days + 'd ago';
  }

  private initAllCharts() {
    this.rebuildRevenueChart();
    this.rebuildBookingChart();
    this.rebuildCustomerChart();
    this.rebuildCategoryChart();
  }

  private rebuildRevenueChart() {
    if (!this.revenueChartRef?.length) return;
    this.destroyChart(0);
    const canvas = this.revenueChartRef.first.nativeElement;
    const data = this.revenueRaw();
    const labels = data.length > 0 ? data.map(d => d.label) : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const values = data.length > 0 ? data.map(d => Math.round(d.value / 1000)) : [8, 12, 9, 15, 11, 14];
    const prev = values.map(v => Math.round(v * (0.8 + Math.random() * 0.15)));

    const type = this.selectedChartType() === 'area' ? 'line' : this.selectedChartType();
    const gradient = canvas.getContext('2d')?.createLinearGradient(0, 0, 0, 300);
    if (gradient) {
      gradient.addColorStop(0, 'rgba(0,93,172,0.3)');
      gradient.addColorStop(1, 'rgba(0,93,172,0)');
    }

    const isProfit = this.selectedMetric() === 'profit';
    const isExpenses = this.selectedMetric() === 'expenses';
    const mainColor = isExpenses ? '#DC2626' : isProfit ? '#7C3AED' : '#005DAC';

    const chart = new Chart(canvas, {
      type: type as any,
      data: {
        labels,
        datasets: [
          {
            label: this.selectedMetric() === 'revenue' ? 'Total Revenue ($k)' : this.selectedMetric() === 'bookings' ? 'Total Bookings' : this.selectedMetric() === 'profit' ? 'Total Profit ($k)' : 'Total Expenses ($k)',
            data: values,
            backgroundColor: this.selectedChartType() === 'area' ? gradient : mainColor,
            borderColor: mainColor,
            borderWidth: 3,
            pointBackgroundColor: mainColor,
            pointRadius: 4,
            pointHoverRadius: 6,
            fill: this.selectedChartType() === 'area',
            tension: 0.4,
            barPercentage: 0.4,
            borderRadius: 6,
          },
          {
            label: 'Previous Period',
            data: prev,
            backgroundColor: 'rgba(147,197,253,0.5)',
            borderColor: '#93C5FD',
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 3,
            pointBackgroundColor: '#93C5FD',
            fill: false,
            tension: 0.4,
            barPercentage: 0.4,
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 600 },
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1B1C1C',
            titleColor: '#FFFFFF',
            bodyColor: '#C1C6D4',
            padding: 12,
            cornerRadius: 8,
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#9CA3AF', font: { size: 11 } },
          },
          y: {
            position: 'left',
            grid: { color: '#F3F4F6' },
            ticks: {
              color: '#9CA3AF',
              font: { size: 11 },
              callback: (v: string | number) => this.selectedMetric() === 'bookings' ? v : '$' + v + 'k',
            },
            border: { display: false },
          },
        },
      },
    });
    this.charts[0] = chart;
  }

  private rebuildBookingChart() {
    if (!this.bookingChartRef?.length) return;
    this.destroyChart(1);
    const canvas = this.bookingChartRef.first.nativeElement;
    const data = this.bookingStatusData();
    const labels = data.map(d => d.label);
    const values = data.map(d => d.value);
    const colors = data.map(d => d.color);

    const chart = new Chart(canvas, {
      type: this.doughnutType(),
      data: {
        labels,
        datasets: [{
          data: values.length > 0 && values.some(v => v > 0) ? values : [1, 1, 1, 1],
          backgroundColor: colors,
          borderColor: '#FFFFFF',
          borderWidth: 3,
          hoverOffset: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: this.doughnutType() === 'doughnut' ? '60%' : undefined,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1B1C1C',
            titleColor: '#FFFFFF',
            bodyColor: '#C1C6D4',
            padding: 12,
            cornerRadius: 8,
          },
        },
      },
    });
    this.charts[1] = chart;
  }

  private rebuildCustomerChart() {
    if (!this.customerChartRef?.length) return;
    this.destroyChart(2);
    const canvas = this.customerChartRef.first.nativeElement;
    const data = this.customerData();

    const chart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: data.map(d => d.label),
        datasets: [{
          data: data.map(d => d.value || 1),
          backgroundColor: data.map(d => d.color),
          borderColor: '#FFFFFF',
          borderWidth: 3,
          hoverOffset: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1B1C1C',
            titleColor: '#FFFFFF',
            bodyColor: '#C1C6D4',
            padding: 10,
            cornerRadius: 8,
          },
        },
      },
    });
    this.charts[2] = chart;
  }

  private rebuildCategoryChart() {
    if (!this.categoryChartRef?.length) return;
    this.destroyChart(3);
    const canvas = this.categoryChartRef.first.nativeElement;
    const vehicles = this.allVehicles();
    const bookings = this.allBookings();
    const typeMap: Record<string, number> = {};
    vehicles.forEach(v => {
      const t = v.type || 'Other';
      if (!typeMap[t]) typeMap[t] = 0;
    });
    bookings.forEach(b => {
      const vid = typeof b.vehicleId === 'object' ? b.vehicleId?._id : b.vehicleId;
      const v = vehicles.find(ve => ve._id === vid);
      const t = v?.type || 'Other';
      typeMap[t] = (typeMap[t] || 0) + 1;
    });
    const entries = Object.entries(typeMap).sort((a, b) => b[1] - a[1]);
    const labels = entries.map(e => e[0]);
    const values = entries.map(e => e[1]);
    const colors = ['#059669', '#005DAC', '#7C3AED', '#E65100', '#DC2626', '#F59E0B'];

    const chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Total Bookings',
          data: values.length > 0 ? values : [1],
          backgroundColor: colors.slice(0, labels.length),
          borderRadius: 8,
          borderSkipped: false,
          barPercentage: 0.5,
        }],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1B1C1C',
            titleColor: '#FFFFFF',
            bodyColor: '#C1C6D4',
            padding: 10,
            cornerRadius: 8,
          },
        },
        scales: {
          x: {
            grid: { color: '#F3F4F6' },
            ticks: { color: '#9CA3AF', font: { size: 11 } },
            border: { display: false },
          },
          y: {
            grid: { display: false },
            ticks: { color: '#1A1A2E', font: { size: 12, weight: 'bold' as any } },
            border: { display: false },
          },
        },
      },
    });
    this.charts[3] = chart;
  }

  private destroyChart(idx: number) {
    if (this.charts[idx]) {
      this.charts[idx].destroy();
      this.charts[idx] = undefined as any;
    }
  }
}
