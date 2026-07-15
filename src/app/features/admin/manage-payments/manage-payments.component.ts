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
  template: `
    <div style="background: #FBF9F9; min-height: 100%; padding: 24px;">

      <!-- ==================== HEADER ==================== -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 style="font-size: 28px; font-weight: 700; color: #1B1C1C; margin: 0 0 2px;">Payments</h1>
          <p style="font-size: 15px; color: #717783; margin: 0;">Transaction history</p>
        </div>
        <div class="flex items-center gap-3">
          <select style="border: 1px solid #E9E8E7; border-radius: 8px; background: #FFFFFF; padding: 10px 32px 10px 16px; font-size: 14px; color: #1B1C1C; cursor: pointer; outline: none;">
            <option>All Status</option>
            <option>Succeeded</option>
            <option>Pending</option>
            <option>Failed</option>
            <option>Refunded</option>
          </select>
          <div style="position: relative;">
            <span class="material-symbols-outlined" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 20px; color: #76777D; pointer-events: none;">search</span>
            <input type="text" placeholder="Search transactions..."
                   style="width: 220px; border: 1px solid #E9E8E7; border-radius: 8px; padding: 10px 14px 10px 40px; font-size: 14px; color: #1B1C1C; outline: none; background: #FFFFFF; box-sizing: border-box;"
                   onfocus="this.style.borderColor='#005DAC'" onblur="this.style.borderColor='#E9E8E7'" />
          </div>
        </div>
      </div>

      <!-- ==================== STAT CARDS ==================== -->
      <div class="grid grid-cols-4 gap-4 mb-8">
        @for (stat of statCards(); track stat.label) {
          <div style="background: #FFFFFF; border: 1px solid #E9E8E7; border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 16px;">
            <div style="width: 48px; height: 48px; border-radius: 12px; background: {{ stat.bg }}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <span class="material-symbols-outlined" style="font-size: 24px; color: {{ stat.color }};">{{ stat.icon }}</span>
            </div>
            <div>
              <p style="font-size: 13px; color: #717783; margin: 0; font-weight: 500;">{{ stat.label }}</p>
              <p style="font-size: 28px; font-weight: 700; color: #1B1C1C; margin: 0; line-height: 1.2;">{{ stat.value() }}</p>
            </div>
          </div>
        }
      </div>

      <!-- ==================== TABLE ==================== -->
      @if (loading()) {
        <div style="background: #FFFFFF; border: 1px solid #E9E8E7; border-radius: 12px; overflow: hidden;">
          @for (i of [1,2,3,4]; track i) {
            <div style="padding: 16px 24px; border-bottom: 1px solid #F0EFEF; display: flex; gap: 16px; align-items: center;">
              <div style="flex: 1;"><div class="skeleton" style="height: 14px; width: 40%;"></div></div>
              <div style="flex: 1.5;"><div class="skeleton" style="height: 14px; width: 60%;"></div></div>
              <div style="flex: 1;"><div class="skeleton" style="height: 14px; width: 30%;"></div></div>
              <div style="flex: 1;"><div class="skeleton" style="height: 14px; width: 50%;"></div></div>
              <div style="flex: 1;"><div class="skeleton" style="height: 14px; width: 35%;"></div></div>
            </div>
          }
        </div>
      } @else if (payments().length === 0) {
        <div style="background: #FFFFFF; border: 1px solid #E9E8E7; border-radius: 12px; text-align: center; padding: 80px 20px;">
          <span class="material-symbols-outlined" style="font-size: 48px; color: #C1C6D4; margin-bottom: 12px;">payments</span>
          <p style="font-size: 18px; font-weight: 600; color: #717783; margin: 0 0 4px;">No payments recorded</p>
          <p style="font-size: 14px; color: #76777D; margin: 0;">Payments will appear once customers complete bookings.</p>
        </div>
      } @else {
        <div style="background: #FFFFFF; border: 1px solid #E9E8E7; border-radius: 12px; overflow: hidden;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #F5F3F3;">
                <th style="padding: 12px 24px; text-align: left; font-size: 12px; font-weight: 700; color: #49454F; text-transform: uppercase; letter-spacing: 0.5px;">Transaction ID</th>
                <th style="padding: 12px 24px; text-align: left; font-size: 12px; font-weight: 700; color: #49454F; text-transform: uppercase; letter-spacing: 0.5px;">Customer</th>
                <th style="padding: 12px 24px; text-align: left; font-size: 12px; font-weight: 700; color: #49454F; text-transform: uppercase; letter-spacing: 0.5px;">Method</th>
                <th style="padding: 12px 24px; text-align: right; font-size: 12px; font-weight: 700; color: #49454F; text-transform: uppercase; letter-spacing: 0.5px;">Amount</th>
                <th style="padding: 12px 24px; text-align: left; font-size: 12px; font-weight: 700; color: #49454F; text-transform: uppercase; letter-spacing: 0.5px;">Date</th>
                <th style="padding: 12px 24px; text-align: center; font-size: 12px; font-weight: 700; color: #49454F; text-transform: uppercase; letter-spacing: 0.5px;">Status</th>
                <th style="padding: 12px 24px; text-align: right; font-size: 12px; font-weight: 700; color: #49454F; text-transform: uppercase; letter-spacing: 0.5px;">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (payment of payments(); track payment._id) {
                <tr style="border-bottom: 1px solid #F0EFEF;">
                  <td style="padding: 16px 24px;">
                    <span style="color: #005DAC; font-weight: 700; font-size: 13px;">#{{ (payment.transactionId || payment._id).slice(-8).toUpperCase() }}</span>
                  </td>
                  <td style="padding: 16px 24px;">
                    <div class="flex items-center gap-3">
                      <div style="width: 34px; height: 34px; border-radius: 50%; background: #FD761A; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #FFFFFF; flex-shrink: 0;">
                        {{ getInitials(getCustomerName(payment)) }}
                      </div>
                      <div>
                        <p style="font-size: 14px; font-weight: 600; color: #1B1C1C; margin: 0;">{{ getCustomerName(payment) }}</p>
                        <p style="font-size: 12px; color: #717783; margin: 0;">{{ getCustomerEmail(payment) }}</p>
                      </div>
                    </div>
                  </td>
                  <td style="padding: 16px 24px;">
                    <div class="flex items-center gap-2">
                      <span class="material-symbols-outlined" style="font-size: 18px; color: #717783;">{{ PAYMENT_METHOD_ICONS[payment.method] || 'payments' }}</span>
                      <span style="font-size: 14px; font-weight: 500; color: #414752;">{{ payment.method }}</span>
                    </div>
                  </td>
                  <td style="padding: 16px 24px; text-align: right;">
                    <span style="font-size: 16px; font-weight: 700; color: #1B1C1C;">\${{ payment.amount.toFixed(2) }}</span>
                  </td>
                  <td style="padding: 16px 24px;">
                    <span style="font-size: 13px; color: #717783;">{{ payment.createdAt | date:'MMM d, y' }}</span>
                  </td>
                  <td style="padding: 16px 24px; text-align: center;">
                    <span style="display: inline-block; padding: 3px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; letter-spacing: 0.3px;
                      background: {{ STATUS_STYLE[payment.status]?.bg || '#E3E2E2' }}; color: {{ STATUS_STYLE[payment.status]?.color || '#49454F' }};">
                      {{ payment.status.charAt(0).toUpperCase() + payment.status.slice(1) }}
                    </span>
                  </td>
                  <td style="padding: 16px 24px; text-align: right;">
                    <button style="background: none; border: none; cursor: pointer; color: #717783; padding: 6px; transition: color 0.15s;"
                            onmouseover="this.style.color='#005DAC'" onmouseout="this.style.color='#717783'">
                      <span class="material-symbols-outlined" style="font-size: 20px;">more_vert</span>
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- ==================== PAGINATION ==================== -->
        @if (totalPages() > 0) {
          <div style="border-top: 1px solid #E9E8E7; padding-top: 20px; margin-top: 20px; display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 14px; color: #717783;">
              {{ (currentPage() - 1) * pageSize + 1 }}–{{ Math.min(currentPage() * pageSize, total()) }} of {{ total() }}
            </span>
            <div class="flex items-center gap-1">
              <button (click)="goToPage(currentPage() - 1)" [disabled]="currentPage() <= 1"
                      style="width: 36px; height: 36px; border: 1px solid #E9E8E7; border-radius: 8px; background: #FFFFFF; display: flex; align-items: center; justify-content: center; color: {{ currentPage() <= 1 ? '#C1C6D4' : '#414752' }}; cursor: {{ currentPage() <= 1 ? 'not-allowed' : 'pointer' }};">
                <span class="material-symbols-outlined" style="font-size: 16px;">chevron_left</span>
              </button>
              @for (p of pageNumbers(); track p) {
                @if (p === '...') {
                  <span style="padding: 0 4px; color: #C1C6D4; font-size: 14px;">...</span>
                } @else {
                  <button (click)="goToPage(p)"
                          style="width: 36px; height: 36px; border: none; border-radius: 8px; background: {{ currentPage() === p ? '#005DAC' : 'transparent' }}; color: {{ currentPage() === p ? '#FFFFFF' : '#414752' }}; font-size: 14px; font-weight: {{ currentPage() === p ? '700' : '500' }}; cursor: pointer;">
                    {{ p }}
                  </button>
                }
              }
              <button (click)="goToPage(currentPage() + 1)" [disabled]="currentPage() >= totalPages()"
                      style="width: 36px; height: 36px; border: 1px solid #E9E8E7; border-radius: 8px; background: #FFFFFF; display: flex; align-items: center; justify-content: center; color: {{ currentPage() >= totalPages() ? '#C1C6D4' : '#414752' }}; cursor: {{ currentPage() >= totalPages() ? 'not-allowed' : 'pointer' }};">
                <span class="material-symbols-outlined" style="font-size: 16px;">chevron_right</span>
              </button>
            </div>
          </div>
        }
      }

    </div>
  `,
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
