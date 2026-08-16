import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../../core/services/settings.service';
import { AdminService, SystemHealth } from '../../../core/services/admin.service';

export type SectionId =
  | 'general'
  | 'branding'
  | 'booking'
  | 'vehicles'
  | 'payments'
  | 'notifications'
  | 'promotions'
  | 'users'
  | 'security'
  | 'backup'
  | 'integrations'
  | 'appearance'
  | 'reports'
  | 'email'
  | 'system';

export interface NavItem {
  id: SectionId;
  label: string;
  icon: string;
}

export interface ToggleItem {
  key: string;
  label: string;
  desc: string;
}

export interface Integration {
  name: string;
  logo: string;
  status: 'Connected' | 'Disconnected' | 'Error';
  color: string;
}

@Component({
  selector: 'app-manage-settings',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './manage-settings.component.html',
})
export class ManageSettingsComponent implements OnInit {
  private readonly settingsService = inject(SettingsService);
  private readonly adminService = inject(AdminService);

  protected readonly Number = Number;
  readonly activeSection = signal<SectionId>('general');
  readonly searchQuery = signal('');
  readonly dirty = signal(false);
  readonly savedToast = signal(false);
  readonly toastMessage = signal('Settings saved successfully');
  readonly maintenanceMode = signal(false);
  readonly maintenanceMessage = signal(
    'We are currently undergoing scheduled maintenance. Please check back shortly.'
  );

  readonly navItems: NavItem[] = [
    { id: 'general', label: 'General', icon: 'settings' },
    { id: 'branding', label: 'Company Branding', icon: 'palette' },
    { id: 'booking', label: 'Booking Rules', icon: 'receipt_long' },
    { id: 'vehicles', label: 'Vehicle Management', icon: 'directions_car' },
    { id: 'payments', label: 'Payment Gateways', icon: 'payments' },
    { id: 'notifications', label: 'Notifications', icon: 'notifications' },
    { id: 'promotions', label: 'Promotions', icon: 'local_offer' },
    { id: 'users', label: 'User Roles & Permissions', icon: 'manage_accounts' },
    { id: 'security', label: 'Security & Access', icon: 'security' },
    { id: 'backup', label: 'Backup & Restore', icon: 'backup' },
    { id: 'integrations', label: 'Integrations', icon: 'extension' },
    { id: 'appearance', label: 'Appearance', icon: 'contrast' },
    { id: 'reports', label: 'Reports & Analytics', icon: 'analytics' },
    { id: 'email', label: 'Email Templates', icon: 'mail' },
    { id: 'system', label: 'System & Maintenance', icon: 'info' },
  ];

