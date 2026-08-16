import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../../core/services/settings.service';
import { AdminService } from '../../../core/services/admin.service';

type SectionId =
  | 'general' | 'branding' | 'booking' | 'vehicles' | 'payments'
  | 'notifications' | 'promotions' | 'users' | 'security' | 'backup'
  | 'integrations' | 'appearance' | 'reports' | 'email' | 'system';

interface NavItem {
  id: SectionId;
  label: string;
  icon: string;
}

interface ToggleItem {
  key: string;
  label: string;
  desc: string;
}

interface Integration {
  name: string;
  logo: string;
  status: 'Connected' | 'Disconnected' | 'Error';
  color: string;
}

interface Permission {
  role: string;
  vehicles: { view: boolean; create: boolean; edit: boolean; delete: boolean };
  bookings: { view: boolean; approve: boolean; cancel: boolean };
  payments: { refund: boolean };
  reports: { export: boolean };
}

interface SystemHealth {
  server: string;
  database: string;
  api: string;
  storage: number;
  lastBackup: string;
}

interface ActivityItem {
  label: string;
  time: string;
  icon: string;
  bg: string;
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
  readonly maintenanceMode = signal(false);
  readonly maintenanceMessage = signal('We are currently undergoing scheduled maintenance. Please check back shortly.');

  readonly navItems: NavItem[] = [
    { id: 'general', label: 'General', icon: 'settings' },
    { id: 'branding', label: 'Company Branding', icon: 'palette' },
    { id: 'booking', label: 'Booking', icon: 'receipt_long' },
    { id: 'vehicles', label: 'Vehicles', icon: 'directions_car' },
    { id: 'payments', label: 'Payments', icon: 'payments' },
    { id: 'notifications', label: 'Notifications', icon: 'notifications' },
    { id: 'promotions', label: 'Promotions', icon: 'local_offer' },
    { id: 'users', label: 'Users & Roles', icon: 'manage_accounts' },
    { id: 'security', label: 'Security', icon: 'security' },
    { id: 'backup', label: 'Backup & Restore', icon: 'backup' },
    { id: 'integrations', label: 'Integrations', icon: 'extension' },
    { id: 'appearance', label: 'Appearance', icon: 'contrast' },
    { id: 'reports', label: 'Reports', icon: 'analytics' },
    { id: 'email', label: 'Email Templates', icon: 'mail' },
    { id: 'system', label: 'System', icon: 'info' },
  ];

  readonly health = signal<SystemHealth>({
    server: 'Online',
    database: 'Connected',
    api: 'Healthy',
    storage: 78,
    lastBackup: 'Today 03:00 AM',
  });

