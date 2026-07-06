import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Review } from '../../models/review.model';

const API = 'http://localhost:5001/api';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly http = inject(HttpClient);

  getVehicleReviews(vehicleId: string) {
    return this.http.get<{ reviews: Review[] }>(`${API}/reviews/vehicle/${vehicleId}`);
  }

  createReview(bookingId: string, rating: number, comment: string) {
    return this.http.post<{ review: Review }>(`${API}/reviews`, { bookingId, rating, comment });
  }

  deleteReview(id: string) {
    return this.http.delete<{ message: string }>(`${API}/reviews/${id}`);
  }
}
