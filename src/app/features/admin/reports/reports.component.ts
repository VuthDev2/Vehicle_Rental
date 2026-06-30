import { Component, inject } from '@angular/core';
import { DataService } from '../../../core/services/data.service';

@Component({
  selector: 'app-reports',
  template: `
    <section class="page">
      <div class="section-head"><div><p class="eyebrow">Reports</p><h1>Analytics summary</h1></div></div>
      <div class="metric-grid">
        <article><strong>{{ utilization }}%</strong><span>Fleet utilization</span></article>
        <article><strong>\${{ data.totalRevenue() }}</strong><span>Paid revenue</span></article>
        <article><strong>{{ topVehicle }}</strong><span>Popular vehicle</span></article>
      </div>
    </section>
  `,
})
export class ReportsComponent {
  readonly data = inject(DataService);
  get utilization(): number { return Math.round((this.data.vehicles().filter((vehicle) => !vehicle.available).length / this.data.vehicles().length) * 100); }
  get topVehicle(): string { return [...this.data.vehicles()].sort((a, b) => b.trips - a.trips)[0]?.name ?? 'No data'; }
}
