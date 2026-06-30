import { Component, inject } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { DataService } from '../../../core/services/data.service';

@Component({
  selector: 'app-manage-bookings',
  imports: [MatChipsModule],
  template: `
    <section class="page">
      <div class="section-head"><div><p class="eyebrow">Operations</p><h1>Manage bookings</h1></div></div>
      <div class="table-list">
        @for (booking of data.bookings(); track booking._id) {
          <article><div><h2>{{ vehicleName(booking.vehicleId) }}</h2><p>{{ booking.startDate }} to {{ booking.endDate }} · \${{ booking.totalPrice }}</p></div><mat-chip-set><mat-chip>{{ booking.status }}</mat-chip><mat-chip>{{ booking.paymentStatus }}</mat-chip></mat-chip-set></article>
        }
      </div>
    </section>
  `,
})
export class ManageBookingsComponent {
  readonly data = inject(DataService);
  vehicleName(id: string): string { return this.data.vehicleById(id)?.name ?? 'Vehicle'; }
}
