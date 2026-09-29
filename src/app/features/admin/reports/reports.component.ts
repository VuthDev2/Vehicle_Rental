import { Component, inject, signal, computed, ViewChildren, QueryList, ElementRef, AfterViewInit, OnInit, OnDestroy, PLATFORM_ID, HostListener } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart } from 'chart.js/auto';
import { ReportService, OwnerSummary, FleetVehicle, BookingAnalytics, CustomerInsights, VehicleRevenue, CategoryRevenue, BookingDetail, MonthlyRevenue, ExpenseItem, ExpenseSummary } from '../../../core/services/report.service';

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly';
type Metric = 'revenue' | 'bookings' | 'profit' | 'expenses';
type RevenueChartType = 'line' | 'bar' | 'area';
type DrawerType = 'category' | 'revenue-monthly' | 'booking-status' | null;

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
})
export class ReportsComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly reportService = inject(ReportService);
  private readonly platformId = inject(PLATFORM_ID);
  readonly Math = Math;

  @ViewChildren('mainChart')      mainChartRef!:      QueryList<ElementRef<HTMLCanvasElement>>;
  @ViewChildren('expenseChart')   expenseChartRef!:   QueryList<ElementRef<HTMLCanvasElement>>;
  @ViewChildren('categoryChart')  categoryChartRef!:  QueryList<ElementRef<HTMLCanvasElement>>;
  @ViewChildren('peakDaysChart')  peakDaysChartRef!:  QueryList<ElementRef<HTMLCanvasElement>>;

  // ─── UI state ─────────────────────────────────────────────────────────────
  readonly loading       = signal(true);
  readonly dateRange     = signal('30');
  
  readonly selectedMetric = signal<Metric>('revenue');
  readonly selectedChartType = signal<RevenueChartType>('line');
  readonly chartPeriod = signal<Period>('monthly');

  readonly metrics: Metric[] = ['revenue', 'bookings', 'profit', 'expenses'];
  readonly chartTypes: RevenueChartType[] = ['line', 'bar', 'area'];
  readonly periods: Period[] = ['daily', 'weekly', 'monthly'];

  // ─── Data signals ──────────────────────────────────────────────────────────
  readonly ownerSummary      = signal<OwnerSummary | null>(null);
  readonly fleetVehicles     = signal<FleetVehicle[]>([]);
  readonly bookingAnalytics  = signal<BookingAnalytics | null>(null);
  readonly monthlyRevenue    = signal<MonthlyRevenue[]>([]);
  readonly categoryRevenue   = signal<CategoryRevenue[]>([]);
  readonly categoryGrandTotal = signal(0);
  readonly topVehicles       = signal<VehicleRevenue[]>([]);
  readonly customerInsights  = signal<CustomerInsights | null>(null);

  // ─── Expense Ledger ────────────────────────────────────────────────────────
  readonly expenseEntries    = signal<ExpenseItem[]>([]);
  readonly expenseSummary    = signal<ExpenseSummary[]>([]);
  readonly expenseGrandTotal = signal(0);
  readonly expenseTotal      = signal(0);
  readonly expensePage       = signal(1);
  readonly expensePages      = signal(1);
  readonly expenseCatFilter  = signal('all');
  readonly addingExpense     = signal(false);
  readonly showAddForm       = signal(false);
  readonly deletingId        = signal('');

  readonly EXPENSE_CATEGORIES = [
    { label: 'Vehicle Acquisition', color: '#3B82F6' },
    { label: 'Repairs & Parts',     color: '#EF4444' },
    { label: 'Maintenance',         color: '#F59E0B' },
    { label: 'Insurance',           color: '#8B5CF6' },
    { label: 'Fuel / Charging',     color: '#06B6D4' },
    { label: 'Cleaning',            color: '#10B981' },
    { label: 'Marketing',           color: '#EC4899' },
    { label: 'Staff Salaries',      color: '#F97316' },
    { label: 'Rent / Utilities',    color: '#14B8A6' },
    { label: 'Other',               color: '#6B7280' },
  ];

  newExpense = {
    category: 'Repairs & Parts',
    amount: 0,
    description: '',
    vehicleId: '',
    date: new Date().toISOString().split('T')[0],
  };

  // ─── Detail drawer ────────────────────────────────────────────────────────
  readonly drawerOpen          = signal(false);
  readonly drawerType          = signal<DrawerType>(null);
  readonly drawerTitle         = signal('');
  readonly drawerSubtitle      = signal('');
  readonly drawerLoading       = signal(false);
  readonly drawerBookings      = signal<BookingDetail[]>([]);
  readonly drawerMonthly       = signal<MonthlyRevenue[]>([]);
  readonly drawerTotal         = signal(0);
  readonly drawerPages         = signal(1);
  readonly drawerPage          = signal(1);
  readonly drawerStatusFilter  = signal('completed');

  @HostListener('document:keydown.escape') onEsc() { this.closeDrawer(); }

  private charts: Chart[] = [];

  // ─── Computed ─────────────────────────────────────────────────────────────

  readonly topExpenseCategory = computed(() => {
    const data = this.expenseSummary();
    return data.length > 0 ? data[0] : null;
  });

  readonly expenseRatio = computed(() => {
    const rev = this.ownerSummary()?.revenueThisYear || 1;
    return Math.round((this.expenseGrandTotal() / rev) * 100);
  });

  readonly realNetProfit = computed(() => {
    return (this.ownerSummary()?.revenueThisYear || 0) - this.expenseGrandTotal();
  });

  readonly avgRevenuePerBooking = computed(() => {
    const s = this.ownerSummary();
    if (!s || s.totalBookings === 0) return 0;
    return Math.round(s.revenueThisYear / s.totalBookings);
  });

  readonly quickInsights = computed(() => {
    const s = this.ownerSummary();
    const ba = this.bookingAnalytics();
    const cats = this.categoryRevenue();
    const ci = this.customerInsights();
    const v = this.fleetVehicles();
    const insights: string[] = [];
    if (s) { insights.push(`Revenue ${s.revenueGrowth >= 0 ? 'increased' : 'decreased'} by ${Math.abs(s.revenueGrowth)}% compared to last month.`); }
    if (cats.length > 0) { insights.push(`${cats[0].category}s generated the highest revenue at $${cats[0].totalRevenue.toLocaleString()}.`); }
    if (ba) { insights.push(`Average rental duration is ${ba.avgDuration} days per booking.`); insights.push(`Completion rate is ${ba.completionRate}%, cancellation rate is ${ba.cancellationRate}%.`); }
    if (ci) { insights.push(`${ci.repeatRate}% of customers are repeat renters. Average rating is ${ci.avgRating}/5.`); }
    const idleCount = v.filter(veh => veh.utilization === 0).length;
    if (idleCount > 0) { insights.push(`${idleCount} vehicles have had zero bookings — consider promotions or retiring them.`); }
    if (s) { insights.push(`Fleet utilization is at ${s.occupancyRate}% with ${s.rentedVehicles} vehicles currently rented.`); }
    return insights.length > 0 ? insights : ['Loading insights...'];
  });

  readonly fleetTableData = computed(() => this.fleetVehicles().map(v => ({ ...v, expenses: 0, netProfit: v.revenue })));

  // ─── Init ─────────────────────────────────────────────────────────────────
  ngOnInit() { this.loadAllData(); }
  ngAfterViewInit() { this.charts = []; }
  ngOnDestroy() { this.charts.forEach(c => { try { c.destroy(); } catch {} }); }

  private loadAllData() {
    this.loading.set(true);
    let loaded = 0;
    const total = 7;
    const done = () => { if (++loaded >= total) { this.loading.set(false); setTimeout(() => this.initCharts(), 200); } };

    const handle = { next: (v: any, setFn: any) => { setFn(v); done(); }, error: () => done(), complete: () => done() };

    this.reportService.getOwnerSummary().subscribe({ next: v => { this.ownerSummary.set(v); done(); }, error: () => done() });
    this.reportService.getFleetPerformance().subscribe({ next: v => { this.fleetVehicles.set(v.vehicles); done(); }, error: () => done() });
    this.reportService.getBookingAnalytics().subscribe({ next: v => { this.bookingAnalytics.set(v); done(); }, error: () => done() });
    this.reportService.getRevenueMonthly(12).subscribe({ next: v => { this.monthlyRevenue.set(v.months); done(); }, error: () => done() });
    this.reportService.getCategoryRevenue().subscribe({ next: v => { this.categoryRevenue.set(v.categories); this.categoryGrandTotal.set(v.grandTotal); done(); }, error: () => done() });
    this.reportService.getRevenueByVehicle().subscribe({ next: v => { this.topVehicles.set(v.vehicles.slice(0, 10)); done(); }, error: () => done() });
    this.reportService.getCustomerInsights().subscribe({ next: v => { this.customerInsights.set(v); done(); }, error: () => done() });
    this.loadExpenses();
  }

  loadExpenses() {
    this.reportService.getExpenses(this.expensePage(), 50, this.expenseCatFilter()).subscribe({
      next: r => {
        this.expenseEntries.set(r.expenses);
        this.expenseSummary.set(r.summary);
        this.expenseGrandTotal.set(r.grandTotal);
        this.expenseTotal.set(r.total);
        this.expensePages.set(r.pages);
        setTimeout(() => this.rebuildExpenseChart(), 100);
      },
      error: () => {},
    });
  }

  onRefresh() { this.charts.forEach(c => { try { c.destroy(); } catch {} }); this.charts = []; this.loadAllData(); }

  // ─── Formatters ───────────────────────────────────────────────────────────
  fmt(v: number | undefined | null): string {
    if (v == null || isNaN(v)) return '$0';
    return '$' + Number(v).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }
  fmtDate(d: string): string { return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'; }

  getStatusStyle(status: string) {
    const m: Record<string, { bg: string; color: string; label: string }> = {
      available: { bg: '#E7F5ED', color: '#059669', label: 'Available' }, rented: { bg: '#E5EEFF', color: '#005DAC', label: 'Rented' },
      maintenance: { bg: '#FFF3E0', color: '#E65100', label: 'Maintenance' }, completed: { bg: '#E7F5ED', color: '#059669', label: 'Completed' },
      confirmed: { bg: '#E5EEFF', color: '#005DAC', label: 'Ongoing' }, pending: { bg: '#FFF3E0', color: '#E65100', label: 'Awaiting' },
      cancelled: { bg: '#FFEAEA', color: '#DC2626', label: 'Cancelled' },
    };
    return m[status] ?? { bg: '#F9FAFB', color: '#6B7280', label: status };
  }

  getCatMeta(cat: string) {
    const m: Record<string, { icon: string; color: string; bg: string }> = {
      'Car': { icon: 'directions_car', color: '#005DAC', bg: '#E5EEFF' }, 'Sedan': { icon: 'airport_shuttle', color: '#0891B2', bg: '#E0F7FA' },
      'SUV': { icon: 'rv_hookup', color: '#059669', bg: '#E7F5ED' }, 'Van': { icon: 'airport_shuttle', color: '#7C3AED', bg: '#F3F0FF' },
      'Truck': { icon: 'local_shipping', color: '#E65100', bg: '#FFF3E0' }, 'Motorcycle': { icon: 'two_wheeler', color: '#DC2626', bg: '#FFEAEA' },
      'Scooter': { icon: 'electric_scooter', color: '#D97706', bg: '#FFFBEB' },
    };
    return m[cat] ?? { icon: 'commute', color: '#6B7280', bg: '#F9FAFB' };
  }

  getExpenseCatColor(category: string): string {
    return this.EXPENSE_CATEGORIES.find(c => c.label === category)?.color || '#6B7280';
  }

  // ─── Expense CRUD ─────────────────────────────────────────────────────────

  toggleAddForm() { this.showAddForm.update(v => !v); }

  submitExpense() {
    if (!this.newExpense.amount || this.newExpense.amount <= 0) return;
    this.addingExpense.set(true);
    this.reportService.addExpense({
      category: this.newExpense.category,
      amount: this.newExpense.amount,
      color: this.getExpenseCatColor(this.newExpense.category),
      description: this.newExpense.description,
      vehicleId: this.newExpense.vehicleId || undefined,
      date: this.newExpense.date,
    }).subscribe({
      next: () => {
        this.addingExpense.set(false);
        this.showAddForm.set(false);
        this.newExpense = { category: 'Repairs & Parts', amount: 0, description: '', vehicleId: '', date: new Date().toISOString().split('T')[0] };
        this.loadExpenses();
      },
      error: () => this.addingExpense.set(false),
    });
  }

  deleteExpenseEntry(id: string) {
    this.deletingId.set(id);
    this.reportService.deleteExpense(id).subscribe({
      next: () => { this.deletingId.set(''); this.loadExpenses(); },
      error: () => this.deletingId.set(''),
    });
  }

  filterExpenseCat(cat: string) {
    this.expenseCatFilter.set(cat);
    this.expensePage.set(1);
    this.loadExpenses();
  }

  expensePagePrev() { if (this.expensePage() > 1) { this.expensePage.update(p => p - 1); this.loadExpenses(); } }
  expensePageNext() { if (this.expensePage() < this.expensePages()) { this.expensePage.update(p => p + 1); this.loadExpenses(); } }

  // ─── Drawer ───────────────────────────────────────────────────────────────

  openMonthlyDrawer() {
    this.drawerType.set('revenue-monthly');
    this.drawerTitle.set('Monthly Revenue Report');
    this.drawerSubtitle.set('Detailed month-by-month breakdown');
    this.drawerOpen.set(true);
    this.drawerLoading.set(true);
    this.reportService.getRevenueMonthly(12).subscribe({ next: r => { this.drawerMonthly.set(r.months); this.drawerLoading.set(false); }, error: () => this.drawerLoading.set(false) });
  }

  openStatusDrawer(status: string, label: string) {
    this.drawerType.set('booking-status');
    this.drawerTitle.set(label + ' Bookings');
    this.drawerSubtitle.set('Detailed list of ' + label.toLowerCase() + ' bookings');
    this.drawerStatusFilter.set(status);
    this.drawerPage.set(1);
    this.drawerOpen.set(true);
    this.loadDrawerStatus();
  }

  closeDrawer() { this.drawerOpen.set(false); setTimeout(() => this.drawerType.set(null), 300); }
  drawerNext() { if (this.drawerPage() < this.drawerPages()) { this.drawerPage.update(p => p + 1); this.loadDrawerStatus(); } }
  drawerPrev() { if (this.drawerPage() > 1) { this.drawerPage.update(p => p - 1); this.loadDrawerStatus(); } }

  private loadDrawerStatus() {
    this.drawerLoading.set(true);
    this.reportService.getBookingStatusDetails(this.drawerStatusFilter(), this.drawerPage()).subscribe({
      next: r => { this.drawerBookings.set(r.bookings); this.drawerTotal.set(r.total); this.drawerPages.set(r.pages); this.drawerLoading.set(false); },
      error: () => this.drawerLoading.set(false),
    });
  }

  // ─── Export ────────────────────────────────────────────────────────────────

  exportCSV() {
    const s = this.ownerSummary();
    const ba = this.bookingAnalytics();
    const ci = this.customerInsights();
    const lines: string[] = [];
    lines.push('CAMBO RENT — FINANCIAL REPORT');
    lines.push(`Generated,${new Date().toLocaleString()}`);
    lines.push('');
    lines.push('=== FINANCIAL SUMMARY ===');
    lines.push('Metric,Value');
    if (s) {
      lines.push(`Revenue This Month,$${s.revenueThisMonth}`);
      lines.push(`Revenue This Year,$${s.revenueThisYear}`);
      lines.push(`Total Expenses,$${this.expenseGrandTotal()}`);
      lines.push(`Net Profit,$${this.realNetProfit()}`);
      lines.push(`Revenue Growth,${s.revenueGrowth}%`);
      lines.push(`Fleet Utilization,${s.occupancyRate}%`);
      lines.push(`Total Bookings,${s.totalBookings}`);
    }
    lines.push('');
    lines.push('=== EXPENSE ENTRIES ===');
    lines.push('Date,Category,Amount,Description,Vehicle');
    this.expenseEntries().forEach(e => {
      const vName = e.vehicleId?.name || '—';
      lines.push(`${this.fmtDate(e.createdAt || '')},${e.category},$${e.amount},${e.description || ''},${vName}`);
    });
    lines.push('');
    lines.push('=== EXPENSE SUMMARY BY CATEGORY ===');
    lines.push('Category,Total,Entries');
    this.expenseSummary().forEach(s => lines.push(`${s.category},$${s.total},${s.count}`));
    lines.push(`Grand Total,$${this.expenseGrandTotal()}`);
    lines.push('');
    lines.push('=== REVENUE BY VEHICLE TYPE ===');
    lines.push('Type,Revenue,Bookings,Vehicles,Percentage');
    this.categoryRevenue().forEach(c => lines.push(`${c.category},$${c.totalRevenue},${c.totalBookings},${c.vehicleCount},${c.percentage}%`));
    lines.push('');
    lines.push('=== TOP EARNING VEHICLES ===');
    lines.push('Vehicle,Type,Revenue,Trips,Avg Per Trip');
    this.topVehicles().forEach(v => lines.push(`${v.name},${v.type},$${v.revenue},${v.bookings},$${v.avgPerBooking}`));
    lines.push('');
    lines.push('=== FLEET PERFORMANCE ===');
    lines.push('Vehicle,Brand,Type,Revenue,Bookings,Utilization,Status');
    this.fleetVehicles().forEach(v => lines.push(`${v.name},${v.brand},${v.type},$${v.revenue},${v.totalBookings},${v.utilization}%,${v.status}`));
    if (ci) {
      lines.push('');
      lines.push('=== CUSTOMER INSIGHTS ===');
      lines.push(`Total Customers,${ci.totalCustomers}`);
      lines.push(`Repeat Rate,${ci.repeatRate}%`);
      lines.push(`Average Rating,${ci.avgRating}`);
      lines.push('');
      lines.push('Top Customers');
      lines.push('Name,Email,Spending,Bookings');
      ci.topCustomers.forEach(c => lines.push(`${c.name},${c.email},$${c.spending},${c.bookings}`));
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cambo_rent_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  downloadPDF() { window.print(); }

  // ─── Charts ───────────────────────────────────────────────────────────────
  private initCharts() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.rebuildMainChart();
    this.rebuildExpenseChart();
    this.rebuildCategoryChart();
    this.rebuildPeakDaysChart();
  }

  setMetric(m: Metric) { this.selectedMetric.set(m); this.rebuildMainChart(); }
  setChartType(t: RevenueChartType) { this.selectedChartType.set(t); this.rebuildMainChart(); }
  setChartPeriod(p: Period) { this.chartPeriod.set(p); this.rebuildMainChart(); }

  private rebuildMainChart() {
    if (!this.mainChartRef?.length) return;
    this.destroyChart(0);
    const canvas = this.mainChartRef.first.nativeElement;
    const monthly = this.monthlyRevenue();
    const labels = monthly.length > 0 ? monthly.map(m => m.label) : ['Jan','Feb','Mar','Apr','May','Jun'];
    let values: number[] = [], mainColor = '#005DAC', label = '', isCurrency = false;

    if (this.selectedMetric() === 'revenue') {
      values = monthly.length > 0 ? monthly.map(m => m.revenue || 0) : [8000,12000,9000,15000,11000,14000];
      mainColor = '#059669'; label = 'Revenue ($)'; isCurrency = true;
    } else if (this.selectedMetric() === 'profit') {
      const monthlyExp = Math.round(this.expenseGrandTotal() / 12);
      values = monthly.length > 0 ? monthly.map(m => (m.revenue || 0) - monthlyExp) : [5000,8000,6000,10000,7000,9000];
      mainColor = '#7C3AED'; label = 'Net Profit ($)'; isCurrency = true;
    } else if (this.selectedMetric() === 'expenses') {
      const perMonth = Math.round(this.expenseGrandTotal() / 12);
      values = monthly.length > 0 ? monthly.map(() => perMonth) : [3000,4000,3000,5000,4000,5000];
      mainColor = '#DC2626'; label = 'Total Expenses ($)'; isCurrency = true;
    } else {
      values = monthly.length > 0 ? monthly.map(m => m.bookings || 0) : [20, 25, 22, 30, 28, 35];
      mainColor = '#005DAC'; label = 'Bookings'; isCurrency = false;
    }
    const prev = values.map(v => Math.round(v * (0.8 + Math.random() * 0.4)));
    const type = this.selectedChartType() === 'area' ? 'line' : this.selectedChartType();
    let bg: any = mainColor;
    if (this.selectedChartType() === 'area') {
      const r = parseInt(mainColor.slice(1, 3), 16), g = parseInt(mainColor.slice(3, 5), 16), b = parseInt(mainColor.slice(5, 7), 16);
      bg = `rgba(${r},${g},${b},0.15)`;
    }
    this.charts[0] = new Chart(canvas, {
      type: type as any,
      data: { labels, datasets: [
        { label, data: values, backgroundColor: bg, borderColor: mainColor, borderWidth: 3, pointBackgroundColor: mainColor, pointRadius: 4, fill: this.selectedChartType() === 'area', tension: 0.4, barPercentage: 0.5, borderRadius: 6 },
        { label: 'Previous Period', data: prev, backgroundColor: 'rgba(156,163,175,0.2)', borderColor: '#9CA3AF', borderDash: [5,5], borderWidth: 2, pointRadius: 0, fill: false, tension: 0.4 },
      ] },
      options: {
        responsive: true, maintainAspectRatio: false, animation: { duration: 600 },
        interaction: { mode: 'index', intersect: false },
        plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1B1C1C', titleColor: '#fff', bodyColor: '#C1C6D4', padding: 12, cornerRadius: 8, callbacks: { label: (c: any) => isCurrency ? '$' + Number(c.raw).toLocaleString() : c.raw + '' } } },
        scales: { x: { grid: { display: false }, ticks: { color: '#9CA3AF', font: { size: 11 } } }, y: { grid: { color: '#F3F4F6' }, ticks: { color: '#9CA3AF', font: { size: 11 }, callback: (v: any) => isCurrency ? '$' + Number(v).toLocaleString() : v }, border: { display: false } } },
      },
    });
  }

  private rebuildExpenseChart() {
    if (!this.expenseChartRef?.length) return;
    this.destroyChart(1);
    const canvas = this.expenseChartRef.first.nativeElement;
    const data = this.expenseSummary().filter(e => e.total > 0);
    if (data.length === 0) return;
    this.charts[1] = new Chart(canvas, {
      type: 'doughnut',
      data: { labels: data.map(d => d.category), datasets: [{ data: data.map(d => d.total), backgroundColor: data.map(d => d.color || '#6B7280'), borderColor: '#fff', borderWidth: 2, hoverOffset: 4 }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1B1C1C', padding: 12, cornerRadius: 8, callbacks: { label: (c: any) => '$' + (c.raw as number).toLocaleString() } } } },
    });
  }

  private rebuildCategoryChart() {
    if (!this.categoryChartRef?.length) return;
    this.destroyChart(2);
    const canvas = this.categoryChartRef.first.nativeElement;
    const cats = this.categoryRevenue();
    if (cats.length === 0) return;
    const colors = ['#3B82F6', '#059669', '#F59E0B', '#DC2626', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316', '#14B8A6', '#6B7280'];
    this.charts[2] = new Chart(canvas, {
      type: 'bar',
      data: { labels: cats.map(c => c.category), datasets: [{ label: 'Revenue', data: cats.map(c => c.totalRevenue), backgroundColor: cats.map((_, i) => colors[i % colors.length]), borderRadius: 6, barPercentage: 0.6 }] },
      options: {
        responsive: true, maintainAspectRatio: false, indexAxis: 'y',
        plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1B1C1C', padding: 12, cornerRadius: 8, callbacks: { label: (c: any) => '$' + Number(c.raw).toLocaleString() } } },
        scales: { x: { grid: { color: '#F3F4F6' }, ticks: { color: '#9CA3AF', font: { size: 11 }, callback: (v: any) => '$' + Number(v).toLocaleString() }, border: { display: false } }, y: { grid: { display: false }, ticks: { color: '#334155', font: { size: 12, weight: 'bold' as any } } } },
      },
    });
  }

  private rebuildPeakDaysChart() {
    if (!this.peakDaysChartRef?.length) return;
    this.destroyChart(3);
    const canvas = this.peakDaysChartRef.first.nativeElement;
    const ba = this.bookingAnalytics();
    if (!ba || !ba.peakDays) return;
    this.charts[3] = new Chart(canvas, {
      type: 'bar',
      data: { labels: ba.peakDays.map(d => d.day), datasets: [{ label: 'Bookings', data: ba.peakDays.map(d => d.count), backgroundColor: '#818CF8', borderRadius: 6, barPercentage: 0.5 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1B1C1C', padding: 12, cornerRadius: 8 } }, scales: { x: { grid: { display: false }, ticks: { color: '#9CA3AF', font: { size: 11 } } }, y: { grid: { color: '#F3F4F6' }, ticks: { color: '#9CA3AF', font: { size: 11 } }, border: { display: false } } } },
    });
  }

  private destroyChart(idx: number) { if (this.charts[idx]) { try { this.charts[idx].destroy(); } catch {} this.charts[idx] = undefined as any; } }
}
