import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { CustomerLayoutComponent } from './layouts/customer-layout/customer-layout.component';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent) },
      { path: 'vehicles', canActivate: [authGuard], loadComponent: () => import('./features/user/vehicles/vehicle-list/vehicle-list.component').then((m) => m.VehicleListComponent) },
      { path: 'vehicles/:id', canActivate: [authGuard], loadComponent: () => import('./features/user/vehicles/vehicle-details/vehicle-details.component').then((m) => m.VehicleDetailsComponent) },
      { path: 'about', loadComponent: () => import('./features/simple-page/simple-page.component').then((m) => m.SimplePageComponent), data: { title: 'About Us', body: 'Cambo Rent offers premium vehicle rental services across Cambodia. Enjoy hassle-free online bookings, flexible durations (hourly, daily, weekly, monthly, yearly), and 24/7 concierge delivery services.' } },
      { path: 'contact', loadComponent: () => import('./features/simple-page/simple-page.component').then((m) => m.SimplePageComponent), data: { title: 'Contact Us', body: 'Get in touch with Cambo Rent. Reach our support desk at support@camborent.com, call us at +855 12 345 678, or visit our central hub in Phnom Penh.' } },
    ],
  },
  { path: 'login', canActivate: [guestGuard], loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent) },
  { path: 'register', canActivate: [guestGuard], loadComponent: () => import('./features/auth/register/register.component').then((m) => m.RegisterComponent) },
  { path: 'forgot-password', canActivate: [guestGuard], loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then((m) => m.ForgotPasswordComponent) },
  { path: 'reset-password/:token', canActivate: [guestGuard], loadComponent: () => import('./features/auth/reset-password/reset-password.component').then((m) => m.ResetPasswordComponent) },
  // Verification is authenticated by email + code (not the session), so it stays open to all users.
  { path: 'verify-email', loadComponent: () => import('./features/auth/verify-email/verify-email.component').then((m) => m.VerifyEmailComponent) },
  {
    path: 'customer',
    component: CustomerLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/user/dashboard/dashboard.component').then((m) => m.DashboardComponent) },
      { path: 'bookings', loadComponent: () => import('./features/user/bookings/my-bookings/my-bookings.component').then((m) => m.MyBookingsComponent) },
      { path: 'explore', loadComponent: () => import('./features/user/vehicles/vehicle-list/vehicle-list.component').then((m) => m.VehicleListComponent) },
      { path: 'explore/:id', loadComponent: () => import('./features/user/vehicles/vehicle-details/vehicle-details.component').then((m) => m.VehicleDetailsComponent) },
      { path: 'profile', loadComponent: () => import('./features/user/profile/profile.component').then((m) => m.ProfileComponent) },
      { path: 'payments', loadComponent: () => import('./features/user/payments/payment-history/payment-history.component').then((m) => m.PaymentHistoryComponent) },
      { path: 'checkout/:bookingId', loadComponent: () => import('./features/user/payments/checkout/checkout.component').then((m) => m.CheckoutComponent) },
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
      { path: 'payments', loadComponent: () => import('./features/admin/manage-payments/manage-payments.component').then((m) => m.ManagePaymentsComponent) },
      { path: 'promotions', loadComponent: () => import('./features/admin/manage-promotions/manage-promotions.component').then((m) => m.ManagePromotionsComponent) },
      { path: 'reports', loadComponent: () => import('./features/admin/reports/reports.component').then((m) => m.ReportsComponent) },
      { path: 'settings', loadComponent: () => import('./features/admin/manage-settings/manage-settings.component').then((m) => m.ManageSettingsComponent) },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  { path: '**', redirectTo: '' },
];
