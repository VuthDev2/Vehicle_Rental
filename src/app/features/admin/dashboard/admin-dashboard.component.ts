import { AfterViewInit, Component, ElementRef, ViewChild, computed, inject } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { DataService } from '../../../core/services/data.service';
import { AuthService } from '../../../core/services/auth.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  imports: [DatePipe],
  template: `
    <div class="p-6 md:p-8 min-h-full" style="background: #0c0d1a;">

      <!-- Header -->
      <div class="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p class="text-xs font-bold uppercase tracking-widest mb-1" style="color: #a78bfa;">Overview</p>
          <h1 class="text-3xl font-black text-white">Admin Dashboard</h1>
          <p class="text-sm mt-1" style="color: #64748b;">{{ today | date:'EEEE, MMMM d, y' }}</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="px-4 py-2 rounded-xl text-sm font-semibold"
               style="background: rgba(139,92,246,0.1); color: #a78bfa; border: 1px solid rgba(139,92,246,0.2);">
            <span class="material-symbols-outlined text-sm align-middle mr-1">admin_panel_settings</span>
            Administrator
          </div>
        </div>
      </div>

      <!-- Metric Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        @for (card of metricCards; track card.label) {
          <div class="rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:-translate-y-1"
               style="background: #13152b; border: 1px solid rgba(255,255,255,0.06);">
            <!-- Icon -->
            <div class="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                 [style.background]="card.iconBg">
              <span class="material-symbols-outlined text-xl" [style.color]="card.iconColor">{{ card.icon }}</span>
            </div>
            <!-- Value -->
            <p class="text-2xl md:text-3xl font-black text-white mb-1">{{ card.value }}</p>
            <p class="text-xs font-semibold uppercase tracking-wide" style="color: #64748b;">{{ card.label }}</p>
            <!-- Change indicator -->
            <div class="absolute top-5 right-5 flex items-center gap-1 text-xs font-bold"
                 [style.color]="card.up ? '#34d399' : '#f87171'">
              <span class="material-symbols-outlined text-sm">{{ card.up ? 'trending_up' : 'trending_down' }}</span>
              {{ card.change }}
            </div>
            <!-- Background glow -->
            <div class="absolute -bottom-4 -right-4 w-20 h-20 rounded-full opacity-10 blur-xl"
                 [style.background]="card.iconColor"></div>
          </div>
        }
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Revenue Chart -->
        <div class="rounded-2xl p-6" style="background: #13152b; border: 1px solid rgba(255,255,255,0.06);">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-lg font-bold text-white">Monthly Revenue</h2>
              <p class="text-xs mt-0.5" style="color: #64748b;">Last 6 months performance</p>
            </div>
            <div class="px-3 py-1 rounded-lg text-xs font-bold"
                 style="background: rgba(16,185,129,0.1); color: #34d399;">+18.2%</div>
          </div>
          <canvas #revenueChart></canvas>
        </div>

        <!-- Popular Vehicles Chart -->
        <div class="rounded-2xl p-6" style="background: #13152b; border: 1px solid rgba(255,255,255,0.06);">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-lg font-bold text-white">Fleet by Type</h2>
              <p class="text-xs mt-0.5" style="color: #64748b;">Vehicle category distribution</p>
            </div>
          </div>
          <canvas #popularChart></canvas>
        </div>
      </div>

      <!-- Quick Stats Row -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        @for (stat of quickStats; track stat.label) {
          <div class="rounded-2xl p-5 flex items-center gap-4"
               style="background: #13152b; border: 1px solid rgba(255,255,255,0.06);">
            <div class="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center"
                 [style.background]="stat.iconBg">
              <span class="material-symbols-outlined text-xl" [style.color]="stat.iconColor">{{ stat.icon }}</span>
            </div>
            <div>
              <p class="text-xl font-black text-white">{{ stat.value }}</p>
              <p class="text-xs" style="color: #64748b;">{{ stat.label }}</p>
            </div>
          </div>
        }
      </div>

    </div>
  `,
})
export class AdminDashboardComponent implements AfterViewInit {
  readonly data = inject(DataService);
  readonly auth = inject(AuthService);
  readonly today = new Date();

  @ViewChild('revenueChart') revenueChart?: ElementRef<HTMLCanvasElement>;
  @ViewChild('popularChart') popularChart?: ElementRef<HTMLCanvasElement>;

  readonly metricCards = [
    {
      label: 'Total Vehicles',
      value: '142',
      icon: 'directions_car',
      iconBg: 'rgba(16,185,129,0.12)',
      iconColor: '#10b981',
      change: '+12%',
      up: true,
    },
    {
      label: 'Total Customers',
      value: '1,284',
      icon: 'group',
      iconBg: 'rgba(59,130,246,0.12)',
      iconColor: '#3b82f6',
      change: '+8%',
      up: true,
    },
    {
      label: 'Active Bookings',
      value: '47',
      icon: 'receipt_long',
      iconBg: 'rgba(245,158,11,0.12)',
      iconColor: '#f59e0b',
      change: '+3%',
      up: true,
    },
    {
      label: 'Monthly Revenue',
      value: '$8,420',
      icon: 'payments',
      iconBg: 'rgba(139,92,246,0.12)',
      iconColor: '#8b5cf6',
      change: '+18%',
      up: true,
    },
  ];

  readonly quickStats = [
    { label: 'Vehicles Available Now', value: '98', icon: 'garage', iconBg: 'rgba(16,185,129,0.1)', iconColor: '#10b981' },
    { label: 'Pending Approvals', value: '5', icon: 'pending_actions', iconBg: 'rgba(245,158,11,0.1)', iconColor: '#f59e0b' },
    { label: 'Support Tickets', value: '3', icon: 'support_agent', iconBg: 'rgba(239,68,68,0.1)', iconColor: '#ef4444' },
  ];

  ngAfterViewInit(): void {
    const gridColor = 'rgba(255,255,255,0.04)';
    const textColor = '#64748b';

    if (this.revenueChart) {
      new Chart(this.revenueChart.nativeElement, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Revenue ($)',
            data: [3200, 4800, 4100, 6200, 7100, 8420],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16,185,129,0.08)',
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#10b981',
            pointRadius: 4,
            pointHoverRadius: 6,
          }],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
          },
          scales: {
            x: {
              grid: { color: gridColor },
              ticks: { color: textColor, font: { size: 11 } },
            },
            y: {
              grid: { color: gridColor },
              ticks: { color: textColor, font: { size: 11 } },
            },
          },
        },
      });
    }

    if (this.popularChart) {
      new Chart(this.popularChart.nativeElement, {
        type: 'doughnut',
        data: {
          labels: ['Cars', 'Motorcycles', 'Bicycles'],
          datasets: [{
            data: [52, 35, 13],
            backgroundColor: ['#10b981', '#3b82f6', '#f59e0b'],
            borderColor: '#13152b',
            borderWidth: 3,
          }],
        },
        options: {
          responsive: true,
          cutout: '68%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: '#94a3b8', font: { size: 12 }, padding: 16 },
            },
          },
        },
      });
    }
  }
}
