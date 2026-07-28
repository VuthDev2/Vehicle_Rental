import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Payment } from '../../models/payment.model';

const API = 'http://localhost:5001/api';

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

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly http = inject(HttpClient);

  getPayments(page = 1, limit = 20) {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get<PaymentListResponse>(`${API}/payments`, { params });
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
