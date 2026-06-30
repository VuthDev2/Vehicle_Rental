import { AfterViewInit, Component, ElementRef, ViewChild, computed, inject } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { DataService } from '../../../core/services/data.service';

@Component({
  selector: 'app-admin-dashboard',
  template: `
    <section class="page">
      <div class="section-head"><div><p class="eyebrow">Admin</p><h1>Dashboard</h1></div></div>
      <div class="metric-grid">
        <article><strong>{{ data.vehicles().length }}</strong><span>Total vehicles</span></article>
        <article><strong>{{ data.users().length }}</strong><span>Total users</span></article>
        <article><strong>{{ data.bookings().length }}</strong><span>Total bookings</span></article>
        <article><strong>\${{ data.totalRevenue() }}</strong><span>Revenue</span></article>
      </div>
      <div class="chart-grid">
        <div class="chart-panel"><h2>Monthly revenue</h2><canvas #revenueChart></canvas></div>
        <div class="chart-panel"><h2>Popular vehicles</h2><canvas #popularChart></canvas></div>
      </div>
    </section>
  `,
})
export class AdminDashboardComponent implements AfterViewInit {
  readonly data = inject(DataService);
  readonly labels = computed(() => this.data.vehicles().map((vehicle) => vehicle.brand));
  @ViewChild('revenueChart') revenueChart?: ElementRef<HTMLCanvasElement>;
  @ViewChild('popularChart') popularChart?: ElementRef<HTMLCanvasElement>;

  ngAfterViewInit(): void {
    if (this.revenueChart) {
      new Chart(this.revenueChart.nativeElement, {
        type: 'line',
        data: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], datasets: [{ label: 'Revenue', data: [820, 1120, 970, 1420, 1680, this.data.totalRevenue()], borderColor: '#116149', backgroundColor: 'rgba(17, 97, 73, .12)', tension: .35, fill: true }] },
      });
    }
    if (this.popularChart) {
      new Chart(this.popularChart.nativeElement, {
        type: 'bar',
        data: { labels: this.data.vehicles().map((vehicle) => vehicle.brand), datasets: [{ label: 'Trips', data: this.data.vehicles().map((vehicle) => vehicle.trips), backgroundColor: ['#116149', '#2f6f9f', '#8a5a18', '#7c3f58'] }] },
      });
    }
  }
}
