import { Component, inject, signal, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PaymentService, PaywayForm } from '../../../../core/services/payment.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center p-4" style="background: var(--color-background);">
      <div class="w-full max-w-md rounded-2xl border border-outline-variant/20 bg-surface-container-low p-10 text-center">
        @if (error()) {
          <div class="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
               style="background: rgba(239,68,68,0.1);">
            <span class="material-symbols-outlined text-5xl" style="color: #f87171;">error</span>
          </div>
          <h1 class="text-xl font-bold text-on-surface">Payment could not start</h1>
          <p class="text-sm text-on-surface-variant mt-1 mb-6">{{ error() }}</p>
          <a routerLink="/customer/bookings" class="btn-primary text-sm px-6 py-2.5">Back to My Bookings</a>
        } @else {
          <span class="material-symbols-outlined animate-spin text-5xl text-primary">progress_activity</span>
          <h1 class="text-xl font-bold text-on-surface mt-4">Redirecting to ABA PayWay…</h1>
          <p class="text-sm text-on-surface-variant mt-1">Opening the secure payment page.</p>
        }
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
    // The form POST needs the browser — skip during server-side rendering.
    if (!isPlatformBrowser(this.platformId)) return;

    const bookingId = this.route.snapshot.paramMap.get('bookingId');
    if (!bookingId) {
      this.error.set('No booking reference was provided.');
      return;
    }

    // Straight to ABA PayWay's hosted checkout — no in-app method-selection step.
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
