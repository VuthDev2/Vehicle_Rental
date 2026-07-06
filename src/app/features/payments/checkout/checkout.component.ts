import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { BookingService } from '../../../core/services/booking.service';
import { PaymentService } from '../../../core/services/payment.service';
import { Booking } from '../../../models/booking.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="min-h-screen bg-background pb-16 pt-6">
      <div class="mx-auto max-w-xl px-margin-desktop">
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-on-surface">Checkout</h1>
          <p class="text-sm text-on-surface-variant">Confirm your reservation and payment method</p>
        </div>

        @if (loading()) {
          <div class="animate-pulse rounded-2xl border border-outline-variant/30 bg-surface-container-low p-6 h-64"></div>
        } @else if (booking(); as b) {
          <div class="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-6 shadow-2xl">
            <h3 class="mb-4 text-lg font-bold text-on-surface border-b border-outline-variant/20 pb-2">Booking Summary</h3>
            
            <div class="mb-6 flex flex-col gap-3 text-sm text-on-surface-variant">
              <div class="flex justify-between">
                <span>Start Date:</span>
                <span class="font-semibold text-on-surface">{{ b.startDate | date }}</span>
              </div>
              <div class="flex justify-between">
                <span>End Date:</span>
                <span class="font-semibold text-on-surface">{{ b.endDate | date }}</span>
              </div>
              <div class="flex justify-between">
                <span>Duration:</span>
                <span class="font-semibold text-on-surface">{{ b.quantity }} {{ b.rentalType }}(s)</span>
              </div>
              @if (b.promoCode) {
                <div class="flex justify-between text-green-400">
                  <span>Promo Code ({{ b.promoCode }}):</span>
                  <span>-\${{ b.discount }}</span>
                </div>
              }
              <div class="flex justify-between border-t border-outline-variant/20 pt-3 text-base font-bold text-on-surface">
                <span>Total Cost:</span>
                <span class="text-secondary">\${{ b.totalPrice }}</span>
              </div>
            </div>

            <h3 class="mb-4 text-lg font-bold text-on-surface border-b border-outline-variant/20 pb-2">Select Payment Method</h3>
            
            <div class="grid grid-cols-2 gap-3 mb-6">
              @for (method of methods; track method) {
                <button (click)="selectedMethod.set(method)"
                  [class]="selectedMethod() === method ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant/50 bg-surface-container-high text-on-surface'"
                  class="flex items-center justify-center gap-2 rounded-xl border py-3.5 font-bold transition-all hover:brightness-110">
                  <span class="material-symbols-outlined">account_balance_wallet</span>
                  {{ method }}
                </button>
              }
            </div>

            @if (error()) {
              <div class="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
                {{ error() }}
              </div>
            }

            <button (click)="pay()" [disabled]="submitting()"
              class="w-full rounded-xl bg-primary py-3.5 font-bold text-on-primary shadow-lg shadow-primary/20 hover:brightness-110 disabled:opacity-50 transition-all flex justify-center items-center gap-2">
              @if (submitting()) {
                <span class="material-symbols-outlined animate-spin">progress_activity</span> Processing Payment...
              } @else {
                Confirm & Pay \${{ b.totalPrice }}
              }
            </button>
          </div>
        }
      </div>
    </div>
  `,
})
export class CheckoutComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly bookingService = inject(BookingService);
  private readonly paymentService = inject(PaymentService);

  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly error = signal('');
  readonly booking = signal<Booking | null>(null);

  readonly methods = ['Card', 'PayPal', 'ABA Pay', 'Wing'];
  readonly selectedMethod = signal('Card');

  ngOnInit() {
    const bookingId = this.route.snapshot.paramMap.get('bookingId');
    if (bookingId) {
      this.bookingService.getBooking(bookingId).subscribe({
        next: (res) => {
          this.booking.set(res.booking);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Failed to load booking details.');
          this.loading.set(false);
        },
      });
    }
  }

  pay() {
    if (!this.booking()) return;
    this.submitting.set(true);
    this.error.set('');

    this.paymentService.createPayment(this.booking()!._id, this.selectedMethod()).subscribe({
      next: () => {
        this.router.navigate(['/customer/bookings']);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Payment failed.');
        this.submitting.set(false);
      },
    });
  }
}
