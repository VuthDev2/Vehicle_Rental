import { Component, inject, signal, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { PaymentService, PaywayForm } from '../../../../core/services/payment.service';
import { BookingService } from '../../../../core/services/booking.service';
import { Booking } from '../../../../models/booking.model';
import { UserService } from '../../../../core/services/user.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  template: `
    <div class="min-h-screen p-4 sm:p-6" style="background: var(--color-bg-deep);">
      <div class="mx-auto flex min-h-[calc(100vh-48px)] w-full max-w-5xl items-center">
        <section class="grid w-full overflow-hidden rounded-2xl border border-edge-deep/80 bg-surface-deep shadow-sm lg:grid-cols-[0.9fr_1.1fr]">
          <div class="border-b border-edge-deep/80 p-6 sm:p-8 lg:border-b-0 lg:border-r">
            <a routerLink="/customer/bookings" class="chip">
              <span class="material-symbols-outlined text-sm">arrow_back</span>
              Booking
            </a>

            <div class="mt-12">
              <p class="eyebrow">Secure checkout</p>
              <h1 class="mt-2 text-3xl font-black tracking-tight text-on-surface">
                Payment Options
              </h1>
              <p class="mt-3 text-sm leading-6 text-on-surface-variant">
                Choose how you want to pay for your booking today.
              </p>
            </div>

            @if (booking()) {
              @if (booking()!.rentalType === 'month' || booking()!.rentalType === 'year') {
                <div class="mt-6 rounded-xl border border-orange-500/30 bg-orange-500/10 p-4">
                  <div class="flex items-start gap-3">
                    <span class="material-symbols-outlined text-orange-500">shield_person</span>
                    <div>
                      <h3 class="font-bold text-orange-500">In-Store Verification Required</h3>
                      <p class="mt-1 text-sm text-on-surface-variant">For long-term rentals (monthly/yearly), physical presence with ID verification is required. Pay the deposit online to secure the booking, then visit our store to finalize the contract.</p>
                    </div>
                  </div>
                </div>
              }

              <div class="mt-8 grid gap-4">
                @if (!idVerified()) {
                  <div class="rounded-xl border border-blue-500/30 bg-blue-500/10 p-5 text-center">
                    <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
                      <span class="material-symbols-outlined text-3xl">badge</span>
                    </div>
                    <h3 class="text-lg font-bold text-on-surface">Identity Verification Required</h3>
                    <p class="mt-2 text-sm text-on-surface-variant">
                      To ensure security, please verify your identity by uploading a valid driver's license or passport.
                    </p>
                    <div class="mt-5 relative w-full max-w-[200px] mx-auto">
                      <input 
                        type="file" 
                        (change)="uploadIdDocument($event)" 
                        accept="image/jpeg, image/png, image/webp"
                        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        [disabled]="isVerifyingId()"
                      />
                      <button
                        type="button"
                        [disabled]="isVerifyingId()"
                        class="btn-primary px-6 py-2.5 text-sm w-full"
                      >
                        @if (isVerifyingId()) {
                          <span class="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                          <span>Uploading...</span>
                        } @else {
                          <span class="material-symbols-outlined text-lg">upload_file</span>
                          <span>Upload ID Document</span>
                        }
                      </button>
                    </div>
                  </div>
                } @else {
                  <div class="rounded-xl border border-green-500/30 bg-green-500/10 p-4 mb-4 flex items-center gap-3">
                    <span class="material-symbols-outlined text-green-500">verified</span>
                    <div>
                      <h3 class="font-bold text-green-500">Identity Verified</h3>
                      <p class="text-xs text-green-500/80">You can now proceed with the payment.</p>
                    </div>
                  </div>

                  <div class="mb-4 rounded-xl border border-edge-deep bg-white/[0.02] p-1 flex items-center">
                    <button 
                      (click)="paymentMethod.set('khqr')"
                      [class]="paymentMethod() === 'khqr' ? 'bg-primary text-white shadow-sm' : 'text-on-surface hover:bg-white/[0.04]'"
                      class="flex-1 rounded-lg py-2.5 text-sm font-bold transition-all"
                    >
                      ABA KHQR (Recommended)
                    </button>
                    <button 
                      (click)="paymentMethod.set('hosted')"
                      [class]="paymentMethod() === 'hosted' ? 'bg-primary text-white shadow-sm' : 'text-on-surface hover:bg-white/[0.04]'"
                      class="flex-1 rounded-lg py-2.5 text-sm font-bold transition-all"
                    >
                      Credit/Debit Card
                    </button>
                  </div>

                  @if (booking()!.rentalType !== 'month' && booking()!.rentalType !== 'year') {
                    <button 
                      (click)="startPayment('full')"
                      [disabled]="isProcessing() || !!qrImage()"
                      class="flex flex-col gap-1 rounded-xl border border-edge-deep bg-white/[0.02] p-5 text-left transition-all hover:bg-white/[0.04] disabled:opacity-50"
                    >
                      <div class="flex items-center justify-between w-full">
                        <span class="font-bold text-on-surface">Pay Full Amount</span>
                        <span class="font-black text-primary">{{ booking()!.totalPrice | currency }}</span>
                      </div>
                      <p class="text-sm text-on-surface-variant">Pay everything now for maximum peace of mind.</p>
                    </button>
                  }

                  <button 
                    (click)="startPayment('deposit')"
                    [disabled]="isProcessing() || !!qrImage()"
                    class="flex flex-col gap-1 rounded-xl border border-primary/30 bg-primary/5 p-5 text-left transition-all hover:bg-primary/10 disabled:opacity-50"
                  >
                    <div class="flex items-center justify-between w-full">
                      <span class="font-bold text-on-surface">{{ booking()!.rentalType === 'month' || booking()!.rentalType === 'year' ? 'Pay Reservation Deposit' : 'Pay 50% Deposit' }}</span>
                      <span class="font-black text-primary">{{ booking()!.totalPrice / 2 | currency }}</span>
                    </div>
                    <p class="text-sm text-on-surface-variant">Pay half now to secure it, and pay the rest at pickup.</p>
                  </button>
                }
              </div>
            } @else if (!error()) {
              <div class="mt-8 flex justify-center py-10">
                <span class="material-symbols-outlined animate-spin text-3xl text-on-surface-variant">progress_activity</span>
              </div>
            }
          </div>

          <div class="flex items-center justify-center p-6 sm:p-10">
            <div class="w-full max-w-md text-center">
              @if (qrImage()) {
                <div class="rounded-3xl border border-edge-deep bg-white p-8 shadow-sm">
                  <h3 class="text-xl font-black text-slate-800">Scan to Pay with ABA</h3>
                  <p class="mt-1 text-sm font-bold text-slate-500">Amount: {{ qrAmount() | currency }}</p>
                  
                  <div class="my-6 flex justify-center">
                    <img [src]="'data:image/png;base64,' + qrImage()" alt="ABA KHQR" class="w-64 h-64 rounded-xl border border-slate-200 shadow-sm" />
                  </div>
                  
                  <p class="mb-6 text-xs text-slate-500 px-4">
                    Open your ABA Mobile app or any Bakong-supported app to scan this KHQR code and complete your payment.
                  </p>
                  
                  <button 
                    (click)="confirmPayment()"
                    [disabled]="isProcessing()"
                    class="btn-primary w-full py-3"
                  >
                    @if (isProcessing()) {
                      <span class="material-symbols-outlined animate-spin">progress_activity</span>
                      Checking...
                    } @else {
                      I have paid
                    }
                  </button>
                  
                  <button 
                    (click)="qrImage.set('')"
                    [disabled]="isProcessing()"
                    class="mt-3 w-full text-sm font-bold text-slate-500 hover:text-slate-800 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              } @else if (error()) {
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
              } @else if (isProcessing() && paymentMethod() === 'hosted') {
                <div
                  class="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-2xl animate-pulse-glow"
                  style="background: rgba(123,160,91,0.12); border: 1px solid rgba(123,160,91,0.22);"
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
              } @else {
                <div
                  class="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-2xl"
                  style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05);"
                >
                  <span class="material-symbols-outlined text-6xl text-on-surface-variant">account_balance_wallet</span>
                </div>
                <h2 class="text-xl font-black text-on-surface">Ready to Checkout</h2>
                <p class="mt-3 text-sm leading-6 text-on-surface-variant">
                  Select a payment option on the left to proceed with {{ paymentMethod() === 'khqr' ? 'an in-app ABA KHQR' : 'our secure ABA PayWay portal' }}.
                </p>
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
  private readonly router = inject(Router);
  private readonly payment = inject(PaymentService);
  private readonly bookingService = inject(BookingService);
  private readonly userService = inject(UserService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly error = signal('');
  readonly isProcessing = signal(false);
  readonly booking = signal<Booking | null>(null);
  readonly idVerified = signal(false);
  readonly isVerifyingId = signal(false);
  
  readonly paymentMethod = signal<'khqr' | 'hosted'>('khqr');
  readonly qrImage = signal('');
  readonly qrString = signal('');
  readonly tranId = signal('');
  readonly qrAmount = signal(0);

  uploadIdDocument(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    this.isVerifyingId.set(true);
    this.error.set('');

    this.userService.uploadIdDocument(file).subscribe({
      next: (res) => {
        this.isVerifyingId.set(false);
        this.idVerified.set(true);
      },
      error: (err) => {
        this.isVerifyingId.set(false);
        this.error.set(err.error?.message || 'Failed to upload ID document. Please try again.');
      }
    });
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const bookingId = this.route.snapshot.paramMap.get('bookingId');
    if (!bookingId) {
      this.error.set('No booking reference was provided.');
      return;
    }

    this.bookingService.getBooking(bookingId).subscribe({
      next: (res) => {
        this.booking.set(res.booking);
        if (res.booking.userId && (res.booking.userId as any).idVerified) {
          this.idVerified.set(true);
        }
      },
      error: () => this.error.set('Could not load booking details.')
    });
  }

  startPayment(type: 'full' | 'deposit'): void {
    const bookingId = this.booking()?._id;
    if (!bookingId) return;

    this.isProcessing.set(true);
    this.error.set('');

    if (this.paymentMethod() === 'khqr') {
      this.payment.createPaywayQr(bookingId, type).subscribe({
        next: (payload) => {
          this.qrImage.set(payload.qrImage);
          this.qrString.set(payload.qrString);
          this.tranId.set(payload.tranId);
          this.qrAmount.set(payload.amount);
          this.isProcessing.set(false);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Unable to generate ABA KHQR.');
          this.isProcessing.set(false);
        }
      });
    } else {
      this.payment.createPaywayForm(bookingId, type).subscribe({
        next: (payload) => this.submitPaywayForm(payload),
        error: (err) => {
          this.error.set(err.error?.message || 'Unable to start the ABA payment.');
          this.isProcessing.set(false);
        },
      });
    }
  }

  confirmPayment() {
    const tId = this.tranId();
    if (!tId) return;
    this.isProcessing.set(true);
    
    this.payment.markPaywayPaid(tId).subscribe({
      next: () => {
        this.isProcessing.set(false);
        this.router.navigate(['/customer/payment/return'], { queryParams: { tran_id: tId } });
      },
      error: () => {
        // Even on error during dev demo, we route to return so it can check status again
        this.isProcessing.set(false);
        this.router.navigate(['/customer/payment/return'], { queryParams: { tran_id: tId } });
      }
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
