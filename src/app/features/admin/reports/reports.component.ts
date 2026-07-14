import { Component, inject, signal, ViewChild, ElementRef, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { ReportService } from '../../../core/services/report.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  template: `
    <div style="background: #FBF9F9; min-height: 100%; padding: 24px;">

      <!-- ==================== HEADER ==================== -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 style="font-size: 28px; font-weight: 700; color: #1B1C1C; margin: 0 0 2px;">Reports</h1>
          <p style="font-size: 15px; color: #717783; margin: 0;">Analytics & Insights</p>
        </div>
        <select style="border: 1px solid #E9E8E7; border-radius: 8px; background: #FFFFFF; padding: 10px 32px 10px 16px; font-size: 14px; color: #1B1C1C; cursor: pointer; outline: none; min-width: 140px;">
          <option>Last 6 Months</option>
          <option>Last 12 Months</option>
          <option>Year to Date</option>
          <option>All Time</option>
        </select>
      </div>

      <!-- ==================== LOADING ==================== -->
      @if (loading()) {
        <div class="grid grid-cols-4 gap-4 mb-8">
          @for (i of [1,2,3,4]; track i) {
            <div style="background: #FFFFFF; border: 1px solid #E9E8E7; border-radius: 12px; padding: 20px;">
              <div class="skeleton" style="height: 14px; width: 60%; margin-bottom: 10px;"></div>
              <div class="skeleton" style="height: 28px; width: 40%;"></div>
            </div>
          }
        </div>
        <div style="background: #FFFFFF; border: 1px solid #E9E8E7; border-radius: 12px; padding: 32px;">
          <div class="skeleton" style="height: 24px; width: 30%; margin-bottom: 24px;"></div>
          <div class="skeleton" style="height: 200px; width: 100%;"></div>
        </div>
      } @else {
        <!-- ==================== STAT CARDS ==================== -->
        <div class="grid grid-cols-4 gap-4 mb-8">
          @for (stat of statCards; track stat.label) {
            <div style="background: #FFFFFF; border: 1px solid #E9E8E7; border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 16px;">
              <div style="width: 48px; height: 48px; border-radius: 12px; background: {{ stat.bg }}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <span class="material-symbols-outlined" style="font-size: 24px; color: {{ stat.color }};">{{ stat.icon }}</span>
              </div>
              <div>
                <p style="font-size: 13px; color: #717783; margin: 0; font-weight: 500;">{{ stat.label }}</p>
                <p style="font-size: 28px; font-weight: 700; color: #1B1C1C; margin: 0; line-height: 1.2;">{{ stat.value }}</p>
              </div>
            </div>
          }
        </div>

        <!-- ==================== REVENUE CHART ==================== -->
        <div style="background: #FFFFFF; border: 1px solid #E9E8E7; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 style="font-size: 18px; font-weight: 700; color: #1B1C1C; margin: 0;">Revenue Overview</h2>
              <p style="font-size: 13px; color: #717783; margin: 2px 0 0;">Monthly revenue trend</p>
            </div>
            <div style="display: flex; align-items: center; gap: 16px;">
              <span style="display: flex; align-items: center; gap: 6px; font-size: 13px; color: #717783;">
                <span style="width: 10px; height: 10px; border-radius: 2px; background: #3980F4; display: inline-block;"></span>
                Revenue
              </span>
              <span style="display: flex; align-items: center; gap: 6px; font-size: 13px; color: #717783;">
                <span style="width: 10px; height: 10px; border-radius: 2px; background: #E5EEFF; display: inline-block;"></span>
                Bookings
              </span>
            </div>
          </div>
          <div style="position: relative; height: 280px;">
            <canvas #revenueChart></canvas>
          </div>
        </div>

        <!-- ==================== POPULAR VEHICLES ==================== -->
        <div style="background: #FFFFFF; border: 1px solid #E9E8E7; border-radius: 12px; overflow: hidden;">
          <div style="padding: 20px 24px; border-bottom: 1px solid #F0EFEF;">
            <h2 style="font-size: 18px; font-weight: 700; color: #1B1C1C; margin: 0;">Popular Vehicles</h2>
            <p style="font-size: 13px; color: #717783; margin: 2px 0 0;">Most booked vehicles this period</p>
          </div>
          @if (popularVehicles().length === 0) {
            <div style="text-align: center; padding: 40px 20px;">
              <p style="font-size: 14px; color: #717783; margin: 0;">No vehicle data available yet.</p>
            </div>
          } @else {
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #F5F3F3;">
                  <th style="padding: 12px 24px; text-align: left; font-size: 12px; font-weight: 700; color: #49454F; text-transform: uppercase; letter-spacing: 0.5px;">#</th>
                  <th style="padding: 12px 24px; text-align: left; font-size: 12px; font-weight: 700; color: #49454F; text-transform: uppercase; letter-spacing: 0.5px;">Vehicle</th>
                  <th style="padding: 12px 24px; text-align: left; font-size: 12px; font-weight: 700; color: #49454F; text-transform: uppercase; letter-spacing: 0.5px;">Type</th>
                  <th style="padding: 12px 24px; text-align: center; font-size: 12px; font-weight: 700; color: #49454F; text-transform: uppercase; letter-spacing: 0.5px;">Bookings</th>
                  <th style="padding: 12px 24px; text-align: right; font-size: 12px; font-weight: 700; color: #49454F; text-transform: uppercase; letter-spacing: 0.5px;">Revenue</th>
                </tr>
              </thead>
              <tbody>
                @for (v of popularVehicles(); track v._id; let i = $index) {
                  <tr style="border-bottom: 1px solid #F0EFEF;">
                    <td style="padding: 16px 24px;">
                      <span style="width: 28px; height: 28px; border-radius: 8px; background: {{ i < 3 ? '#E5EEFF' : '#F5F3F3' }}; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: {{ i < 3 ? '#005DAC' : '#717783' }};">{{ i + 1 }}</span>
                    </td>
                    <td style="padding: 16px 24px;">
                      <div class="flex items-center gap-3">
                        <div style="width: 44px; height: 44px; border-radius: 8px; overflow: hidden; flex-shrink: 0; background: #E5EEFF;">
                          @if (v.images?.[0]) {
                            <img [src]="v.images[0]" style="width: 100%; height: 100%; object-fit: cover;" />
                          } @else {
                            <span class="material-symbols-outlined" style="font-size: 22px; color: #3980F4; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">directions_car</span>
                          }
                        </div>
                        <div>
                          <p style="font-size: 14px; font-weight: 600; color: #1B1C1C; margin: 0;">{{ v.name }}</p>
                          <p style="font-size: 12px; color: #717783; margin: 0;">{{ v.brand }}</p>
                        </div>
                      </div>
                    </td>
                    <td style="padding: 16px 24px;">
                      <span style="font-size: 13px; color: #414752;">{{ v.type || '—' }}</span>
                    </td>
                    <td style="padding: 16px 24px; text-align: center;">
                      <span style="font-size: 16px; font-weight: 700; color: #1B1C1C;">{{ v.count }}</span>
                    </td>
                    <td style="padding: 16px 24px; text-align: right;">
                      <span style="font-size: 16px; font-weight: 700; color: #005DAC;">\${{ v.revenue.toLocaleString() }}</span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }
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
export class ReportsComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly reportService = inject(ReportService);

  readonly loading = signal(true);
  readonly summary = signal<{ totalVehicles: number; totalUsers: number; totalBookings: number; totalRevenue: number } | null>(null);
  readonly popularVehicles = signal<{ _id: string; name: string; brand: string; type: string; images: string[]; count: number; revenue: number }[]>([]);

  private revenueData: { labels: string[]; revenue: number[]; bookings: number[] } = { labels: [], revenue: [], bookings: [] };
  private chart: Chart | null = null;

  @ViewChild('revenueChart') revenueChart?: ElementRef<HTMLCanvasElement>;

  readonly statCards = [
    { label: 'Total Vehicles', icon: 'directions_car', bg: '#D4E3FF', color: '#005DAC', get value() { return this._value; }, _value: '0' },
    { label: 'Total Users', icon: 'group', bg: '#CFE6F2', color: '#00668C', get value() { return this._value; }, _value: '0' },
    { label: 'Total Bookings', icon: 'receipt_long', bg: '#FFDBC7', color: '#8A6D00', get value() { return this._value; }, _value: '0' },
    { label: 'Total Revenue', icon: 'payments', bg: '#E7F5ED', color: '#1E7B4C', get value() { return this._value; }, _value: '0' },
  ];

  ngOnInit() { this.loadData(); }

  ngAfterViewInit() {
    if (this.revenueData.labels.length > 0) {
      this.initChart();
    }
  }

  ngOnDestroy() {
    this.chart?.destroy();
  }

  private loadData() {
    this.loading.set(true);

    this.reportService.getSummary().subscribe({
      next: (res) => {
        this.statCards[0]._value = res.totalVehicles.toLocaleString();
        this.statCards[1]._value = res.totalUsers.toLocaleString();
        this.statCards[2]._value = res.totalBookings.toLocaleString();
        this.statCards[3]._value = '$' + res.totalRevenue.toLocaleString();
        this.summary.set(res);
      },
      error: () => {
        this.statCards[0]._value = '—';
        this.statCards[1]._value = '—';
        this.statCards[2]._value = '—';
        this.statCards[3]._value = '—';
      },
    });

    this.reportService.getRevenue(6).subscribe({
      next: (res) => {
        const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const sorted = [...res.revenue].sort((a, b) => {
          if (a._id.year !== b._id.year) return a._id.year - b._id.year;
          return a._id.month - b._id.month;
        });
        this.revenueData = {
          labels: sorted.map(r => MONTHS[r._id.month - 1]),
          revenue: sorted.map(r => Math.round(r.total / 1000)),
          bookings: sorted.map(r => r.count),
        };
        if (this.revenueChart) this.initChart();
      },
      error: () => {},
    });

    this.reportService.getPopularVehicles().subscribe({
      next: (res) => {
        this.popularVehicles.set(res.vehicles);
      },
      error: () => {},
      complete: () => this.loading.set(false),
    });
  }

  private initChart() {
    this.chart?.destroy();
    if (!this.revenueChart) return;
    this.chart = new Chart(this.revenueChart.nativeElement, {
      type: 'bar',
      data: {
        labels: this.revenueData.labels,
        datasets: [
          {
            label: 'Revenue ($k)',
            data: this.revenueData.revenue,
            backgroundColor: '#3980F4',
            borderRadius: 4,
            barPercentage: 0.3,
            yAxisID: 'y',
          },
          {
            label: 'Bookings',
            data: this.revenueData.bookings,
            backgroundColor: '#E5EEFF',
            borderRadius: 4,
            barPercentage: 0.3,
            yAxisID: 'y1',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
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
            ticks: { color: '#76777D', font: { size: 12 } },
          },
          y: {
            position: 'left',
            grid: { color: '#F0EFEF' },
            ticks: {
              color: '#76777D',
              font: { size: 11 },
              callback: (v) => '$' + v + 'k',
            },
            border: { display: false },
          },
          y1: {
            position: 'right',
            grid: { display: false },
            ticks: {
              color: '#76777D',
              font: { size: 11 },
            },
            border: { display: false },
          },
        },
      },
    });
  }
}
