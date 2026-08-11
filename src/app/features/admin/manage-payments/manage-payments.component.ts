import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PaymentService } from '../../../core/services/payment.service';
import { Payment } from '../../../models/payment.model';

const PAYMENT_METHOD_ICONS: Record<string, string> = {
  Card: 'credit_card',
  PayPal: 'account_balance',
  Cash: 'payments',
  'ABA Pay': 'qr_code_scanner',
  Wing: 'smartphone',
};

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  succeeded: { bg: '#E7F5ED', color: '#1E7B4C' },
  pending: { bg: '#FFF8E1', color: '#8A6D00' },
  failed: { bg: '#FFDAD6', color: '#B3261E' },
  refunded: { bg: '#E3E2E2', color: '#49454F' },
};

@Component({
  selector: 'app-manage-payments',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './manage-payments.component.html',
})
export class ManagePaymentsComponent implements OnInit {
  protected readonly Math = Math;
  protected readonly PAYMENT_METHOD_ICONS = PAYMENT_METHOD_ICONS;
  protected readonly STATUS_STYLE = STATUS_STYLE;

  private readonly paymentService = inject(PaymentService);

  readonly payments = signal<Payment[]>([]);
  readonly loading = signal(true);
  readonly currentPage = signal(1);
  readonly totalPages = signal(1);
  readonly total = signal(0);
  readonly pageSize = 20;

  readonly statCards = computed(() => {
    const all = this.payments();
    const succeeded = all.filter(p => p.status === 'succeeded').reduce((s, p) => s + p.amount, 0);
    const pending = all.filter(p => p.status === 'pending').length;
    const refunded = all.filter(p => p.status === 'refunded').length;
    const failed = all.filter(p => p.status === 'failed').length;
    return [
      { label: 'Total Revenue', icon: 'payments', bg: '#E7F5ED', color: '#1E7B4C', value: () => '$' + succeeded.toLocaleString() },
      { label: 'Pending', icon: 'schedule', bg: '#FFF8E1', color: '#8A6D00', value: () => String(pending) },
      { label: 'Refunded', icon: 'undo', bg: '#E3E2E2', color: '#49454F', value: () => String(refunded) },
      { label: 'Failed', icon: 'error', bg: '#FFDAD6', color: '#B3261E', value: () => String(failed) },
    ];
  });

  ngOnInit() { this.loadPayments(); }

  readonly pageNumbers = () => {
    const total = this.totalPages();
    const current = this.currentPage();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | '...')[] = [1];
    if (current > 3) pages.push('...');
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (current < total - 2) pages.push('...');
    pages.push(total);
    return pages;
  };

  loadPayments() {
    this.loading.set(true);
    this.paymentService.getPayments(this.currentPage(), this.pageSize).subscribe({
      next: (res) => {
        this.payments.set(res.payments);
        this.totalPages.set(res.totalPages);
        this.total.set(res.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadPayments();
  }

  getCustomerName(user: any): string {
    return user?.name || 'Walk-in Customer';
  }

  getCustomerEmail(user: any): string {
    return user?.email || 'N/A';
  }

  getInitials(name: string): string {
    return name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
  }
}
