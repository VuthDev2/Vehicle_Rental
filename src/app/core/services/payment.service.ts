import { environment } from '../../../environments/environment';

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, of } from 'rxjs';
import { Payment } from '../../models/payment.model';

const API = environment.apiUrl;

export interface PaymentListResponse {
  payments: Payment[];
  total: number;
  page: number;
  totalPages: number;
}

export interface PaywayForm {
  actionUrl: string;
  fields: Record<string, string>;
}

export interface PaywayQr {
  tranId: string;
  bookingId: string;
  amount: number;
  qrImage: string;
  qrString: string;
}

const SAMPLE_PAYMENTS: Payment[] = [
  {
    _id: 'sample-pay-1001',
    bookingId: {
      _id: 'sample-booking-7001',
      rentalType: 'day',
      startDate: '2026-08-18',
      endDate: '2026-08-21',
      totalPrice: 327,
      vehicleId: { name: 'Tesla Model Y Long Range' },
    },
    userId: { _id: 'sample-user-1', name: 'Maya Chen', email: 'maya.chen@example.com' },
    amount: 327,
    method: 'ABA Pay',
    status: 'succeeded',
    transactionId: 'ABA-20260816-1001',
    notes: 'Sample successful ABA payment for UI testing.',
    createdAt: '2026-08-16T09:35:00Z',
  },
  {
    _id: 'sample-pay-1002',
    bookingId: {
      _id: 'sample-booking-7002',
      rentalType: 'day',
      startDate: '2026-08-22',
      endDate: '2026-08-24',
      totalPrice: 184,
      vehicleId: { name: 'BMW 330i Sport' },
    },
    userId: { _id: 'sample-user-2', name: 'Jordan Lee', email: 'jordan.lee@example.com' },
    amount: 184,
    method: 'ABA Pay',
    status: 'pending',
    transactionId: 'ABA-20260815-2048',
    notes: 'Sample pending ABA QR payment.',
    createdAt: '2026-08-15T14:12:00Z',
  },
  {
    _id: 'sample-pay-1003',
    bookingId: {
      _id: 'sample-booking-7003',
      rentalType: 'week',
      startDate: '2026-08-01',
      endDate: '2026-08-08',
      totalPrice: 650,
      vehicleId: { name: 'Toyota Corolla Hybrid' },
    },
    userId: { _id: 'sample-user-3', name: 'Sokha Kim', email: 'sokha.kim@example.com' },
    amount: 650,
    method: 'ABA Pay',
    status: 'refunded',
    transactionId: 'ABA-20260802-4419',
    notes: 'Sample refunded ABA QR payment.',
    createdAt: '2026-08-02T03:45:00Z',
  },
  {
    _id: 'sample-pay-1004',
    bookingId: {
      _id: 'sample-booking-7004',
      rentalType: 'day',
      startDate: '2026-07-29',
      endDate: '2026-07-30',
      totalPrice: 135,
      vehicleId: { name: 'Ford Transit Passenger' },
    },
    userId: { _id: 'sample-user-4', name: 'Alex Rivera', email: 'alex.rivera@example.com' },
    amount: 135,
    method: 'ABA Pay',
    status: 'failed',
    transactionId: 'ABA-20260729-0087',
    notes: 'Sample failed ABA QR payment.',
    createdAt: '2026-07-29T11:20:00Z',
  },
  {
    _id: 'sample-pay-1005',
    bookingId: {
      _id: 'sample-booking-7005',
      rentalType: 'month',
      startDate: '2026-07-01',
      endDate: '2026-08-01',
      totalPrice: 2000,
      vehicleId: { name: 'BMW 330i Sport' },
    },
    userId: { _id: 'sample-user-5', name: 'Nita Vann', email: 'nita.vann@example.com' },
    amount: 2000,
    method: 'ABA Pay',
    status: 'succeeded',
    transactionId: 'ABA-20260701-8192',
    notes: 'Sample completed monthly ABA QR payment.',
    createdAt: '2026-07-01T08:05:00Z',
  },
];

function samplePaymentResponse(page: number, limit: number): PaymentListResponse {
  const start = (page - 1) * limit;
  const payments = SAMPLE_PAYMENTS.slice(start, start + limit);
  return {
    payments,
    total: SAMPLE_PAYMENTS.length,
    page,
    totalPages: Math.max(1, Math.ceil(SAMPLE_PAYMENTS.length / limit)),
  };
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly http = inject(HttpClient);

  getPayments(page = 1, limit = 20) {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get<PaymentListResponse>(`${API}/payments`, { params }).pipe(
      map((res) => {
        if (environment.production || res.payments.length > 0) return res;
        return samplePaymentResponse(page, limit);
      }),
      catchError((err) => {
        if (environment.production) throw err;
        return of(samplePaymentResponse(page, limit));
      })
    );
  }

  createPayment(bookingId: string, method: string) {
    return this.http.post<{ payment: Payment }>(`${API}/payments`, { bookingId, method });
  }

  /** Ask the backend for a signed ABA PayWay purchase form for a booking. */
  createPaywayForm(bookingId: string) {
    return this.http.post<PaywayForm>(`${API}/payments/payway/create`, { bookingId });
  }

  /** Generate an ABA KHQR for a booking to display in-app. */
  createPaywayQr(bookingId: string) {
    return this.http.post<PaywayQr>(`${API}/payments/payway/qr`, { bookingId });
  }

  /** Demo/manual confirmation — mark a PayWay transaction as paid. */
  markPaywayPaid(tranId: string) {
    return this.http.post<{ paid: boolean }>(`${API}/payments/payway/mark-paid`, { tranId });
  }

  /** Reconcile a PayWay transaction after the success redirect. */
  confirmPayway(tranId: string) {
    return this.http.post<{ paid: boolean }>(`${API}/payments/payway/confirm`, { tranId });
  }
}
