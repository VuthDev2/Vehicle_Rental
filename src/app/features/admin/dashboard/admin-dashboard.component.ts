import { AfterViewInit, Component, ElementRef, ViewChild, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Chart } from 'chart.js/auto';
import { DataService } from '../../../core/services/data.service';
import { AuthService } from '../../../core/services/auth.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  imports: [DatePipe, RouterLink],
  template: `
    <div class="px-10 py-10 min-h-full" style="background: #F8F9FF;">

      <!-- ==================== HEADER ==================== -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h2 class="text-2xl font-semibold tracking-tight" style="color: #0B1C30;">Manage Fleet</h2>
          <p class="text-base" style="color: #76777D;">{{ today | date:'fullDate' }}</p>
        </div>
        <div class="flex items-center gap-4">
          <button class="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-all"
                  style="background: transparent;">
            <span class="material-symbols-outlined text-xl" style="color: #45464D;">notifications</span>
          </button>
          <div class="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold shadow-sm"
               style="background: #FD761A; color: #5C2400;">
            {{ auth.user()?.name?.charAt(0)?.toUpperCase() || 'A' }}
          </div>
        </div>
      </div>

      <!-- ==================== KPI CARDS ==================== -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        @for (kpi of kpis; track kpi.label) {
          <div class="rounded-xl border p-6 flex flex-col gap-1"
               style="background: #FFFFFF; border-color: #C6C6CD; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
            <div class="flex items-center justify-between mb-2">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center"
                   style="background: #E5EEFF;">
                <span class="material-symbols-outlined text-lg" style="color: #3980F4;">{{ kpi.icon }}</span>
              </div>
              <span class="text-xs font-semibold tracking-wider uppercase" style="color: #9D4300;">{{ kpi.change }}</span>
            </div>
            <p class="text-xs font-semibold tracking-wider uppercase" style="color: #76777D;">{{ kpi.label }}</p>
            <p class="text-2xl font-semibold tracking-tight" style="color: #0B1C30;">{{ kpi.value }}</p>
          </div>
        }
      </div>

      <!-- ==================== ANALYTICS CHARTS ==================== -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Monthly Revenue Bar Chart -->
        <div class="rounded-xl border p-6"
             style="background: #FFFFFF; border-color: #C6C6CD; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
          <div class="flex items-center justify-between mb-6">
            <h4 class="text-lg font-bold" style="color: #0B1C30;">Monthly Revenue</h4>
            <div class="relative">
              <select class="appearance-none rounded-lg px-3 py-2 pr-10 text-sm font-semibold border-none cursor-pointer"
                      style="background: #F8F9FF; color: #0B1C30;">
                <option>2026</option>
              </select>
              <span class="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-sm pointer-events-none" style="color: #6B7280;">expand_more</span>
            </div>
          </div>
          <canvas #revenueChart></canvas>
        </div>

        <!-- Popular Vehicles Horizontal Chart -->
        <div class="rounded-xl border p-6"
             style="background: #FFFFFF; border-color: #C6C6CD; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
          <h4 class="text-lg font-bold mb-6" style="color: #0B1C30;">Popular Vehicles</h4>
          <div class="flex flex-col gap-6">
            @for (item of popularVehicles; track item.name) {
              <div class="flex flex-col gap-1">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-semibold" style="color: #0B1C30;">{{ item.name }}</span>
                  <span class="text-sm font-semibold" style="color: #76777D;">{{ item.percent }}%</span>
                </div>
                <div class="w-full h-2 rounded-full" style="background: #E5EEFF;">
                  <div class="h-2 rounded-full transition-all duration-500"
                       [style.width.%]="item.percent"
                       style="background: #3980F4;"></div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- ==================== RECENT BOOKINGS TABLE ==================== -->
      <div class="rounded-xl border overflow-hidden"
           style="background: #FFFFFF; border-color: #C6C6CD; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
        <!-- Table Header -->
        <div class="flex items-center justify-between px-6 py-5 border-b"
             style="border-color: #C6C6CD;">
          <h4 class="text-lg font-bold" style="color: #0B1C30;">Recent Bookings</h4>
          <a routerLink="/admin/bookings" class="text-sm font-semibold tracking-wider" style="color: #3980F4;">View All</a>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr style="background: #EFF4FF;">
                <th class="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider" style="color: #76777D;">Customer</th>
                <th class="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider" style="color: #76777D;">Vehicle</th>
                <th class="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider" style="color: #76777D;">Date</th>
                <th class="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider" style="color: #76777D;">Status</th>
                <th class="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider" style="color: #76777D;">Amount</th>
                <th class="text-right px-6 py-4"></th>
              </tr>
            </thead>
            <tbody>
              @for (row of bookings; track row.name) {
                <tr class="border-t" style="border-color: #C6C6CD;">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                           style="background: #D3E4FE; color: #0B1C30;">
                        {{ row.initials }}
                      </div>
                      <div>
                        <p class="font-semibold text-base" style="color: #0B1C30;">{{ row.name }}</p>
                        <p class="text-sm tracking-wider" style="color: #76777D;">{{ row.email }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-base" style="color: #0B1C30;">{{ row.vehicle }}</td>
                  <td class="px-6 py-4" style="color: #76777D;">{{ row.date }}</td>
                  <td class="px-6 py-4">
                    <span class="inline-flex px-3 py-1 rounded-full text-sm font-semibold tracking-wider"
                          [style]="row.status === 'Completed'
                            ? 'background: rgba(16,185,129,0.1); color: #059669;'
                            : 'background: rgba(245,158,11,0.1); color: #D97706;'">
                      {{ row.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-base font-bold" style="color: #0B1C30;">\${{ row.amount }}</td>
                  <td class="px-6 py-4 text-right">
                    <button class="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-all">
                      <span class="material-symbols-outlined text-lg" style="color: #76777D;">more_horiz</span>
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `,
  styles: [`
    :host { display: block; min-height: 100%; }
    canvas { max-height: 230px; }
  `]
})
export class AdminDashboardComponent implements AfterViewInit {
  readonly data = inject(DataService);
  readonly auth = inject(AuthService);
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