  readonly cfg = {
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
      primaryColor: '#005DAC',
      secondaryColor: '#7C3AED',
      footerText: '© 2026 Cambo Rent. All rights reserved.',
    },
    language: 'en',
    appearanceTheme: 'light',
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
        abaPay: true,
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
    { key: 'abaPay', label: 'ABA PayWay QR', icon: 'qr_code_scanner', bg: '#E7F5ED', color: '#059669' },
  ];

  readonly notificationItems: ToggleItem[] = [
    { key: 'emailNotifications', label: 'Email Notifications', desc: 'Send email notifications to customers' },
    { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Send SMS notifications to customers' },
    { key: 'bookingConfirmation', label: 'Booking Confirmation', desc: 'Notify on booking confirmation' },
    { key: 'bookingCancellation', label: 'Booking Cancellation', desc: 'Notify on booking cancellation' },
    { key: 'paymentReminder', label: 'Payment Reminder', desc: 'Remind customers about payments' },
    { key: 'maintenanceReminder', label: 'Maintenance Reminder', desc: 'Alert for vehicle maintenance' },
    { key: 'promotionAlerts', label: 'Promotion Alerts', desc: 'Notify about special offers' },
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
    { label: 'Vehicles — View', roles: [true, true, true, true, true] },
    { label: 'Vehicles — Create', roles: [true, true, true, false, false] },
    { label: 'Vehicles — Edit', roles: [true, true, true, false, false] },
    { label: 'Vehicles — Delete', roles: [true, false, false, false, false] },
    { label: 'Bookings — View', roles: [true, true, true, true, true] },
    { label: 'Bookings — Approve', roles: [true, true, true, false, false] },
    { label: 'Bookings — Cancel', roles: [true, true, true, false, false] },
    { label: 'Payments — Refund', roles: [true, true, false, false, false] },
    { label: 'Reports — Export', roles: [true, true, true, false, false] },
  ];

  readonly securityFields = [
    { key: 'changePassword', label: 'Change Password', type: 'button' as const, btnLabel: 'Change', desc: 'Update your account password' },
    { key: 'twoFactorAuth', label: 'Two-Factor Authentication', type: 'toggle' as const, desc: 'Add extra security to your account' },
    { key: 'sessionTimeout', label: 'Session Timeout (minutes)', type: 'text' as const, desc: 'Auto-logout after inactivity' },
    { key: 'loginAttempts', label: 'Max Login Attempts', type: 'text' as const, desc: 'Lock account after failed attempts' },
    { key: 'passwordPolicy', label: 'Password Policy', type: 'toggle' as const, desc: 'Enforce strong password requirements' },
    { key: 'deviceManagement', label: 'Device Management', type: 'button' as const, btnLabel: 'Manage', desc: 'View and manage connected devices' },
  ];

  readonly loginActivity = [
    { label: 'Admin User', device: 'Chrome · macOS', time: '2 hours ago' },
    { label: 'Admin User', device: 'Safari · iOS', time: 'Yesterday 8:30 PM' },
    { label: 'Sokha M.', device: 'Chrome · Windows', time: 'Yesterday 2:15 PM' },
  ];

  readonly backupFields = [
    { key: 'backupDatabase', label: 'Backup Database', type: 'button' as const, btnLabel: 'Backup Now' },
    { key: 'restoreDatabase', label: 'Restore Database', type: 'button' as const, btnLabel: 'Restore' },
    { key: 'autoDailyBackup', label: 'Automatic Daily Backup', type: 'toggle' as const },
    { key: 'autoWeeklyBackup', label: 'Automatic Weekly Backup', type: 'toggle' as const },
    { key: 'exportData', label: 'Export System Data', type: 'button' as const, btnLabel: 'Export' },
  ];

  readonly integrations: Integration[] = [
    { name: 'Stripe', logo: 'S', status: 'Connected', color: '#635BFF' },
    { name: 'Google Maps', logo: 'M', status: 'Connected', color: '#4285F4' },
    { name: 'Cloudinary', logo: 'C', status: 'Connected', color: '#3448C5' },
    { name: 'Supabase', logo: 'S', status: 'Error', color: '#3ECF8E' },
    { name: 'Email Service', logo: 'E', status: 'Connected', color: '#EA4335' },
    { name: 'SMS Gateway', logo: 'S', status: 'Disconnected', color: '#6B7280' },
  ];

  readonly themes = [
    { value: 'light', label: 'Light Mode', bg: '#FFFFFF', color: '#1A1A2E' },
    { value: 'dark', label: 'Dark Mode', bg: '#1A1A2E', color: '#FFFFFF' },
  ];

  readonly reportFields = [
    { key: 'defaultDateRange', label: 'Default Date Range', type: 'select', options: ['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'Last 6 Months', 'Last Year'] },
    { key: 'revenueFormat', label: 'Revenue Format', type: 'select', options: ['USD', 'KHR', 'EUR', 'THB'] },
    { key: 'chartStyle', label: 'Chart Style', type: 'select', options: ['Modern', 'Classic', 'Minimal'] },
    { key: 'exportFormat', label: 'Export Format', type: 'select', options: ['PDF', 'Excel', 'CSV', 'JSON'] },
    { key: 'autoGenerateMonthly', label: 'Auto-Generate Monthly Reports', type: 'toggle' },
  ];

  readonly emailTemplates = [
    { label: 'Booking Confirmation', status: 'Active' },
    { label: 'Booking Cancelled', status: 'Active' },
    { label: 'Payment Receipt', status: 'Active' },
    { label: 'Vehicle Returned', status: 'Draft' },
    { label: 'Promotion Email', status: 'Draft' },
  ];

  readonly systemInfo = [
    { label: 'Application Version', value: '1.0.0', status: null, statusColor: '' },
    { label: 'Database Version', value: 'PostgreSQL 16.2', status: 'Connected', statusColor: '#059669' },
    { label: 'Server Status', value: 'Node.js 22.3', status: 'Online', statusColor: '#059669' },
    { label: 'Storage Used', value: '7.8 GB / 10 GB', status: '78%', statusColor: '#F59E0B' },
    { label: 'API Status', value: 'REST v2', status: 'Healthy', statusColor: '#059669' },
    { label: 'Environment', value: 'Production', status: null, statusColor: '' },
  ];

  readonly dataActions = [
    { label: 'Export All Data', icon: 'file_download', color: '#374151', danger: false },
    { label: 'Import Data', icon: 'file_upload', color: '#374151', danger: false },
    { label: 'Reset Demo Data', icon: 'restart_alt', color: '#DC2626', danger: true },
    { label: 'Clear Cache', icon: 'cleaning_services', color: '#DC2626', danger: true },
    { label: 'Optimize Database', icon: 'speed', color: '#059669', danger: false },
  ];

  private originalConfig = JSON.stringify(this.cfg);

  ngOnInit() {
    this.settingsService.getSettings().subscribe({
      next: (res) => {
        Object.assign(this.cfg, res);
        this.originalConfig = JSON.stringify(this.cfg);
      },
    });
    this.adminService.getHealth().subscribe({
      next: (res) => this.health.set(res),
    });
  }

  patch(key: string, value: any) {
    (this.cfg as any)[key] = value;
    this.markDirty();
  }

  patchNested(parent: string, key: string, value: any) {
    const p = (this.cfg as any)[parent];
    if (p) p[key] = value;
    this.markDirty();
  }

  toggleNotif(key: string) {
    this.cfg.notifications[key as keyof typeof this.cfg.notifications] = !this.cfg.notifications[key as keyof typeof this.cfg.notifications];
    this.markDirty();
  }

  togglePaymentMethod(key: string) {
    this.cfg.payments.methods[key as keyof typeof this.cfg.payments.methods] = !this.cfg.payments.methods[key as keyof typeof this.cfg.payments.methods];
    this.markDirty();
  }

  markDirty() {
    this.dirty.set(true);
    this.savedToast.set(false);
  }

  saveChanges() {
    const payload = { ...this.cfg, maintenanceMode: this.maintenanceMode(), maintenanceMessage: this.maintenanceMessage() };
    this.settingsService.updateSettings(payload).subscribe({
      next: () => {
        this.originalConfig = JSON.stringify(this.cfg);
        this.dirty.set(false);
        this.savedToast.set(true);
        setTimeout(() => this.savedToast.set(false), 3000);
      },
    });
    if (this.maintenanceMode()) {
      this.adminService.setMaintenanceMode(this.maintenanceMode(), this.maintenanceMessage()).subscribe();
    }
  }

  resetChanges() {
    this.settingsService.getSettings().subscribe({
      next: (res) => {
        Object.assign(this.cfg, res);
        this.originalConfig = JSON.stringify(this.cfg);
        this.dirty.set(false);
      },
    });
  }

  navHover(e: MouseEvent, id: SectionId) {
    const el = e.currentTarget as HTMLElement;
    if (this.activeSection() !== id) el.style.background = '#F9FAFB';
  }

  navUnhover(e: MouseEvent, id: SectionId) {
    const el = e.currentTarget as HTMLElement;
    if (this.activeSection() !== id) el.style.background = 'transparent';
  }
}
