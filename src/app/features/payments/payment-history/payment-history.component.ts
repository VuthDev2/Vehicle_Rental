import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PaymentService } from '../../../core/services/payment.service';
import { Payment } from '../../../models/payment.model';

const STATUS_CONFIG: Record<string, { class: string; dot: string }> = {
  pending: { class: 'badge-warning', dot: 'warning' },
  succeeded: { class: 'badge-success', dot: 'success' },
  failed: { class: 'badge-danger', dot: 'danger' },
  refunded: { class: 'badge-info', dot: 'info' },
};

@Component({
  selector: 'app-payment-history',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="page-container">
      <div class="page-header flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p class="eyebrow">Customer</p>
          <h1>Payment History</h1>
          <p>View all your transactions</p>
        </div>
        <div class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold"
             style="background: rgba(16,185,129,0.1); color: #10b981;">
          <span class="status-dot success"></span>
          {{ payments().length }} payments
        </div>
      </div>

      @if (loading()) {
        <div class="flex flex-col gap-4">
          @for (i of [1,2,3]; track i) {
            <div class="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-5">
              <div class="space-y-3">
                <div class="h-5 w-1/3 skeleton"></div>
                <div class="h-4 w-2/3 skeleton"></div>
              </div>
            </div>
          }
        </div>
      } @else if (payments().length === 0) {
        <div class="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-16 text-center">
          <div class="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5"
               style="background: rgba(255,255,255,0.04);">
            <span class="material-symbols-outlined text-4xl text-outline">payments</span>
          </div>
          <h2 class="text-xl font-bold text-on-surface mb-2">No payments yet</h2>
          <p class="text-on-surface-variant text-sm">Your payment transactions will appear here after your first booking.</p>
        </div>
      } @else {
        <div class="flex flex-col gap-4">
          @for (payment of payments(); track payment._id) {
            <div class="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-5 transition-all duration-200 hover:border-primary/30 hover:-translate-y-0.5">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                       style="background: rgba(255,255,255,0.04);">
                    <span class="material-symbols-outlined text-xl text-on-surface-variant">{{ getMethodIcon(payment.method) }}</span>
                  </div>
                  <div>
                    <h3 class="font-bold text-on-surface">{{ payment.method }}</h3>
                    <p class="text-xs text-on-surface-variant mt-0.5">{{ payment.createdAt | date:'medium' }}</p>
                    <p class="text-[10px] text-outline mt-0.5 font-mono tracking-tight">{{ payment.transactionId || payment._id }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-4 sm:text-right">
                  <span class="text-xl font-black text-secondary">\${{ payment.amount }}</span>
                  <span [class]="'badge ' + getStatusClass(payment.status)">
                    <span [class]="'status-dot ' + getStatusDot(payment.status)"></span>
                    {{ payment.status }}
                  </span>
                </div>
              </div>
            </div>
          }
        </div>
      }
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

  getMethodIcon(method: string): string {
    const icons: Record<string, string> = {
      Card: 'credit_card',
      PayPal: 'account_balance',
      'ABA Pay': 'smartphone',
      Wing: 'mobile_friendly',
      Cash: 'payments',
    };
    return icons[method] || 'payments';
  }

  getStatusClass(status: string): string {
    return STATUS_CONFIG[status]?.class || 'badge-neutral';
  }

  getStatusDot(status: string): string {
    return STATUS_CONFIG[status]?.dot || 'neutral';
  }
}
