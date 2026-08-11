import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BookingService } from '../../../../core/services/booking.service';
import { PaymentService } from '../../../../core/services/payment.service';
import { Booking } from '../../../../models/booking.model';

const REFUNDABLE_DEPOSIT = 50;

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, RouterLink],
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly bookingService = inject(BookingService);
  private readonly paymentService = inject(PaymentService);

  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);

  readonly selectedMethod = signal('Card');
  readonly submitting = signal(false);
  readonly success = signal(false);
  readonly error = signal('');

  readonly booking = signal<Booking | null>(null);
  readonly loading = signal(true);
  readonly loadError = signal('');

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    cardNumber: ['', Validators.required],
    expiry: ['', Validators.required],
    cvv: ['', Validators.required],
  });

  readonly methods = [
    { value: 'Card', label: 'Credit / Debit', icon: 'credit_card', color: '#3b82f6' },
    { value: 'ABA Pay', label: 'ABA Pay', icon: 'smartphone', color: '#8b5cf6' },
    { value: 'Wing', label: 'Wing', icon: 'mobile_friendly', color: '#ec4899' },
    { value: 'PayPal', label: 'PayPal', icon: 'account_balance', color: '#0ea5e9' },
    { value: 'Cash', label: 'Cash', icon: 'payments', color: '#10b981' },
  ];

  readonly summary = computed(() => {
    const b = this.booking();
    if (!b) return { subtotal: 0, deposit: REFUNDABLE_DEPOSIT, total: 0 };
    // The backend records exactly booking.totalPrice, so that is the amount charged today.
    const subtotal = Number(b.totalPrice) || 0;
    return { subtotal, deposit: REFUNDABLE_DEPOSIT, total: subtotal };
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('bookingId');
    if (!id) {
      this.loading.set(false);
      this.loadError.set('No booking reference was provided.');
      return;
    }
    this.bookingService.getBooking(id).subscribe({
      next: (res) => {
        this.booking.set(res.booking);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.loadError.set(err.error?.message || 'Unable to load this booking.');
      },
    });
  }

  get vehicleName(): string {
    const v = this.booking()?.vehicleId as any;
    return typeof v === 'object' && v?.name ? v.name : 'Vehicle';
  }

  get vehicleImage(): string {
    const v = this.booking()?.vehicleId as any;
    return typeof v === 'object' && v?.images?.[0] ? v.images[0] : '';
  }

  get rentalTypeLabel(): string {
    const type = this.booking()?.rentalType;
    const labels: Record<string, string> = { hour: 'Hourly', day: 'Daily', week: 'Weekly', month: 'Monthly', year: 'Yearly' };
    return labels[type ?? ''] || (type || '');
  }

  pay(): void {
    if (this.submitting()) return;

    const booking = this.booking();
    if (!booking) return;
    if (!this.selectedMethod()) {
      this.error.set('Please select a payment method.');
      return;
    }
    if (this.selectedMethod() === 'Card' && this.form.invalid) {
      this.error.set('Please complete the card details.');
      return;
    }

    this.submitting.set(true);
    this.error.set('');

    this.paymentService.createPayment(booking._id, this.selectedMethod()).subscribe({
      next: () => {
        this.submitting.set(false);
        this.success.set(true);
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(err.error?.message || 'Payment failed. Please try again.');
      },
    });
  }
}
