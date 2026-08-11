import { AfterViewInit, Component, ElementRef, PLATFORM_ID, ViewChild, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Chart } from 'chart.js/auto';
import { DataService } from '../../../core/services/data.service';
import { AuthService } from '../../../core/services/auth.service';
import { DatePipe, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  imports: [DatePipe, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements AfterViewInit {
  readonly data = inject(DataService);
  readonly auth = inject(AuthService);
  private readonly platformId = inject(PLATFORM_ID);
  readonly today = new Date();

  @ViewChild('revenueChart') revenueChart?: ElementRef<HTMLCanvasElement>;

  readonly kpis = [
    { label: 'Total Vehicles', value: '1,284', icon: 'directions_car', change: '+12%' },
    { label: 'Total Users', value: '42,590', icon: 'group', change: '+8%' },
    { label: 'Active Bookings', value: '312', icon: 'receipt_long', change: '+3%' },
    { label: 'Monthly Revenue', value: '$142.8k', icon: 'payments', change: '+18%' },
  ];

  readonly popularVehicles = [
    { name: 'Toyota Camry', percent: 85 },
    { name: 'Honda Wave', percent: 70 },
    { name: 'Lexus LX600', percent: 55 },
    { name: 'Yamaha NMAX', percent: 35 },
  ];

  readonly bookings = [
    { name: 'Sokha Lim', initials: 'SL', email: 'sokha@example.com', vehicle: 'Toyota Camry', date: 'Dec 12, 2026', status: 'Completed', amount: '240.00' },
    { name: 'Marie Dupont', initials: 'MD', email: 'marie@example.com', vehicle: 'Honda Wave', date: 'Dec 11, 2026', status: 'Pending', amount: '85.00' },
    { name: 'James Wong', initials: 'JW', email: 'james@example.com', vehicle: 'Lexus LX600', date: 'Dec 10, 2026', status: 'Completed', amount: '520.00' },
  ];

  ngAfterViewInit(): void {
    // Chart.js needs a real canvas — skip during server-side rendering.
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.revenueChart) {
      new Chart(this.revenueChart.nativeElement, {
        type: 'bar',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Revenue',
            data: [18, 24, 20, 32, 38, 45],
            backgroundColor: '#3980F4',
            borderRadius: 4,
            barPercentage: 0.55,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: { legend: { display: false } },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: '#76777D', font: { size: 12, weight: 'bold' } },
            },
            y: {
              grid: { color: '#E5E7EB' },
              ticks: {
                color: '#76777D',
                font: { size: 12, weight: 'bold' },
                callback: (v) => '$' + v + 'k',
              },
              border: { display: false },
            },
          },
        },
      });
    }
  }
}
