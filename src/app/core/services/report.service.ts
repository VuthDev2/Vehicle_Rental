import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

const API = 'http://localhost:5001/api';

export interface DashboardResponse {
  summary: {
    totalVehicles: number;
    totalUsers: number;
    totalBookings: number;
    totalRevenue: number;
    bookingsByStatus: { _id: string; count: number }[];
  };
  kpi: { activeRentals: number; avgBooking: number };
  revenueBreakdown: { today: number; thisWeek: number; thisMonth: number; thisYear: number; total: number };
  fleetUtilization: {
    fleet: { type: string; percent: number; total: number }[];
    overallPercent: number;
  };
  customerSegments: { label: string; value: number; percent: number }[];
  paymentMethods: { method: string; total: number; count: number; percentage: number }[];
}

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

  getDashboard() {
    return this.http.get<DashboardResponse>(`${API}/reports/dashboard`);
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
