import { AfterViewInit, Component, ElementRef, PLATFORM_ID, ViewChild, inject } from '@angular/core';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-admin-dashboard',
  imports: [DatePipe],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent implements AfterViewInit {
  private readonly platformId = inject(PLATFORM_ID);
  readonly today = new Date();

  @ViewChild('revenueChart') revenueChart?: ElementRef<HTMLCanvasElement>;

  readonly statCards = [
    { label: 'Total Vehicles', value: '184', change: '+12%', positive: true, icon: 'directions_car' },
    { label: 'Total Users', value: '42,590', change: '+8%', positive: true, icon: 'group' },
    { label: 'Active Bookings', value: '312', change: '+3%', positive: true, icon: 'event_available' },
    { label: 'Monthly Revenue', value: '$142.8k', change: '+18%', positive: true, icon: 'credit_card' },
  ];

  readonly vehicles = [
    { name: 'Toyota Camry', type: 'Sedan', bookings: 85, trend: 12 },
    { name: 'Honda Wave', type: 'Motorcycle', bookings: 70, trend: 8 },
    { name: 'Lexus LX600', type: 'SUV', bookings: 55, trend: 3 },
    { name: 'Yamaha NMAX', type: 'Scooter', bookings: 35, trend: -2 },
  ];

  readonly tableHeaders = ['Booking ID', 'Customer', 'Vehicle', 'Date', 'Amount', 'Status'];

  readonly recentBookings = [
    { id: 'BK-2847', customer: 'Sophea Keo', vehicle: 'Toyota Camry', date: 'Aug 18, 2026', amount: '$320', status: 'Confirmed' },
    { id: 'BK-2846', customer: 'Dara Chan', vehicle: 'Lexus LX600', date: 'Aug 17, 2026', amount: '$680', status: 'Active' },
    { id: 'BK-2845', customer: 'Maly Pov', vehicle: 'Honda Wave', date: 'Aug 17, 2026', amount: '$85', status: 'Completed' },
    { id: 'BK-2844', customer: 'Visal Ros', vehicle: 'Yamaha NMAX', date: 'Aug 16, 2026', amount: '$110', status: 'Pending' },
    { id: 'BK-2843', customer: 'Sreymom Lim', vehicle: 'Toyota Camry', date: 'Aug 15, 2026', amount: '$290', status: 'Confirmed' },
  ];

  readonly statusStyles: Record<string, string> = {
    Confirmed: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    Active: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    Completed: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
    Pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  };

  ngAfterViewInit(): void {
    // Chart.js needs a real canvas — skip during server-side rendering.
    if (!isPlatformBrowser(this.platformId) || !this.revenueChart) return;

    const canvas = this.revenueChart.nativeElement;
    const ctx = canvas.getContext('2d');
    let fill: string | CanvasGradient = 'rgba(45,90,61,0.12)';
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, 0, 220);
      gradient.addColorStop(0, 'rgba(45,90,61,0.18)');
      gradient.addColorStop(1, 'rgba(45,90,61,0.01)');
      fill = gradient;
    }

    new Chart(canvas, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Revenue',
            data: [82000, 74000, 68000, 91000, 108000, 142800],
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
}
