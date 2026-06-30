import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { CustomerLayoutComponent } from './layouts/customer-layout/customer-layout.component';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent) },
      { path: 'vehicles', loadComponent: () => import('./features/vehicles/vehicle-list/vehicle-list.component').then((m) => m.VehicleListComponent) },
      { path: 'vehicles/:id', loadComponent: () => import('./features/vehicles/vehicle-details/vehicle-details.component').then((m) => m.VehicleDetailsComponent) },
      { path: 'about', loadComponent: () => import('./features/simple-page/simple-page.component').then((m) => m.SimplePageComponent), data: { title: 'About', body: 'A complete rental workflow prototype for browsing vehicles, booking trips, payments, and operations dashboards.' } },
      { path: 'contact', loadComponent: () => import('./features/simple-page/simple-page.component').then((m) => m.SimplePageComponent), data: { title: 'Contact', body: 'Reach the rental team for fleet questions, support, booking changes, and partnership requests.' } },
      { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent) },
      { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then((m) => m.RegisterComponent) },
    ],
  },
  {
    path: 'customer',
    component: CustomerLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/bookings/my-bookings/my-bookings.component').then((m) => m.MyBookingsComponent) },
      { path: 'bookings', loadComponent: () => import('./features/bookings/my-bookings/my-bookings.component').then((m) => m.MyBookingsComponent) },
      { path: 'profile', loadComponent: () => import('./features/profile/profile/profile.component').then((m) => m.ProfileComponent) },
      { path: 'favorites', loadComponent: () => import('./features/simple-page/simple-page.component').then((m) => m.SimplePageComponent), data: { title: 'Favorites', body: 'Favorite vehicles are ready to connect to the vehicle catalog once the backend is added.' } },
      { path: 'payments', loadComponent: () => import('./features/payments/payment-history/payment-history.component').then((m) => m.PaymentHistoryComponent) },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard, adminGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then((m) => m.AdminDashboardComponent) },
      { path: 'vehicles', loadComponent: () => import('./features/admin/manage-vehicles/manage-vehicles.component').then((m) => m.ManageVehiclesComponent) },
      { path: 'users', loadComponent: () => import('./features/admin/manage-users/manage-users.component').then((m) => m.ManageUsersComponent) },
      { path: 'bookings', loadComponent: () => import('./features/admin/manage-bookings/manage-bookings.component').then((m) => m.ManageBookingsComponent) },
      { path: 'reports', loadComponent: () => import('./features/admin/reports/reports.component').then((m) => m.ReportsComponent) },
      { path: 'settings', loadComponent: () => import('./features/simple-page/simple-page.component').then((m) => m.SimplePageComponent), data: { title: 'Settings', body: 'Configure business rules, cancellation windows, taxes, locations, and notification templates.' } },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  { path: '**', redirectTo: '' },
];
