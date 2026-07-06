import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Booking, BookingStatus } from '../../models/booking.model';

const API = 'http://localhost:5001/api';

export interface BookingListResponse {
  bookings: Booking[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CreateBookingPayload {
  vehicleId: string;
  startDate: string;
  endDate: string;
  rentalType: string;
  quantity: number;
  notes?: string;
  promoCode?: string;
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly http = inject(HttpClient);

  getBookings(status?: string, page = 1, limit = 20) {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (status) params = params.set('status', status);
    return this.http.get<BookingListResponse>(`${API}/bookings`, { params });
  }

  getBooking(id: string) {
    return this.http.get<{ booking: Booking }>(`${API}/bookings/${id}`);
  }

  createBooking(payload: CreateBookingPayload) {
    return this.http.post<{ booking: Booking }>(`${API}/bookings`, payload);
  }

  cancelBooking(id: string) {
    return this.http.patch<{ booking: Booking }>(`${API}/bookings/${id}/cancel`, {});
  }

  updateBookingStatus(id: string, status: BookingStatus) {
    return this.http.patch<{ booking: Booking }>(`${API}/bookings/${id}/status`, { status });
  }
}
