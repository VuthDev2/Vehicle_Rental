import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

const API = 'http://localhost:5001/api';

export interface SystemHealth {
  server: string;
  database: string;
  api: string;
  storage: number;
  lastBackup: string;
}

export interface ActivityLogEntry {
  _id: string;
  adminName: string;
  action: string;
  resource: string;
  details: string;
  createdAt: string;
}

export interface FleetUtilization {
  fleet: { type: string; percent: number; total: number; booked: number }[];
  overallPercent: number;
}

export interface CustomerSegments {
  segments: { label: string; value: number; percent: number }[];
}

export interface RevenueBreakdown {
  today: number;
  thisWeek: number;
  thisMonth: number;
  thisYear: number;
  total: number;
}

export interface PaymentMethods {
  methods: { method: string; total: number; count: number; percentage: number }[];
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);

  getActivityLog(page = 1, limit = 20) {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get<{ logs: ActivityLogEntry[]; total: number; page: number; totalPages: number }>(
      `${API}/admin/activity-log`,
      { params }
    );
  }

  setMaintenanceMode(enabled: boolean, message?: string) {
    return this.http.put<any>(`${API}/admin/maintenance-mode`, { enabled, message });
  }

  getHealth() {
    return this.http.get<SystemHealth>(`${API}/admin/health`);
  }

  getFleetUtilization() {
    return this.http.get<FleetUtilization>(`${API}/admin/fleet-utilization`);
  }

  getCustomerSegments() {
    return this.http.get<CustomerSegments>(`${API}/admin/customer-segments`);
  }

  getRevenueBreakdown() {
    return this.http.get<RevenueBreakdown>(`${API}/admin/revenue-breakdown`);
  }

  getPaymentMethods() {
    return this.http.get<PaymentMethods>(`${API}/admin/payment-methods`);
  }

  exportData() {
    return this.http.post<any>(`${API}/admin/data/export`, {});
  }

  clearCache() {
    return this.http.post<any>(`${API}/admin/data/clear-cache`, {});
  }
}
