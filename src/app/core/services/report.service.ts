import { environment } from '../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

const API = environment.apiUrl;

export interface DashboardResponse {
  summary: { totalVehicles: number; totalUsers: number; totalBookings: number; totalRevenue: number; bookingsByStatus: { _id: string; count: number }[] };
  kpi: { activeRentals: number; avgBooking: number };
  revenueBreakdown: { today: number; thisWeek: number; thisMonth: number; thisYear: number; total: number };
  fleetUtilization: { fleet: { type: string; percent: number; total: number }[]; overallPercent: number };
  customerSegments: { label: string; value: number; percent: number }[];
  paymentMethods: { method: string; total: number; count: number; percentage: number }[];
}

export interface CategoryRevenue {
  category: string; totalRevenue: number; totalBookings: number; vehicleCount: number; avgRevenuePerBooking: number; percentage: number;
}

export interface BookingDetail {
  _id: string;
  customer: { name: string; email: string; phone?: string };
  vehicle: { name: string; brand: string; type: string; image: string | null };
  startDate: string; endDate: string; rentalType: string; durationUnits: number;
  status: string; paymentStatus: string; totalPrice: number; amountPaid: number; discount?: number; createdAt: string;
}

export interface MonthlyRevenue {
  year: number; month: number; label: string; revenue: number; transactions: number; bookings: number; completed: number; cancelled: number;
}

export interface OwnerSummary {
  revenueThisMonth: number; revenueThisYear: number; grossProfit: number; netProfit: number;
  occupancyRate: number; totalBookings: number; bookingsThisMonth: number;
  completedBookings: number; cancelledBookings: number; cancellationRate: number;
  avgRating: number; reviewCount: number; activeVehicles: number; totalVehicles: number;
  rentedVehicles: number; pendingIssues: number; revenueGrowth: number; bookingGrowth: number;
}

export interface FleetVehicle {
  _id: string; name: string; brand: string; type: string; image: string | null;
  available: boolean; rating: number; trips: number; totalBookings: number;
  completedBookings: number; cancelledBookings: number; revenue: number;
  issues: number; avgRating: number; utilization: number; status: 'available' | 'rented' | 'maintenance';
}

export interface BookingAnalytics {
  total: number; completed: number; cancelled: number; pending: number; active: number;
  cancellationRate: number; completionRate: number; avgDuration: number;
  peakDays: { day: string; count: number }[];
  rentalTypes: { type: string; count: number }[];
  monthlyTrend: { label: string; total: number; completed: number; cancelled: number; revenue: number }[];
}

export interface CustomerInsights {
  avgRating: number; reviewCount: number; repeatRate: number; totalCustomers: number;
  topCustomers: { name: string; email: string; spending: number; bookings: number }[];
  recentReviews: { customerName: string; vehicleName: string; rating: number; comment: string; date: string }[];
  ratingDist: { star: number; count: number }[];
}

export interface VehicleRevenue {
  _id: string; name: string; brand: string; type: string; image: string | null;
  revenue: number; bookings: number; avgPerBooking: number; rating: number;
}

export interface ExpenseItem {
  _id?: string;
  category: string;
  amount: number;
  color: string;
  description?: string;
  vehicleId?: any;
  createdAt?: string;
  createdBy?: string;
}

export interface ExpenseSummary {
  category: string;
  total: number;
  count: number;
  color: string;
}

export interface ExpenseResponse {
  expenses: ExpenseItem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  summary: ExpenseSummary[];
  grandTotal: number;
}

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly http = inject(HttpClient);

  getSummary() { return this.http.get<any>(`${API}/reports/summary`); }
  getDashboard() { return this.http.get<DashboardResponse>(`${API}/reports/dashboard`); }
  getRevenue(months = 6) {
    const params = new HttpParams().set('months', months);
    return this.http.get<{ revenue: { _id: { year: number; month: number }; total: number; count: number }[] }>(`${API}/reports/revenue`, { params });
  }
  getRevenueMonthly(months = 12) {
    const params = new HttpParams().set('months', months);
    return this.http.get<{ months: MonthlyRevenue[] }>(`${API}/reports/revenue-monthly`, { params });
  }
  getPopularVehicles() { return this.http.get<{ vehicles: any[] }>(`${API}/reports/popular-vehicles`); }
  getCategoryRevenue() { return this.http.get<{ categories: CategoryRevenue[]; grandTotal: number }>(`${API}/reports/category-revenue`); }
  getCategoryDetails(type: string, page = 1, limit = 20) {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get<{ bookings: BookingDetail[]; total: number; page: number; limit: number; pages: number }>(`${API}/reports/category-details/${encodeURIComponent(type)}`, { params });
  }
  getBookingStatusDetails(status: string, page = 1, limit = 20) {
    const params = new HttpParams().set('status', status).set('page', page).set('limit', limit);
    return this.http.get<{ bookings: BookingDetail[]; total: number; page: number; limit: number; pages: number }>(`${API}/reports/booking-status-details`, { params });
  }
  getOwnerSummary() { return this.http.get<OwnerSummary>(`${API}/reports/owner-summary`); }
  getFleetPerformance() { return this.http.get<{ vehicles: FleetVehicle[] }>(`${API}/reports/fleet-performance`); }
  getBookingAnalytics() { return this.http.get<BookingAnalytics>(`${API}/reports/booking-analytics`); }
  getCustomerInsights() { return this.http.get<CustomerInsights>(`${API}/reports/customer-insights`); }
  getRevenueByVehicle() { return this.http.get<{ vehicles: VehicleRevenue[] }>(`${API}/reports/revenue-by-vehicle`); }

  // Expenses
  getExpenses(page = 1, limit = 50, category = 'all') {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (category !== 'all') params = params.set('category', category);
    return this.http.get<ExpenseResponse>(`${API}/reports/expenses`, { params });
  }
  addExpense(data: { category: string; amount: number; color?: string; description?: string; vehicleId?: string; date?: string }) {
    return this.http.post<{ expense: ExpenseItem }>(`${API}/reports/expenses`, data);
  }
  updateExpenseEntry(id: string, data: Partial<ExpenseItem>) {
    return this.http.put<{ expense: ExpenseItem }>(`${API}/reports/expenses/${id}`, data);
  }
  deleteExpense(id: string) { return this.http.delete(`${API}/reports/expenses/${id}`); }
}
