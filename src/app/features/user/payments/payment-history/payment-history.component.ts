import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PaymentService } from '../../../../core/services/payment.service';
import { Payment } from '../../../../models/payment.model';

const STATUS_CONFIG: Record<string, { class: string; dot: string; label: string }> = {
  pending: { class: 'badge-warning', dot: 'warning', label: 'Pending' },
  succeeded: { class: 'badge-success', dot: 'success', label: 'Succeeded' },
  failed: { class: 'badge-danger', dot: 'danger', label: 'Failed' },
  refunded: { class: 'badge-info', dot: 'info', label: 'Refunded' },
};

const METHOD_META: Record<string, { icon: string; bg: string; color: string }> = {
  Card: { icon: 'credit_card', bg: 'rgba(59, 130, 246, 0.12)', color: '#60a5fa' },
  PayPal: { icon: 'account_balance', bg: 'rgba(56, 132, 255, 0.14)', color: '#7aa7ff' },
  'ABA Pay': { icon: 'smartphone', bg: 'rgba(16, 185, 129, 0.12)', color: '#34d399' },
  Wing: { icon: 'mobile_friendly', bg: 'rgba(236, 72, 153, 0.12)', color: '#f472b6' },
  Cash: { icon: 'payments', bg: 'rgba(245, 158, 11, 0.12)', color: '#fbbf24' },
};

export type PaymentFilter = 'all' | 'succeeded' | 'pending' | 'refunded' | 'failed';

@Component({
  selector: 'app-payment-history',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './payment-history.component.html',
  styleUrl: './payment-history.component.css',
})
export class PaymentHistoryComponent implements OnInit {
  private readonly paymentService = inject(PaymentService);

  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly payments = signal<Payment[]>([]);
  readonly filter = signal<PaymentFilter>('all');
  readonly methodFilter = signal('all');

  ngOnInit() {
    this.paymentService.getPayments().subscribe({
      next: (res) => {
        this.payments.set(res.payments);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.loadError.set(true);
      },
    });
  }

  setFilter(f: PaymentFilter): void {
    this.filter.set(f);
  }

  setMethod(m: string): void {
    this.methodFilter.set(m);
  }

  readonly tabs = computed(() => {
    const all = this.payments();
    const count = (s: PaymentFilter) =>
      s === 'all' ? all.length : all.filter((p) => p.status === s).length;
    return [
      { key: 'all' as PaymentFilter, label: 'All', count: count('all') },
      { key: 'succeeded' as PaymentFilter, label: 'Succeeded', count: count('succeeded') },
      { key: 'pending' as PaymentFilter, label: 'Pending', count: count('pending') },
      { key: 'refunded' as PaymentFilter, label: 'Refunded', count: count('refunded') },
      { key: 'failed' as PaymentFilter, label: 'Failed', count: count('failed') },
    ];
  });

  readonly methods = computed(() => {
    const used = new Map<string, number>();
    for (const p of this.payments()) {
      used.set(p.method, (used.get(p.method) || 0) + 1);
    }
    return Array.from(used.entries()).map(([method, count]) => ({ method, count }));
  });

  readonly filteredPayments = computed(() => {
    const f = this.filter();
    const m = this.methodFilter();
    return this.payments().filter((p) => {
      const okStatus = f === 'all' || p.status === f;
      const okMethod = m === 'all' || p.method === m;
      return okStatus && okMethod;
    });
  });

  readonly latestPayment = computed(() => {
    return [...this.payments()].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
  });

  readonly activeFilterCount = computed(() => {
    return Number(this.filter() !== 'all') + Number(this.methodFilter() !== 'all');
  });

  get stats() {
    const all = this.payments();
    const succeeded = all.filter((p) => p.status === 'succeeded');
    const totalPaid = succeeded.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const pending = all.filter((p) => p.status === 'pending').length;
    const refunded = all.filter((p) => p.status === 'refunded').length;
    return [
      {
        label: 'Total Paid',
        value: `$${totalPaid.toFixed(2)}`,
        icon: 'savings',
        bg: 'rgba(16, 185, 129, 0.12)',
        color: '#34d399',
      },
      {
        label: 'Successful',
        value: String(succeeded.length),
        icon: 'check_circle',
        bg: 'rgba(59, 130, 246, 0.12)',
        color: '#60a5fa',
      },
      {
        label: 'Pending',
        value: String(pending),
        icon: 'schedule',
        bg: 'rgba(245, 158, 11, 0.12)',
        color: '#fbbf24',
      },
      {
        label: 'Refunded',
        value: String(refunded),
        icon: 'currency_exchange',
        bg: 'rgba(139, 92, 246, 0.12)',
        color: '#a78bfa',
      },
    ];
  }

  getMethodMeta(method: string): { icon: string; bg: string; color: string } {
    return METHOD_META[method] || { icon: 'payments', bg: 'rgba(148,163,184,0.12)', color: '#94a3b8' };
  }

  getBookingName(p: Payment): string {
    const b = p.bookingId as any;
    if (b && typeof b === 'object') {
      if (b.vehicleId?.name) return b.vehicleId.name;
      return `Booking #${String(b._id).slice(-6)}`;
    }
    return `Booking #${String(p.bookingId).slice(-6)}`;
  }

  getStatusClass(status: string): string {
    return STATUS_CONFIG[status]?.class || 'badge-neutral';
  }

  getTransactionRef(p: Payment): string {
    return (p.transactionId || p._id || '').slice(-10).toUpperCase();
  }

  getStatusDot(status: string): string {
    return STATUS_CONFIG[status]?.dot || 'neutral';
  }

  getStatusLabel(status: string): string {
    return STATUS_CONFIG[status]?.label || status;
  }
}
