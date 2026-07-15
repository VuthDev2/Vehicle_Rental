const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    companyName: { type: String, default: 'Cambo Rent' },
    businessEmail: { type: String, default: 'admin@camborent.com' },
    phone: { type: String, default: '+855 23 888 999' },
    website: { type: String, default: 'https://camborent.com' },
    address: { type: String, default: '123 Preah Monivong Blvd, Phnom Penh' },
    taxId: { type: String, default: 'KH-123456789' },
    currency: { type: String, default: 'USD' },
    timezone: { type: String, default: 'Asia/Phnom_Penh' },
    language: { type: String, default: 'en' },
    appearanceTheme: { type: String, default: 'light' },
    compactMode: { type: Boolean, default: false },

    businessHours: {
      weekdays: { type: String, default: '8:00 AM - 6:00 PM' },
      weekends: { type: String, default: '9:00 AM - 4:00 PM' },
    },

    branding: {
      primaryColor: { type: String, default: '#005DAC' },
      secondaryColor: { type: String, default: '#7C3AED' },
      footerText: { type: String, default: '© 2026 Cambo Rent. All rights reserved.' },
    },

    booking: {
      minDuration: { type: Number, default: 1 },
      maxDuration: { type: Number, default: 30 },
      allowSameDay: { type: Boolean, default: true },
      advanceBookingLimit: { type: Number, default: 90 },
      gracePeriod: { type: Number, default: 60 },
      lateReturnFee: { type: Number, default: 25 },
      securityDeposit: { type: Number, default: 200 },
      bookingApproval: { type: Boolean, default: false },
      autoConfirmation: { type: Boolean, default: true },
    },

    vehicles: {
      defaultStatus: { type: String, default: 'available' },
      requireInspection: { type: Boolean, default: true },
      autoMarkMaintenance: { type: Boolean, default: true },
      maintenanceReminderKm: { type: Number, default: 5000 },
      allowHourly: { type: Boolean, default: true },
      allowWeekly: { type: Boolean, default: true },
      allowMonthly: { type: Boolean, default: true },
    },

    payments: {
      methods: {
        cash: { type: Boolean, default: true },
        creditCard: { type: Boolean, default: true },
        abaPay: { type: Boolean, default: true },
        acleda: { type: Boolean, default: true },
        wing: { type: Boolean, default: false },
        bankTransfer: { type: Boolean, default: true },
      },
      taxPercentage: { type: Number, default: 10 },
      depositPercentage: { type: Number, default: 20 },
      defaultCurrency: { type: String, default: 'USD' },
    },

    notifications: {
      emailNotifications: { type: Boolean, default: true },
      smsNotifications: { type: Boolean, default: false },
      bookingConfirmation: { type: Boolean, default: true },
      bookingCancellation: { type: Boolean, default: true },
      paymentReminder: { type: Boolean, default: true },
      maintenanceReminder: { type: Boolean, default: false },
      promotionAlerts: { type: Boolean, default: true },
    },

    promotions: {
      allowCouponCodes: { type: Boolean, default: true },
      maxDiscount: { type: Number, default: 50 },
      stackPromotions: { type: Boolean, default: false },
      defaultDurationDays: { type: Number, default: 30 },
      autoExpire: { type: Boolean, default: true },
    },

    security: {
      twoFactorAuth: { type: Boolean, default: false },
      sessionTimeout: { type: Number, default: 30 },
      loginAttempts: { type: Number, default: 5 },
      passwordPolicy: { type: Boolean, default: true },
    },

    backup: {
      autoDailyBackup: { type: Boolean, default: true },
      autoWeeklyBackup: { type: Boolean, default: false },
    },

    reports: {
      defaultDateRange: { type: String, default: 'Last 30 Days' },
      revenueFormat: { type: String, default: 'USD' },
      chartStyle: { type: String, default: 'Modern' },
      exportFormat: { type: String, default: 'PDF' },
      autoGenerateMonthly: { type: Boolean, default: true },
    },

    maintenanceMode: { type: Boolean, default: false },
    maintenanceMessage: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Setting', settingSchema);
