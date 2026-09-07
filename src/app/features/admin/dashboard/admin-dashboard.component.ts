import { AfterViewInit, Component, ElementRef, PLATFORM_ID, ViewChild, inject, signal, OnInit } from '@angular/core';
import { DatePipe, isPlatformBrowser, SlicePipe, TitleCasePipe } from '@angular/common';
import { Chart } from 'chart.js/auto';
import { ReportService } from '../../../core/services/report.service';
import { BookingService } from '../../../core/services/booking.service';
import { Booking } from '../../../models/booking.model';

@Component({
  selector: 'app-admin-dashboard',
  imports: [DatePipe, SlicePipe, TitleCasePipe],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly reportService = inject(ReportService);
  private readonly bookingService = inject(BookingService);

  readonly today = new Date();

  @ViewChild('revenueChart') revenueChart?: ElementRef<HTMLCanvasElement>;
  private chartInstance?: Chart;

  readonly statCards = signal<any[]>([]);
  readonly vehicles = signal<any[]>([]);
  readonly recentBookings = signal<Booking[]>([]);

  readonly tableHeaders = ['Booking ID', 'Customer', 'Vehicle', 'Date', 'Amount', 'Status'];

  readonly statusStyles: Record<string, string> = {
    confirmed: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    active: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    completed: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
    pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    cancelled: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  };

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.reportService.getDashboard().subscribe({
      next: (res) => {
        const stats = [
          { label: 'Total Vehicles', value: res.summary.totalVehicles.toString(), change: '+0%', positive: true, icon: 'directions_car' },
          { label: 'Total Users', value: res.summary.totalUsers.toString(), change: '+0%', positive: true, icon: 'group' },
          { label: 'Active Bookings', value: res.kpi.activeRentals.toString(), change: '+0%', positive: true, icon: 'event_available' },
          { label: 'Monthly Revenue', value: '$' + res.revenueBreakdown.thisMonth.toLocaleString(), change: '+0%', positive: true, icon: 'credit_card' },
        ];
        this.statCards.set(stats);
      },
      error: () => {}
    });

    this.reportService.getPopularVehicles().subscribe({
      next: (res) => {
        // Map the backend structure to what the template expects
        const mappedVehicles = res.vehicles.slice(0, 4).map(v => ({
          name: v.name,
          type: v.type,
          bookings: v.count,
          trend: 0 // Optional: Backend might not provide trend
        }));
        this.vehicles.set(mappedVehicles);
      },
      error: () => {}
    });

    this.bookingService.getBookings(undefined, 1, 5).subscribe({
      next: (res) => {
        this.recentBookings.set(res.bookings);
      },
      error: () => {}
    });
    
    if (isPlatformBrowser(this.platformId)) {
        this.reportService.getRevenue(6).subscribe({
          next: (res) => {
            this.updateChart(res.revenue);
          },
          error: () => {}
        });
    }
  }

  updateChart(revenueData: any[]): void {
    if (!this.revenueChart || !isPlatformBrowser(this.platformId)) return;

    // The backend returns an array of { _id: { year, month }, total, count }
    // We should sort it chronologically just in case, but assume it's sorted or sort it:
    const sortedData = [...revenueData].sort((a, b) => {
        if (a._id.year !== b._id.year) return a._id.year - b._id.year;
        return a._id.month - b._id.month;
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const labels = sortedData.map(d => monthNames[d._id.month - 1]);
    const data = sortedData.map(d => d.total);

    const canvas = this.revenueChart.nativeElement;
    const ctx = canvas.getContext('2d');
    
    let fill: string | CanvasGradient = 'rgba(45,90,61,0.12)';
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, 0, 220);
      gradient.addColorStop(0, 'rgba(45,90,61,0.18)');
      gradient.addColorStop(1, 'rgba(45,90,61,0.01)');
      fill = gradient;
    }

    if (this.chartInstance) {
        this.chartInstance.destroy();
    }

    this.chartInstance = new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Revenue',
            data: data,
            borderColor: '#2d5a3d',
            borderWidth: 2.5,
            backgroundColor: fill,
            fill: true,
            tension: 0.4,
            pointRadius: 3.5,
            pointBackgroundColor: '#2d5a3d',
            pointHoverRadius: 5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (c) => '$' + (Number(c.parsed.y) / 1000).toFixed(1) + 'k',
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: { color: '#94a3b8', font: { size: 11 } },
          },
          y: {
            grid: { color: '#f1f5f9' },
            border: { display: false },
            ticks: {
              color: '#94a3b8',
              font: { size: 11 },
              callback: (v) => '$' + (Number(v) / 1000).toFixed(0) + 'k',
            },
          },
        },
      },
    });
  }
  
  ngAfterViewInit(): void {
      // The chart will be initialized after the data is loaded in updateChart.
  }

  // Helpers for template formatting
  getBookingCustomer(booking: Booking): string {
    const u = booking.userId;
    return typeof u === 'object' && u !== null ? u.name : 'Walk-in';
  }

  getBookingVehicle(booking: Booking): string {
    const v = booking.vehicleId;
    return typeof v === 'object' && v !== null ? v.name : 'Unknown';
  }
}
