import { Component, inject, signal, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { PaymentService } from '../../../core/services/payment.service';

@Component({
  selector: 'app-payment-return',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center p-4" style="background: var(--color-background);">
      <div class="w-full max-w-md rounded-2xl border border-outline-variant/20 bg-surface-container-low p-10 text-center">
        @if (status() === 'checking') {
          <span class="material-symbols-outlined animate-spin text-5xl text-primary">progress_activity</span>
          <h1 class="text-xl font-bold text-on-surface mt-4">Verifying your payment…</h1>
          <p class="text-sm text-on-surface-variant mt-1">Please wait a moment.</p>
        } @else if (status() === 'paid') {
          <div class="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
               style="background: rgba(16,185,129,0.1);">
            <span class="material-symbols-outlined text-5xl text-primary">check_circle</span>
          </div>
          <h1 class="text-xl font-bold text-on-surface">Payment Successful!</h1>
          <p class="text-sm text-on-surface-variant mt-1 mb-6">
            Your booking is confirmed. Redirecting you to the home page…
          </p>
          <div class="flex flex-wrap gap-3 justify-center">
            <a routerLink="/" class="btn-primary text-sm px-6 py-2.5">Continue</a>
            <a routerLink="/customer/bookings"
               class="rounded-xl border border-outline-variant/40 px-6 py-2.5 text-sm font-bold text-on-surface-variant hover:bg-surface-container-high transition-all">
              View Bookings
            </a>
          </div>
        } @else {
          <div class="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
               style="background: rgba(245,158,11,0.1);">
            <span class="material-symbols-outlined text-5xl" style="color: #fbbf24;">hourglass_top</span>
          </div>
          <h1 class="text-xl font-bold text-on-surface">Payment Pending</h1>
          <p class="text-sm text-on-surface-variant mt-1 mb-6">
            If you completed the payment, your booking will be updated shortly.
          </p>
          <a routerLink="/" class="btn-primary text-sm px-6 py-2.5">Back to Home</a>
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
    // Depends on the browser (token in localStorage + redirect) — skip on SSR.
    if (!isPlatformBrowser(this.platformId)) return;

    const tranId = this.route.snapshot.queryParamMap.get('tran_id');
    if (!tranId) {
      this.status.set('pending');
      return;
    }

    // Verify with ABA (check-transaction) and mark the booking paid if approved.
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
