import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <p class="eyebrow">Customer</p>
        <h1>Checkout</h1>
        <p>Complete your payment</p>
      </div>

      @if (success()) {
        <div class="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-16 text-center">
          <div class="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5"
               style="background: rgba(16,185,129,0.08);">
            <span class="material-symbols-outlined text-5xl text-primary">check_circle</span>
          </div>
          <h2 class="text-xl font-bold text-on-surface mb-2">Payment Successful!</h2>
          <p class="text-on-surface-variant text-sm mb-8">Your booking is confirmed.</p>
          <button (click)="router.navigate(['/customer/bookings'])"
                  class="btn-primary text-sm">
            <span class="material-symbols-outlined">receipt_long</span>
            View Bookings
          </button>
        </div>
      } @else {
        <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div class="lg:col-span-3 space-y-6">
            <div class="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-6">
              <h3 class="text-base font-bold text-on-surface mb-5 flex items-center gap-2">
                <span class="material-symbols-outlined text-primary">credit_card</span>
                Payment Method
              </h3>
              <div class="grid grid-cols-2 gap-3">
                @for (m of methods; track m.value) {
                  <button (click)="selectedMethod.set(m.value)"
                    [class]="selectedMethod() === m.value
                      ? 'rounded-xl border-2 border-primary bg-primary/10 p-4 text-left transition-all'
                      : 'rounded-xl border border-outline-variant/20 bg-surface-container-high p-4 text-left hover:border-outline-variant/60 transition-all'">
                    <span class="material-symbols-outlined text-2xl text-on-surface-variant block mb-2">{{ m.icon }}</span>
                    <span class="text-sm font-bold text-on-surface">{{ m.label }}</span>
                  </button>
                }
              </div>
            </div>

            <div class="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-6">
              <h3 class="text-base font-bold text-on-surface mb-5 flex items-center gap-2">
                <span class="material-symbols-outlined text-primary">info</span>
                Payment Details
              </h3>
              <form [formGroup]="form" class="flex flex-col gap-4">
                <div>
                  <label class="mb-1.5 block text-sm font-semibold text-on-surface-variant">Name on Card</label>
                  <input type="text" formControlName="name"
                    class="w-full rounded-xl border border-outline-variant/50 bg-surface-container-high py-2.5 px-4 text-on-surface placeholder:text-outline/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
                <div>
                  <label class="mb-1.5 block text-sm font-semibold text-on-surface-variant">Card Number</label>
                  <input type="text" formControlName="cardNumber" maxlength="19" placeholder="1234 5678 9012 3456"
                    class="w-full rounded-xl border border-outline-variant/50 bg-surface-container-high py-2.5 px-4 text-on-surface placeholder:text-outline/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="mb-1.5 block text-sm font-semibold text-on-surface-variant">Expiry</label>
                    <input type="text" formControlName="expiry" placeholder="MM/YY"
                      class="w-full rounded-xl border border-outline-variant/50 bg-surface-container-high py-2.5 px-4 text-on-surface placeholder:text-outline/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                  </div>
                  <div>
                    <label class="mb-1.5 block text-sm font-semibold text-on-surface-variant">CVV</label>
                    <input type="text" formControlName="cvv" maxlength="4" placeholder="123"
                      class="w-full rounded-xl border border-outline-variant/50 bg-surface-container-high py-2.5 px-4 text-on-surface placeholder:text-outline/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div class="lg:col-span-2">
            <div class="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-6 sticky top-24">
              <h3 class="text-base font-bold text-on-surface mb-5 flex items-center gap-2">
                <span class="material-symbols-outlined text-primary">receipt</span>
                Summary
              </h3>
              <div class="flex flex-col gap-3 text-sm">
                <div class="flex justify-between">
                  <span class="text-on-surface-variant">Subtotal</span>
                  <span class="font-semibold text-on-surface">\${{ summary().subtotal }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-on-surface-variant">Service Fee</span>
                  <span class="font-semibold text-on-surface">\${{ summary().serviceFee }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-on-surface-variant">Deposit</span>
                  <span class="font-semibold text-on-surface">\${{ summary().deposit }}</span>
                </div>
                <div class="section-divider my-1"></div>
                <div class="flex justify-between text-base">
                  <span class="font-bold text-on-surface">Total</span>
                  <span class="font-black text-secondary">\${{ summary().total }}</span>
                </div>
              </div>

              @if (error()) {
                <div class="mt-5 flex items-center gap-2 rounded-xl p-3 text-sm"
                     style="background: rgba(239,68,68,0.08); color: #f87171;">
                  <span class="material-symbols-outlined text-lg">error</span>
                  {{ error() }}
                </div>
              }

              <button (click)="pay()" [disabled]="submitting()"
                class="btn-primary w-full mt-6 py-3.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                @if (submitting()) {
                  <span class="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                  Processing...
                } @else {
                  <span class="material-symbols-outlined text-lg">lock</span>
                  Pay \${{ summary().total }} Securely
                }
              </button>

              <p class="text-xs text-outline text-center mt-4 flex items-center justify-center gap-1">
                <span class="material-symbols-outlined text-sm">lock</span>
                Secured with 256-bit encryption
              </p>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class CheckoutComponent {
  private readonly fb = inject(FormBuilder);
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);

  readonly selectedMethod = signal('Card');
  readonly submitting = signal(false);
  readonly success = signal(false);
  readonly error = signal('');

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    cardNumber: ['', Validators.required],
    expiry: ['', Validators.required],
    cvv: ['', Validators.required],
  });

  readonly methods = [
    { value: 'Card', label: 'Credit / Debit', icon: 'credit_card' },
    { value: 'ABA Pay', label: 'ABA Pay', icon: 'smartphone' },
    { value: 'Wing', label: 'Wing', icon: 'mobile_friendly' },
    { value: 'PayPal', label: 'PayPal', icon: 'account_balance' },
    { value: 'Cash', label: 'Cash', icon: 'payments' },
  ];

  readonly summary = signal({ subtotal: 240, serviceFee: 12, deposit: 50, total: 302 });

  pay(): void {
    if (!this.selectedMethod()) {
      this.error.set('Please select a payment method.');
      return;
    }
    this.submitting.set(true);
    this.error.set('');
    setTimeout(() => {
      this.submitting.set(false);
      this.success.set(true);
    }, 2000);
  }
}
