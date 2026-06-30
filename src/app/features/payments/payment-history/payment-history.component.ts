import { Component, inject } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { DataService } from '../../../core/services/data.service';

@Component({
  selector: 'app-payment-history',
  imports: [MatChipsModule],
  template: `
    <section class="page">
      <div class="section-head"><div><p class="eyebrow">Payments</p><h1>Payment history</h1></div></div>
      <div class="table-list">
        @for (payment of data.payments(); track payment._id) {
          <article>
            <div><h2>{{ payment.transactionId }}</h2><p>{{ payment.date }} · {{ payment.method }} · Booking {{ payment.bookingId }}</p></div>
            <strong>\${{ payment.amount }}</strong>
            <mat-chip-set><mat-chip>{{ payment.status }}</mat-chip></mat-chip-set>
          </article>
        }
      </div>
    </section>
  `,
})
export class PaymentHistoryComponent {
  readonly data = inject(DataService);
}
