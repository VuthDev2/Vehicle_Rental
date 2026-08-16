import { Component, inject, signal, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PaymentService, PaywayForm } from '../../../../core/services/payment.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen p-4 sm:p-6" style="background: var(--color-bg-deep);">
      <div class="mx-auto flex min-h-[calc(100vh-48px)] w-full max-w-5xl items-center">
        <section
          class="grid w-full overflow-hidden rounded-2xl border border-edge-deep/80 bg-surface-deep shadow-sm lg:grid-cols-[0.9fr_1.1fr]"
        >
          <div class="border-b border-edge-deep/80 p-6 sm:p-8 lg:border-b-0 lg:border-r">
            <a routerLink="/customer/bookings" class="chip">
              <span class="material-symbols-outlined text-sm">arrow_back</span>
              Booking
            </a>

            <div class="mt-12">
              <p class="eyebrow">Secure checkout</p>
              <h1 class="mt-2 text-3xl font-black tracking-tight text-on-surface">
                ABA PayWay handoff
              </h1>
              <p class="mt-3 text-sm leading-6 text-on-surface-variant">
                Your booking payment is being prepared with signed checkout details.
              </p>
            </div>

            <div class="mt-8 grid gap-3">
              <div class="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3">
                <span class="material-symbols-outlined text-primary">lock</span>
                <div>
                  <p class="text-sm font-bold text-on-surface">Encrypted payment page</p>
                  <p class="text-xs text-on-surface-variant">Hosted securely by ABA PayWay.</p>
                </div>
              </div>
              <div class="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3">
                <span class="material-symbols-outlined text-secondary">receipt_long</span>
                <div>
                  <p class="text-sm font-bold text-on-surface">Booking status tracked</p>
                  <p class="text-xs text-on-surface-variant">Your trip updates after confirmation.</p>
                </div>
              </div>
              <div class="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3">
                <span class="material-symbols-outlined text-primary">verified_user</span>
                <div>
                  <p class="text-sm font-bold text-on-surface">Verified gateway</p>
                  <p class="text-xs text-on-surface-variant">Payment fields are submitted directly.</p>
                </div>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-center p-6 sm:p-10">
            <div class="w-full max-w-md text-center">
              @if (error()) {
                <div
                  class="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-2xl"
                  style="background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.2);"
                >
                  <span class="material-symbols-outlined text-6xl text-red-400">error</span>
                </div>
                <p class="mb-2 text-[11px] font-black uppercase tracking-widest text-red-400">
                  Checkout unavailable
                </p>
                <h2 class="text-2xl font-black text-on-surface">Payment could not start</h2>
                <p class="mt-3 text-sm leading-6 text-on-surface-variant">{{ error() }}</p>
                <a routerLink="/customer/bookings" class="btn-primary mt-7 px-6 py-2.5 text-sm">
                  <span class="material-symbols-outlined text-lg">arrow_back</span>
                  Back to bookings
                </a>
              } @else {
                <div
                  class="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-2xl animate-pulse-glow"
                  style="background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.22);"
                >
                  <span class="material-symbols-outlined animate-spin text-6xl text-primary">progress_activity</span>
                </div>
                <p class="mb-2 text-[11px] font-black uppercase tracking-widest text-primary">
                  Opening payment
                </p>
                <h2 class="text-2xl font-black text-on-surface">Redirecting to ABA PayWay</h2>
                <p class="mt-3 text-sm leading-6 text-on-surface-variant">
                  This usually takes a moment. Keep this tab open while the secure payment page loads.
                </p>
                <div class="mt-7 flex items-center justify-center gap-2">
                  <span class="h-2 w-8 rounded-full bg-primary"></span>
                  <span class="h-2 w-2 rounded-full bg-white/20"></span>
                  <span class="h-2 w-2 rounded-full bg-white/20"></span>
                </div>
              }
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
})
export class CheckoutComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly payment = inject(PaymentService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly error = signal('');

  ngOnInit(): void {
    // The form POST needs the browser, so skip during server-side rendering.
    if (!isPlatformBrowser(this.platformId)) return;

    const bookingId = this.route.snapshot.paramMap.get('bookingId');
    if (!bookingId) {
      this.error.set('No booking reference was provided.');
      return;
    }

    // Straight to ABA PayWay's hosted checkout, without an in-app method-selection step.
    this.payment.createPaywayForm(bookingId).subscribe({
      next: (payload) => this.submitPaywayForm(payload),
      error: (err) => this.error.set(err.error?.message || 'Unable to start the ABA payment.'),
    });
  }

  /** Build a hidden form from the signed fields and POST it to ABA's checkout. */
  private submitPaywayForm(payload: PaywayForm): void {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = payload.actionUrl;
    form.enctype = 'multipart/form-data';
    form.style.display = 'none';

    for (const [name, value] of Object.entries(payload.fields)) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value ?? '';
      form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();
  }
}
