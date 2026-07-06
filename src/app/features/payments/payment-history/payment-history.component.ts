import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PaymentService } from '../../../core/services/payment.service';
import { Payment } from '../../../models/payment.model';

@Component({
  selector: 'app-payment-history',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="p-6">
      <div class="mb-6 flex items-center justify-between">
        <div>
          <p class="text-xs font-bold uppercase tracking-widest text-outline">Customer</p>
          <h1 class="text-2xl font-bold text-on-surface">Payment History</h1>
        </div>
      </div>

      <div class="flex flex-col gap-4">
        @if (loading()) {
          <div class="animate-pulse rounded-2xl border border-outline-variant/30 bg-surface-container-low p-6 h-24"></div>
        } @else if (payments().length === 0) {
          <div class="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-12 text-center">
            <h2 class="text-lg font-bold text-on-surface">No payments yet</h2>
          </div>
        } @else {
          @for (payment of payments(); track payment._id) {
            <div class="flex flex-col gap-4 rounded-2xl border border-outline-variant/30 bg-surface-container-low p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 class="font-bold text-on-surface">Transaction: {{ payment.transactionId || payment._id }}</h3>
                <p class="text-sm text-on-surface-variant">{{ payment.createdAt | date:'medium' }} · {{ payment.method }}</p>
              </div>
              <div class="flex items-center gap-4">
                <strong class="text-lg text-secondary">\${{ payment.amount }}</strong>
                <span class="rounded-lg bg-surface-container-high px-3 py-1 text-xs font-bold uppercase tracking-wider text-on-surface">{{ payment.status }}</span>
              </div>
            </div>
          }
        }
      </div>
    </div>
  `,
})
export class PaymentHistoryComponent implements OnInit {
  private readonly paymentService = inject(PaymentService);

  readonly loading = signal(true);
  readonly payments = signal<Payment[]>([]);

  ngOnInit() {
    this.paymentService.getPayments().subscribe({
      next: (res) => {
        this.payments.set(res.payments);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
