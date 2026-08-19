import { Component, inject, signal, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { PaymentService } from '../../../../core/services/payment.service';

@Component({
  selector: 'app-payment-return',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center p-4" style="background: var(--color-bg-deep);">
      <div
        class="w-full max-w-md rounded-2xl border p-8 sm:p-10 text-center"
        style="background: var(--color-surface-deep); border-color: var(--color-edge-deep); box-shadow: 0 24px 70px rgba(0,0,0,0.35);"
      >
        @if (status() === 'checking') {
          <div
            class="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style="background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.22);"
          >
            <span class="material-symbols-outlined animate-spin text-5xl text-primary">progress_activity</span>
          </div>
          <p class="text-[11px] font-black uppercase tracking-widest text-primary mb-2">
            Payment verification
          </p>
          <h1 class="text-2xl font-black text-on-surface">Verifying your payment...</h1>
          <p class="text-sm text-on-surface-variant mt-2 leading-relaxed">
            Please wait while we confirm your transaction with ABA PayWay.
          </p>
        } @else if (status() === 'paid') {
          <div
            class="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style="background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.22);"
          >
            <span class="material-symbols-outlined text-5xl text-primary">check_circle</span>
          </div>
          <p class="text-[11px] font-black uppercase tracking-widest text-primary mb-2">
            Booking confirmed
          </p>
          <h1 class="text-2xl font-black text-on-surface">Payment successful</h1>
          <p class="text-sm text-on-surface-variant mt-2 mb-7 leading-relaxed">
            Your booking is confirmed. You will be redirected to the home page shortly.
          </p>
          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <a routerLink="/" class="btn-primary text-sm px-6 py-2.5">
              <span class="material-symbols-outlined text-lg">home</span>
              Continue
            </a>
            <a routerLink="/customer/bookings" class="btn-secondary text-sm px-6 py-2.5">
              <span class="material-symbols-outlined text-lg">event_available</span>
              View Bookings
            </a>
          </div>
        } @else {
          <div
            class="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style="background: rgba(245,158,11,0.12); border: 1px solid rgba(245,158,11,0.22);"
          >
            <span class="material-symbols-outlined text-5xl" style="color: #fbbf24;">hourglass_top</span>
          </div>
          <p class="text-[11px] font-black uppercase tracking-widest text-amber-300 mb-2">
            Processing
          </p>
          <h1 class="text-2xl font-black text-on-surface">Payment pending</h1>
          <p class="text-sm text-on-surface-variant mt-2 mb-7 leading-relaxed">
            If you completed the payment, your booking will be updated shortly.
          </p>
          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <a routerLink="/" class="btn-primary text-sm px-6 py-2.5">
              <span class="material-symbols-outlined text-lg">home</span>
              Back to Home
            </a>
            <a routerLink="/customer/payments" class="btn-secondary text-sm px-6 py-2.5">
              <span class="material-symbols-outlined text-lg">receipt_long</span>
              Payment History
            </a>
          </div>
        }
      </div>
    </div>
  `,
})
export class PaymentReturnComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly payment = inject(PaymentService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly status = signal<'checking' | 'paid' | 'pending'>('checking');

  ngOnInit(): void {
    // Depends on the browser for token storage and redirect behavior.
    if (!isPlatformBrowser(this.platformId)) return;

    const tranId = this.route.snapshot.queryParamMap.get('tran_id');
    if (!tranId) {
      this.status.set('pending');
      return;
    }

    // Verify with ABA and mark the booking paid if approved.
    this.payment.confirmPayway(tranId).subscribe({
      next: (res) => {
        if (res.paid) {
          this.status.set('paid');
          setTimeout(() => this.router.navigate(['/']), 4000);
        } else {
          this.status.set('pending');
        }
      },
      error: () => this.status.set('pending'),
    });
  }
}
