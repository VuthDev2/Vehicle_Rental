import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../../core/services/auth.service';
import { DataService } from '../../../core/services/data.service';

@Component({
  selector: 'app-my-bookings',
  imports: [MatButtonModule, MatChipsModule],
  template: `
    <section class="page">
      <div class="section-head">
        <div><p class="eyebrow">Customer</p><h1>My bookings</h1></div>
      </div>
      <div class="table-list">
        @for (booking of bookings(); track booking._id) {
          <article>
            <div>
              <h2>{{ vehicleName(booking.vehicleId) }}</h2>
              <p>{{ booking.startDate }} to {{ booking.endDate }} · \${{ booking.totalPrice }}</p>
            </div>
            <mat-chip-set><mat-chip>{{ booking.status }}</mat-chip><mat-chip>{{ booking.paymentStatus }}</mat-chip></mat-chip-set>
            @if (booking.status !== 'cancelled') {
              <button mat-stroked-button type="button" (click)="data.cancelBooking(booking._id)">Cancel</button>
            }
          </article>
        }
      </div>
    </section>
  `,
})
export class MyBookingsComponent {
  private readonly auth = inject(AuthService);
  readonly data = inject(DataService);
  readonly bookings = computed(() => this.data.bookings().filter((booking) => booking.userId === this.auth.user()?._id));

  vehicleName(id: string): string {
    return this.data.vehicleById(id)?.name ?? 'Vehicle';
  }
}
