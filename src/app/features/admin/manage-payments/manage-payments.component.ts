import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PaymentService } from '../../../core/services/payment.service';
import { Payment } from '../../../models/payment.model';

@Component({
  selector: 'app-manage-payments',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="p-6 bg-background min-h-screen pb-16">
      <div class="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p class="text-xs font-bold uppercase tracking-widest text-outline">Finance</p>
          <h1 class="text-2xl font-bold text-on-surface">Manage Payments</h1>
        </div>
      </div>

      <div class="overflow-x-auto rounded-2xl border border-outline-variant/30 bg-surface-container-low">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-outline-variant/30 bg-surface-container-high text-xs font-bold uppercase tracking-wider text-outline">
              <th class="p-4">Transaction ID</th>
              <th class="p-4">Customer</th>
              <th class="p-4">Method</th>
              <th class="p-4">Amount</th>
              <th class="p-4">Date</th>
              <th class="p-4">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-outline-variant/20 text-sm">
            @if (loading()) {
              <tr>
                <td colspan="6" class="p-8 text-center text-on-surface-variant animate-pulse">Loading payments...</td>
              </tr>
            } @else if (payments().length === 0) {
              <tr>
                <td colspan="6" class="p-8 text-center text-on-surface-variant">No payments recorded.</td>
              </tr>
            } @else {
              @for (payment of payments(); track payment._id) {
                <tr class="hover:bg-surface-container-high/50 transition-colors">
                  <td class="p-4 font-bold text-on-surface">{{ payment.transactionId || payment._id }}</td>
                  <td class="p-4">
                    <p class="font-semibold text-on-surface">{{ getCustomerName(payment.userId) }}</p>
                    <p class="text-xs text-on-surface-variant">{{ getCustomerEmail(payment.userId) }}</p>
                  </td>
                  <td class="p-4 font-semibold text-on-surface">{{ payment.method }}</td>
                  <td class="p-4 font-bold text-secondary">\${{ payment.amount }}</td>
                  <td class="p-4 text-on-surface-variant">{{ payment.createdAt | date:'medium' }}</td>
                  <td class="p-4">
                    <span [class]="payment.status === 'succeeded' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'"
                      class="rounded-lg px-2.5 py-1 text-xs font-bold uppercase tracking-wider">
                      {{ payment.status }}
                    </span>
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class ManagePaymentsComponent implements OnInit {
  private readonly paymentService = inject(PaymentService);

  readonly payments = signal<Payment[]>([]);
  readonly loading = signal(true);

  ngOnInit() {
    this.paymentService.getPayments().subscribe({
      next: (res) => {
        this.payments.set(res.payments);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  getCustomerName(user: any): string {
    return user?.name || 'Walk-in Customer';
  }

  getCustomerEmail(user: any): string {
    return user?.email || 'N/A';
  }
}
