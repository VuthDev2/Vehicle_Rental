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
}
