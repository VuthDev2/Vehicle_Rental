import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

const API = 'http://localhost:5001/api';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly http = inject(HttpClient);

  getSummary() {
    return this.http.get<{
      totalVehicles: number;
      totalUsers: number;
      totalBookings: number;
      totalRevenue: number;
      bookingsByStatus: { _id: string; count: number }[];
    }>(`${API}/reports/summary`);
  }

  getRevenue(months = 6) {
    const params = new HttpParams().set('months', months);
    return this.http.get<{ revenue: { _id: { year: number; month: number }; total: number; count: number }[] }>(
      `${API}/reports/revenue`,
      { params }
    );
  }

  getPopularVehicles() {
    return this.http.get<{
      vehicles: { _id: string; name: string; brand: string; type: string; images: string[]; count: number; revenue: number }[];
    }>(`${API}/reports/popular-vehicles`);
  }
}