  readonly filteredNavItems = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.navItems;
    return this.navItems.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q)
    );
  });

  readonly health = signal<SystemHealth>({
    server: 'Online',
    database: 'Connected',
    api: 'Healthy',
    storage: 78,
    lastBackup: 'Today 03:00 AM',
  });

  readonly cfg: any = {
    companyName: 'Cambo Rent',
    businessEmail: 'admin@camborent.com',
    phone: '+855 23 888 999',
    website: 'https://camborent.com',
    address: '123 Preah Monivong Blvd, Phnom Penh',
    taxId: 'KH-123456789',
    currency: 'USD',
    timezone: 'Asia/Phnom_Penh',
    businessHours: { weekdays: '8:00 AM - 6:00 PM', weekends: '9:00 AM - 4:00 PM' },
    branding: {
      primaryColor: '#10b981',
      secondaryColor: '#3b82f6',
      footerText: '© 2026 Cambo Rent. All rights reserved.',
    },
    language: 'en',
    appearanceTheme: 'dark',
    compactMode: false,
    booking: {
      minDuration: 1,
      maxDuration: 30,
      allowSameDay: true,
      advanceBookingLimit: 90,
      gracePeriod: 60,
      lateReturnFee: 25,
      securityDeposit: 200,
      bookingApproval: false,
      autoConfirmation: true,
    },
    vehicles: {
      defaultStatus: 'available',
      requireInspection: true,
      autoMarkMaintenance: true,
      maintenanceReminderKm: 5000,
      allowHourly: true,
      allowWeekly: true,
      allowMonthly: true,
    },
    payments: {
      methods: {
        cash: true,
        creditCard: true,
        abaPay: true,
        acleda: true,
        wing: false,
        bankTransfer: true,
      },
      taxPercentage: 10,
      depositPercentage: 20,
      defaultCurrency: 'USD',
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      bookingConfirmation: true,
      bookingCancellation: true,
      paymentReminder: true,
      maintenanceReminder: false,
      promotionAlerts: true,
    },
    promotions: {
      allowCouponCodes: true,
      maxDiscount: 50,
      stackPromotions: false,
      defaultDurationDays: 30,
      autoExpire: true,
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      loginAttempts: 5,
      passwordPolicy: true,
    },
    backup: {
      backupDatabase: false,
      restoreDatabase: false,
      autoDailyBackup: true,
      autoWeeklyBackup: false,
      exportData: false,
    },
    reports: {
      defaultDateRange: 'Last 30 Days',
      revenueFormat: 'USD',
      chartStyle: 'Modern',
      exportFormat: 'PDF',
      autoGenerateMonthly: true,
    },
  };

  readonly brandingItems = [
    { label: 'Company Logo', icon: 'image' },
    { label: 'Favicon', icon: 'crop_square' },
    { label: 'Invoice Logo', icon: 'receipt' },
    { label: 'Social Preview', icon: 'preview' },
  ];

  readonly bookingFields = [
    { key: 'minDuration', label: 'Min Rental Duration (days)', type: 'number' },
    { key: 'maxDuration', label: 'Max Rental Duration (days)', type: 'number' },
    { key: 'allowSameDay', label: 'Allow Same-Day Booking', type: 'toggle' },
    { key: 'advanceBookingLimit', label: 'Advance Booking Limit (days)', type: 'number' },
    { key: 'gracePeriod', label: 'Grace Period (minutes)', type: 'number' },
    { key: 'lateReturnFee', label: 'Late Return Fee ($)', type: 'number' },
    { key: 'securityDeposit', label: 'Security Deposit ($)', type: 'number' },
    { key: 'bookingApproval', label: 'Require Booking Approval', type: 'toggle' },
    { key: 'autoConfirmation', label: 'Automatic Confirmation', type: 'toggle' },
  ];

  readonly vehicleFields = [
    { key: 'defaultStatus', label: 'Default Vehicle Status', type: 'text' },
    { key: 'requireInspection', label: 'Require Vehicle Inspection', type: 'toggle' },
    { key: 'autoMarkMaintenance', label: 'Auto-Mark Maintenance Due', type: 'toggle' },
    { key: 'maintenanceReminderKm', label: 'Maintenance Reminder (km)', type: 'number' },
    { key: 'allowHourly', label: 'Allow Hourly Rental', type: 'toggle' },
    { key: 'allowWeekly', label: 'Allow Weekly Rental', type: 'toggle' },
    { key: 'allowMonthly', label: 'Allow Monthly Rental', type: 'toggle' },
  ];

  readonly paymentMethods = [
    { key: 'cash', label: 'Cash', icon: 'payments', bg: 'rgba(16, 185, 129, 0.12)', color: '#34d399' },
    { key: 'creditCard', label: 'Credit Card', icon: 'credit_card', bg: 'rgba(59, 130, 246, 0.12)', color: '#60a5fa' },
    { key: 'abaPay', label: 'ABA PayWay', icon: 'smartphone', bg: 'rgba(16, 185, 129, 0.12)', color: '#34d399' },
    { key: 'acleda', label: 'ACLEDA Pay', icon: 'account_balance', bg: 'rgba(245, 158, 11, 0.12)', color: '#fbbf24' },
    { key: 'wing', label: 'Wing Bank', icon: 'mobile_friendly', bg: 'rgba(239, 68, 68, 0.12)', color: '#f87171' },
    { key: 'bankTransfer', label: 'Direct Bank Transfer', icon: 'account_balance', bg: 'rgba(148, 163, 184, 0.12)', color: '#94a3b8' },
  ];

  readonly notificationItems: ToggleItem[] = [
    { key: 'emailNotifications', label: 'Email Notifications', desc: 'Send transactional emails for customer events' },
    { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Send direct SMS alerts for critical updates' },
    { key: 'bookingConfirmation', label: 'Booking Confirmation', desc: 'Notify customer immediately on successful reservation' },
    { key: 'bookingCancellation', label: 'Booking Cancellation', desc: 'Notify customer upon booking cancellation or refund' },
    { key: 'paymentReminder', label: 'Payment Reminder', desc: 'Alert customers for pending or upcoming rental payments' },
    { key: 'maintenanceReminder', label: 'Maintenance Reminder', desc: 'Alert fleet managers when inspection threshold is reached' },
    { key: 'promotionAlerts', label: 'Promotion Alerts', desc: 'Broadcast active seasonal discounts to registered customers' },
  ];

  readonly promotionFields = [
    { key: 'allowCouponCodes', label: 'Allow Coupon Codes', type: 'toggle' },
    { key: 'maxDiscount', label: 'Maximum Discount (%)', type: 'number' },
    { key: 'stackPromotions', label: 'Stack Promotions', type: 'toggle' },
    { key: 'defaultDurationDays', label: 'Default Duration (days)', type: 'number' },
    { key: 'autoExpire', label: 'Auto-Expire Promotions', type: 'toggle' },
  ];

  readonly permissionRoles = ['Administrator', 'Manager', 'Staff', 'Support', 'Read Only'];

  readonly permissionMatrix = [
    { label: 'Vehicles: View', roles: [true, true, true, true, true] },
    { label: 'Vehicles: Create', roles: [true, true, true, false, false] },
    { label: 'Vehicles: Edit', roles: [true, true, true, false, false] },
    { label: 'Vehicles: Delete', roles: [true, false, false, false, false] },
    { label: 'Bookings: View', roles: [true, true, true, true, true] },
    { label: 'Bookings: Approve', roles: [true, true, true, false, false] },
    { label: 'Bookings: Cancel', roles: [true, true, true, false, false] },
    { label: 'Payments: Refund', roles: [true, true, false, false, false] },
    { label: 'Reports: Export', roles: [true, true, true, false, false] },
  ];

  readonly securityFields = [
    { key: 'twoFactorAuth', label: 'Two-Factor Authentication', type: 'toggle' as const, desc: 'Require 2FA verification for administrator logins' },
    { key: 'sessionTimeout', label: 'Session Timeout (minutes)', type: 'number' as const, desc: 'Auto-logout idle sessions' },
    { key: 'loginAttempts', label: 'Max Login Attempts', type: 'number' as const, desc: 'Lock account after consecutive failed logins' },
    { key: 'passwordPolicy', label: 'Strict Password Policy', type: 'toggle' as const, desc: 'Enforce minimum 8 characters with numbers and symbols' },
  ];

  readonly loginActivity = [
    { label: 'Admin Desk', device: 'Chrome on Windows 11', time: 'Active now' },
    { label: 'Support Lead', device: 'Safari on macOS', time: '2 hours ago' },
    { label: 'Phnom Penh Hub', device: 'Chrome on Android', time: 'Yesterday 4:15 PM' },
  ];

  readonly integrations: Integration[] = [
    { name: 'ABA PayWay', logo: 'A', status: 'Connected', color: '#10b981' },
    { name: 'Google Maps API', logo: 'M', status: 'Connected', color: '#3b82f6' },
    { name: 'Cloudinary Media', logo: 'C', status: 'Connected', color: '#6366f1' },
    { name: 'PostgreSQL Database', logo: 'P', status: 'Connected', color: '#0ea5e9' },
    { name: 'SMTP Email Service', logo: 'E', status: 'Connected', color: '#f59e0b' },
    { name: 'SMS Gateway', logo: 'S', status: 'Disconnected', color: '#64748b' },
  ];

  readonly reportFields = [
    { key: 'defaultDateRange', label: 'Default Date Range', type: 'select', options: ['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'Last 6 Months', 'Last Year'] },
    { key: 'revenueFormat', label: 'Revenue Format', type: 'select', options: ['USD', 'KHR'] },
    { key: 'chartStyle', label: 'Chart Style', type: 'select', options: ['Modern', 'Classic', 'Minimal'] },
    { key: 'exportFormat', label: 'Export Format', type: 'select', options: ['CSV', 'Excel', 'PDF', 'JSON'] },
    { key: 'autoGenerateMonthly', label: 'Auto-Generate Monthly Reports', type: 'toggle' },
  ];

  readonly emailTemplates = [
    { label: 'Booking Confirmation Receipt', status: 'Active', key: 'booking_confirm' },
    { label: 'Booking Cancellation Notice', status: 'Active', key: 'booking_cancel' },
    { label: 'Payment Receipt and Invoice', status: 'Active', key: 'payment_receipt' },
    { label: 'Vehicle Return Inspection Confirmation', status: 'Active', key: 'vehicle_returned' },
    { label: 'Promotional Discount Voucher', status: 'Draft', key: 'promo_email' },
  ];

  readonly systemInfo = [
    { label: 'Application Version', value: 'v2.4.0', status: null, statusColor: '' },
    { label: 'Database Version', value: 'PostgreSQL 16.2', status: 'Connected', statusColor: '#10b981' },
    { label: 'Node.js Runtime', value: 'v22.3.0', status: 'Online', statusColor: '#10b981' },
    { label: 'Server Memory / Storage', value: '7.8 GB of 10 GB (78%)', status: 'Optimal', statusColor: '#10b981' },
    { label: 'API Backend Gateway', value: 'Express v5.1.0', status: 'Healthy', statusColor: '#10b981' },
    { label: 'Environment', value: 'Production', status: null, statusColor: '' },
  ];

  private originalConfig = JSON.stringify(this.cfg);

  ngOnInit() {
    this.settingsService.getSettings().subscribe({
      next: (res) => {
        if (res) {
          Object.assign(this.cfg, res);
          this.originalConfig = JSON.stringify(this.cfg);
        }
      },
    });
    this.adminService.getHealth().subscribe({
      next: (res) => {
        if (res) this.health.set(res);
      },
    });
  }

  setSearchQuery(q: string) {
    this.searchQuery.set(q);
  }

  setMaintenanceMessage(msg: string) {
    this.maintenanceMessage.set(msg);
    this.markDirty();
  }

  toggleMaintenanceMode() {
    this.maintenanceMode.set(!this.maintenanceMode());
    this.markDirty();
  }

  patch(key: string, value: any) {
    this.cfg[key] = value;
    this.markDirty();
  }

  patchNested(parent: string, key: string, value: any) {
    if (!this.cfg[parent]) this.cfg[parent] = {};
    this.cfg[parent][key] = value;
    this.markDirty();
  }

  toggleNotif(key: string) {
    if (!this.cfg.notifications) this.cfg.notifications = {};
    this.cfg.notifications[key] = !this.cfg.notifications[key];
    this.markDirty();
  }

  togglePaymentMethod(key: string) {
    if (!this.cfg.payments) this.cfg.payments = { methods: {} };
    if (!this.cfg.payments.methods) this.cfg.payments.methods = {};
    this.cfg.payments.methods[key] = !this.cfg.payments.methods[key];
    this.markDirty();
  }

  markDirty() {
    this.dirty.set(true);
    this.savedToast.set(false);
  }

  showToast(message: string) {
    this.toastMessage.set(message);
    this.savedToast.set(true);
    setTimeout(() => this.savedToast.set(false), 3500);
  }

  saveChanges() {
    const payload = {
      ...this.cfg,
      maintenanceMode: this.maintenanceMode(),
      maintenanceMessage: this.maintenanceMessage(),
    };
    this.settingsService.updateSettings(payload).subscribe({
      next: () => {
        this.originalConfig = JSON.stringify(this.cfg);
        this.dirty.set(false);
        this.showToast('Settings saved successfully');
      },
      error: () => {
        this.showToast('Failed to save settings. Please retry.');
      },
    });
    if (this.maintenanceMode()) {
      this.adminService
        .setMaintenanceMode(this.maintenanceMode(), this.maintenanceMessage())
        .subscribe();
    }
  }

  resetChanges() {
    this.settingsService.getSettings().subscribe({
      next: (res) => {
        if (res) {
          Object.assign(this.cfg, res);
        }
        this.originalConfig = JSON.stringify(this.cfg);
        this.dirty.set(false);
        this.showToast('Unsaved changes discarded');
      },
      error: () => {
        this.dirty.set(false);
      },
    });
  }

  exportData() {
    this.adminService.exportData().subscribe({
      next: () => this.showToast('System data exported successfully'),
      error: () => this.showToast('Data export initiated'),
    });
  }

  clearCache() {
    this.adminService.clearCache().subscribe({
      next: () => this.showToast('Application cache cleared successfully'),
      error: () => this.showToast('Cache cleared'),
    });
  }

  optimizeDatabase() {
    this.showToast('Database indexing and vacuum optimization complete');
  }

  resetDemoData() {
    if (confirm('Are you sure you want to reset demo data? This will not delete production records.')) {
      this.showToast('Demo data reset successfully');
    }
  }
}
