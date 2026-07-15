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
  server: 'Online' | 'Offline';
  database: 'Connected' | 'Disconnected';
  api: 'Healthy' | 'Degraded' | 'Down';
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
  template: `
    <div style="background: #F8F9FA; min-height: 100vh; font-family: 'Inter', system-ui, sans-serif;">

      <!-- ==================== HEADER ==================== -->
      <div style="padding: 28px 32px 0;">
        <div class="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <div class="flex items-center gap-3">
              <h1 style="font-size: 26px; font-weight: 800; color: #1A1A2E; margin: 0; letter-spacing: -0.5px;">Settings</h1>
              <span style="background: #F3F0FF; color: #7C3AED; padding: 2px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; line-height: 28px;">Admin</span>
            </div>
            <p style="font-size: 14px; color: #6B7280; margin: 4px 0 0;">Configure every aspect of your vehicle rental system</p>
          </div>
        </div>

        <!-- Search -->
        <div style="position: relative; max-width: 480px; margin-bottom: 24px;">
          <span class="material-symbols-outlined" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-size: 20px; color: #9CA3AF; pointer-events: none;">search</span>
          <input type="text" [(ngModel)]="searchQuery" placeholder="Search settings..."
                 style="width: 100%; border: 1px solid #E5E7EB; border-radius: 12px; padding: 12px 16px 12px 44px; font-size: 14px; color: #1A1A2E; outline: none; box-sizing: border-box; background: #FFFFFF; transition: all 0.15s; box-shadow: 0 1px 3px rgba(0,0,0,0.04);"
                 onfocus="this.style.borderColor='#3980F4';this.style.boxShadow='0 0 0 3px rgba(57,128,244,0.12)'"
                 onblur="this.style.borderColor='#E5E7EB';this.style.boxShadow='0 1px 3px rgba(0,0,0,0.04)'" />
        </div>
      </div>

      <!-- ==================== SYSTEM HEALTH CARD ==================== -->
      <div style="padding: 0 32px; margin-bottom: 24px;">
        <div style="background: #FFFFFF; border-radius: 14px; border: 1px solid #F0F0F0; padding: 16px 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); display: flex; flex-wrap: wrap; align-items: center; gap: 20px;">
          <div class="flex items-center gap-2">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #059669; display: inline-block;"></span>
            <span style="font-size: 13px; font-weight: 600; color: #1A1A2E;">System Status</span>
          </div>
          <div class="flex items-center gap-2">
            <span style="font-size: 12px; font-weight: 500; color: #6B7280;">Server</span>
            <span style="font-size: 12px; font-weight: 700; color: #059669;">🟢 {{ health().server }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span style="font-size: 12px; font-weight: 500; color: #6B7280;">Database</span>
            <span style="font-size: 12px; font-weight: 700; color: #059669;">🟢 {{ health().database }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span style="font-size: 12px; font-weight: 500; color: #6B7280;">Storage</span>
            <span style="font-size: 12px; font-weight: 700; color: #1A1A2E;">{{ health().storage }}%</span>
            <div style="width: 60px; height: 6px; border-radius: 3px; background: #F3F4F6; overflow: hidden;">
              <div style="height: 100%; border-radius: 3px; width: {{ health().storage }}%; background: {{ health().storage > 80 ? '#DC2626' : health().storage > 60 ? '#F59E0B' : '#059669' }};"></div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span style="font-size: 12px; font-weight: 500; color: #6B7280;">API</span>
            <span style="font-size: 12px; font-weight: 700; color: #059669;">🟢 {{ health().api }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span style="font-size: 12px; font-weight: 500; color: #6B7280;">Backup</span>
            <span style="font-size: 12px; font-weight: 600; color: #6B7280;">{{ health().lastBackup }}</span>
          </div>
        </div>
      </div>

      <!-- ==================== TWO-COLUMN LAYOUT ==================== -->
      <div style="display: flex; gap: 24px; padding: 0 32px 32px; align-items: flex-start;">

        <!-- ==================== SIDEBAR NAVIGATION ==================== -->
        <div style="width: 240px; flex-shrink: 0; position: sticky; top: 24px;">
          <nav style="background: #FFFFFF; border-radius: 14px; border: 1px solid #F0F0F0; padding: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            @for (item of navItems; track item.id) {
              <button (click)="activeSection.set(item.id)"
                      [style.background]="activeSection() === item.id ? '#E5EEFF' : 'transparent'"
                      [style.color]="activeSection() === item.id ? '#005DAC' : '#374151'"
                      style="width: 100%; border: none; border-radius: 10px; padding: 10px 14px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: all 0.15s; text-align: left;"
                      (mouseover)="navHover($event, item.id)" (mouseout)="navUnhover($event, item.id)">
                <span class="material-symbols-outlined" style="font-size: 18px;">{{ item.icon }}</span>
                {{ item.label }}
              </button>
            }
          </nav>

          <!-- Maintenance Mode -->
          <div style="background: #FFFFFF; border-radius: 14px; border: 1px solid #F0F0F0; padding: 16px; margin-top: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div class="flex items-center justify-between mb-2">
              <span style="font-size: 13px; font-weight: 700; color: #1A1A2E;">Maintenance Mode</span>
              <label style="position: relative; display: inline-block; width: 44px; height: 24px; cursor: pointer;">
                <input type="checkbox" [checked]="maintenanceMode()" (change)="maintenanceMode.set(!maintenanceMode()); markDirty()"
                       style="opacity: 0; width: 0; height: 0; position: absolute;" />
                <span style="position: absolute; inset: 0; background: {{ maintenanceMode() ? '#DC2626' : '#D1D5DB' }}; border-radius: 12px; transition: background 0.2s;">
                  <span style="position: absolute; top: 2px; left: {{ maintenanceMode() ? '22px' : '2px' }}; width: 20px; height: 20px; background: #FFFFFF; border-radius: 50%; transition: left 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.15);"></span>
                </span>
              </label>
            </div>
            @if (maintenanceMode()) {
              <input type="text" [(ngModel)]="maintenanceMessage" placeholder="Custom maintenance message..."
                     style="width: 100%; border: 1px solid #E5E7EB; border-radius: 8px; padding: 8px 12px; font-size: 12px; outline: none; box-sizing: border-box; margin-top: 8px;"
                     (input)="markDirty()" />
            }
            <p style="font-size: 11px; color: #6B7280; margin: 6px 0 0;">When enabled, customers see a maintenance notice.</p>
          </div>
        </div>

        <!-- ==================== CONTENT AREA ==================== -->
        <div style="flex: 1; min-width: 0;">

          @switch (activeSection()) {
            <!-- ==================== 1. GENERAL ==================== -->
            @case ('general') {
              <div style="background: #FFFFFF; border-radius: 14px; border: 1px solid #F0F0F0; padding: 28px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <div class="flex items-center gap-3 mb-6">
                  <div style="width: 40px; height: 40px; border-radius: 10px; background: #E5EEFF; display: flex; align-items: center; justify-content: center;">
                    <span class="material-symbols-outlined" style="font-size: 22px; color: #005DAC;">settings</span>
                  </div>
                  <div>
                    <h2 style="font-size: 18px; font-weight: 800; color: #1A1A2E; margin: 0;">General Settings</h2>
                    <p style="font-size: 13px; color: #6B7280; margin: 1px 0 0;">Company information and business configuration</p>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-5">
                  <div>
                    <label style="display: block; font-size: 12px; font-weight: 700; color: #374151; margin-bottom: 5px; letter-spacing: 0.3px; text-transform: uppercase;">Company Name</label>
                    <input type="text" [value]="cfg.companyName" (input)="patch('companyName', $any($event.target).value)"
                           style="width: 100%; border: 1px solid #E5E7EB; border-radius: 10px; padding: 10px 14px; font-size: 14px; color: #1A1A2E; outline: none; box-sizing: border-box; background: #F9FAFB; transition: all 0.15s;"
                           onfocus="this.style.borderColor='#3980F4';this.style.boxShadow='0 0 0 3px rgba(57,128,244,0.12)';this.style.background='#FFFFFF'"
                           onblur="this.style.borderColor='#E5E7EB';this.style.boxShadow='none';this.style.background='#F9FAFB'" />
                  </div>
                  <div>
                    <label style="display: block; font-size: 12px; font-weight: 700; color: #374151; margin-bottom: 5px; letter-spacing: 0.3px; text-transform: uppercase;">Business Email</label>
                    <input type="email" [value]="cfg.businessEmail" (input)="patch('businessEmail', $any($event.target).value)"
                           style="width: 100%; border: 1px solid #E5E7EB; border-radius: 10px; padding: 10px 14px; font-size: 14px; color: #1A1A2E; outline: none; box-sizing: border-box; background: #F9FAFB; transition: all 0.15s;"
                           onfocus="this.style.borderColor='#3980F4';this.style.boxShadow='0 0 0 3px rgba(57,128,244,0.12)';this.style.background='#FFFFFF'"
                           onblur="this.style.borderColor='#E5E7EB';this.style.boxShadow='none';this.style.background='#F9FAFB'" />
                  </div>
                  <div>
                    <label style="display: block; font-size: 12px; font-weight: 700; color: #374151; margin-bottom: 5px; letter-spacing: 0.3px; text-transform: uppercase;">Phone Number</label>
                    <input type="tel" [value]="cfg.phone" (input)="patch('phone', $any($event.target).value)"
                           style="width: 100%; border: 1px solid #E5E7EB; border-radius: 10px; padding: 10px 14px; font-size: 14px; color: #1A1A2E; outline: none; box-sizing: border-box; background: #F9FAFB; transition: all 0.15s;"
                           onfocus="this.style.borderColor='#3980F4';this.style.boxShadow='0 0 0 3px rgba(57,128,244,0.12)';this.style.background='#FFFFFF'"
                           onblur="this.style.borderColor='#E5E7EB';this.style.boxShadow='none';this.style.background='#F9FAFB'" />
                  </div>
                  <div>
                    <label style="display: block; font-size: 12px; font-weight: 700; color: #374151; margin-bottom: 5px; letter-spacing: 0.3px; text-transform: uppercase;">Website</label>
                    <input type="url" [value]="cfg.website" (input)="patch('website', $any($event.target).value)"
                           style="width: 100%; border: 1px solid #E5E7EB; border-radius: 10px; padding: 10px 14px; font-size: 14px; color: #1A1A2E; outline: none; box-sizing: border-box; background: #F9FAFB; transition: all 0.15s;"
                           onfocus="this.style.borderColor='#3980F4';this.style.boxShadow='0 0 0 3px rgba(57,128,244,0.12)';this.style.background='#FFFFFF'"
                           onblur="this.style.borderColor='#E5E7EB';this.style.boxShadow='none';this.style.background='#F9FAFB'" />
                  </div>
                  <div>
                    <label style="display: block; font-size: 12px; font-weight: 700; color: #374151; margin-bottom: 5px; letter-spacing: 0.3px; text-transform: uppercase;">Address</label>
                    <input type="text" [value]="cfg.address" (input)="patch('address', $any($event.target).value)"
                           style="width: 100%; border: 1px solid #E5E7EB; border-radius: 10px; padding: 10px 14px; font-size: 14px; color: #1A1A2E; outline: none; box-sizing: border-box; background: #F9FAFB; transition: all 0.15s;"
                           onfocus="this.style.borderColor='#3980F4';this.style.boxShadow='0 0 0 3px rgba(57,128,244,0.12)';this.style.background='#FFFFFF'"
                           onblur="this.style.borderColor='#E5E7EB';this.style.boxShadow='none';this.style.background='#F9FAFB'" />
                  </div>
                  <div>
                    <label style="display: block; font-size: 12px; font-weight: 700; color: #374151; margin-bottom: 5px; letter-spacing: 0.3px; text-transform: uppercase;">Tax ID</label>
                    <input type="text" [value]="cfg.taxId" (input)="patch('taxId', $any($event.target).value)"
                           style="width: 100%; border: 1px solid #E5E7EB; border-radius: 10px; padding: 10px 14px; font-size: 14px; color: #1A1A2E; outline: none; box-sizing: border-box; background: #F9FAFB; transition: all 0.15s;"
                           onfocus="this.style.borderColor='#3980F4';this.style.boxShadow='0 0 0 3px rgba(57,128,244,0.12)';this.style.background='#FFFFFF'"
                           onblur="this.style.borderColor='#E5E7EB';this.style.boxShadow='none';this.style.background='#F9FAFB'" />
                  </div>
                  <div>
                    <label style="display: block; font-size: 12px; font-weight: 700; color: #374151; margin-bottom: 5px; letter-spacing: 0.3px; text-transform: uppercase;">Currency</label>
                    <select [value]="cfg.currency" (change)="patch('currency', $any($event.target).value)"
                            style="width: 100%; border: 1px solid #E5E7EB; border-radius: 10px; padding: 10px 14px; font-size: 14px; color: #1A1A2E; outline: none; background: #F9FAFB; cursor: pointer; transition: all 0.15s;"
                            onfocus="this.style.borderColor='#3980F4';this.style.boxShadow='0 0 0 3px rgba(57,128,244,0.12)';this.style.background='#FFFFFF'"
                            onblur="this.style.borderColor='#E5E7EB';this.style.boxShadow='none';this.style.background='#F9FAFB'">
                      <option value="USD">USD — US Dollar</option>
                      <option value="KHR">KHR — Cambodian Riel</option>
                      <option value="EUR">EUR — Euro</option>
                      <option value="THB">THB — Thai Baht</option>
                    </select>
                  </div>
                  <div>
                    <label style="display: block; font-size: 12px; font-weight: 700; color: #374151; margin-bottom: 5px; letter-spacing: 0.3px; text-transform: uppercase;">Timezone</label>
                    <select [value]="cfg.timezone" (change)="patch('timezone', $any($event.target).value)"
                            style="width: 100%; border: 1px solid #E5E7EB; border-radius: 10px; padding: 10px 14px; font-size: 14px; color: #1A1A2E; outline: none; background: #F9FAFB; cursor: pointer; transition: all 0.15s;"
                            onfocus="this.style.borderColor='#3980F4';this.style.boxShadow='0 0 0 3px rgba(57,128,244,0.12)';this.style.background='#FFFFFF'"
                            onblur="this.style.borderColor='#E5E7EB';this.style.boxShadow='none';this.style.background='#F9FAFB'">
                      <option value="Asia/Phnom_Penh">Asia/Phnom Penh (UTC+7)</option>
                      <option value="Asia/Bangkok">Asia/Bangkok (UTC+7)</option>
                      <option value="Asia/Singapore">Asia/Singapore (UTC+8)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                </div>
                <div class="mt-6 pt-5" style="border-top: 1px solid #F3F4F6;">
                  <label style="display: block; font-size: 12px; font-weight: 700; color: #374151; margin-bottom: 5px; letter-spacing: 0.3px; text-transform: uppercase;">Business Hours</label>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <span style="font-size: 12px; color: #6B7280;">Weekdays</span>
                      <input type="text" [value]="cfg.businessHours.weekdays" (input)="patchNested('businessHours', 'weekdays', $any($event.target).value)"
                             style="width: 100%; border: 1px solid #E5E7EB; border-radius: 8px; padding: 8px 12px; font-size: 13px; outline: none; box-sizing: border-box; margin-top: 4px; background: #F9FAFB;" />
                    </div>
                    <div>
                      <span style="font-size: 12px; color: #6B7280;">Weekends</span>
                      <input type="text" [value]="cfg.businessHours.weekends" (input)="patchNested('businessHours', 'weekends', $any($event.target).value)"
                             style="width: 100%; border: 1px solid #E5E7EB; border-radius: 8px; padding: 8px 12px; font-size: 13px; outline: none; box-sizing: border-box; margin-top: 4px; background: #F9FAFB;" />
                    </div>
                  </div>
                </div>
              </div>
            }

            <!-- ==================== 2. COMPANY BRANDING ==================== -->
            @case ('branding') {
              <div style="background: #FFFFFF; border-radius: 14px; border: 1px solid #F0F0F0; padding: 28px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <div class="flex items-center gap-3 mb-6">
                  <div style="width: 40px; height: 40px; border-radius: 10px; background: #F3F0FF; display: flex; align-items: center; justify-content: center;">
                    <span class="material-symbols-outlined" style="font-size: 22px; color: #7C3AED;">palette</span>
                  </div>
                  <div>
                    <h2 style="font-size: 18px; font-weight: 800; color: #1A1A2E; margin: 0;">Company Branding</h2>
                    <p style="font-size: 13px; color: #6B7280; margin: 1px 0 0;">Customize your brand appearance</p>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-5 mb-6">
                  <div>
                    <label style="display: block; font-size: 12px; font-weight: 700; color: #374151; margin-bottom: 5px; letter-spacing: 0.3px; text-transform: uppercase;">Primary Color</label>
                    <div class="flex items-center gap-3">
                      <input type="color" [value]="cfg.branding.primaryColor" (input)="patchNested('branding', 'primaryColor', $any($event.target).value)"
                             style="width: 48px; height: 48px; border: 1px solid #E5E7EB; border-radius: 10px; padding: 2px; cursor: pointer; background: none;" />
                      <input type="text" [value]="cfg.branding.primaryColor" (input)="patchNested('branding', 'primaryColor', $any($event.target).value)"
                             style="flex: 1; border: 1px solid #E5E7EB; border-radius: 10px; padding: 10px 14px; font-size: 13px; outline: none; background: #F9FAFB;" />
                    </div>
                  </div>
                  <div>
                    <label style="display: block; font-size: 12px; font-weight: 700; color: #374151; margin-bottom: 5px; letter-spacing: 0.3px; text-transform: uppercase;">Secondary Color</label>
                    <div class="flex items-center gap-3">
                      <input type="color" [value]="cfg.branding.secondaryColor" (input)="patchNested('branding', 'secondaryColor', $any($event.target).value)"
                             style="width: 48px; height: 48px; border: 1px solid #E5E7EB; border-radius: 10px; padding: 2px; cursor: pointer; background: none;" />
                      <input type="text" [value]="cfg.branding.secondaryColor" (input)="patchNested('branding', 'secondaryColor', $any($event.target).value)"
                             style="flex: 1; border: 1px solid #E5E7EB; border-radius: 10px; padding: 10px 14px; font-size: 13px; outline: none; background: #F9FAFB;" />
                    </div>
                  </div>
                </div>
                <div class="grid grid-cols-4 gap-4 mb-5">
                  @for (item of brandingItems; track item.label) {
                    <div style="border: 1px dashed #E5E7EB; border-radius: 10px; padding: 20px; text-align: center; cursor: pointer; transition: all 0.15s; background: #F9FAFB;"
                         onmouseover="this.style.borderColor='#3980F4';this.style.background='#EFF6FF'"
                         onmouseout="this.style.borderColor='#E5E7EB';this.style.background='#F9FAFB'">
                      <span class="material-symbols-outlined" style="font-size: 28px; color: #9CA3AF; display: block; margin-bottom: 8px;">{{ item.icon }}</span>
                      <span style="font-size: 12px; font-weight: 600; color: #374151;">{{ item.label }}</span>
                      <span style="font-size: 11px; color: #9CA3AF; display: block; margin-top: 2px;">Click to upload</span>
                    </div>
                  }
                </div>
                <div>
                  <label style="display: block; font-size: 12px; font-weight: 700; color: #374151; margin-bottom: 5px; letter-spacing: 0.3px; text-transform: uppercase;">Footer Text</label>
                  <input type="text" [value]="cfg.branding.footerText" (input)="patchNested('branding', 'footerText', $any($event.target).value)"
                         style="width: 100%; border: 1px solid #E5E7EB; border-radius: 10px; padding: 10px 14px; font-size: 14px; outline: none; box-sizing: border-box; background: #F9FAFB;" />
                </div>
              </div>
            }

            <!-- ==================== 3. BOOKING ==================== -->
            @case ('booking') {
              <div style="background: #FFFFFF; border-radius: 14px; border: 1px solid #F0F0F0; padding: 28px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <div class="flex items-center gap-3 mb-6">
                  <div style="width: 40px; height: 40px; border-radius: 10px; background: #FFF3E0; display: flex; align-items: center; justify-content: center;">
                    <span class="material-symbols-outlined" style="font-size: 22px; color: #E65100;">receipt_long</span>
                  </div>
                  <div>
                    <h2 style="font-size: 18px; font-weight: 800; color: #1A1A2E; margin: 0;">Booking Settings</h2>
                    <p style="font-size: 13px; color: #6B7280; margin: 1px 0 0;">Configure booking rules and policies</p>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-5">
                  @for (field of bookingFields; track field.key) {
                    <div>
                      <label style="display: block; font-size: 12px; font-weight: 700; color: #374151; margin-bottom: 5px; letter-spacing: 0.3px; text-transform: uppercase;">{{ field.label }}</label>
                      @if (field.type === 'toggle') {
                        <label style="position: relative; display: inline-block; width: 44px; height: 24px; cursor: pointer;">
                          <input type="checkbox" [checked]="$any(cfg.booking)[field.key]" (change)="patchNested('booking', field.key, !$any(cfg.booking)[field.key])"
                                 style="opacity: 0; width: 0; height: 0; position: absolute;" />
                          <span style="position: absolute; inset: 0; background: {{ $any(cfg.booking)[field.key] ? '#005DAC' : '#D1D5DB' }}; border-radius: 12px; transition: background 0.2s;">
                            <span style="position: absolute; top: 2px; left: {{ $any(cfg.booking)[field.key] ? '22px' : '2px' }}; width: 20px; height: 20px; background: #FFFFFF; border-radius: 50%; transition: left 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.15);"></span>
                          </span>
                        </label>
                      } @else {
                        <input type="{{ field.type }}" [value]="$any(cfg.booking)[field.key]" (input)="patchNested('booking', field.key, field.type === 'number' ? Number($any($event.target).value) : $any($event.target).value)"
                               style="width: 100%; border: 1px solid #E5E7EB; border-radius: 10px; padding: 10px 14px; font-size: 14px; color: #1A1A2E; outline: none; box-sizing: border-box; background: #F9FAFB; transition: all 0.15s;"
                               onfocus="this.style.borderColor='#3980F4';this.style.boxShadow='0 0 0 3px rgba(57,128,244,0.12)';this.style.background='#FFFFFF'"
                               onblur="this.style.borderColor='#E5E7EB';this.style.boxShadow='none';this.style.background='#F9FAFB'" />
                      }
                    </div>
                  }
                </div>
              </div>
            }

            <!-- ==================== 4. VEHICLES ==================== -->
            @case ('vehicles') {
              <div style="background: #FFFFFF; border-radius: 14px; border: 1px solid #F0F0F0; padding: 28px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <div class="flex items-center gap-3 mb-6">
                  <div style="width: 40px; height: 40px; border-radius: 10px; background: #E7F5ED; display: flex; align-items: center; justify-content: center;">
                    <span class="material-symbols-outlined" style="font-size: 22px; color: #059669;">directions_car</span>
                  </div>
                  <div>
                    <h2 style="font-size: 18px; font-weight: 800; color: #1A1A2E; margin: 0;">Vehicle Settings</h2>
                    <p style="font-size: 13px; color: #6B7280; margin: 1px 0 0;">Configure fleet behavior and rental options</p>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-5">
                  @for (field of vehicleFields; track field.key) {
                    <div>
                      <label style="display: block; font-size: 12px; font-weight: 700; color: #374151; margin-bottom: 5px; letter-spacing: 0.3px; text-transform: uppercase;">{{ field.label }}</label>
                      @if (field.type === 'toggle') {
                        <label style="position: relative; display: inline-block; width: 44px; height: 24px; cursor: pointer;">
                          <input type="checkbox" [checked]="$any(cfg.vehicles)[field.key]" (change)="patchNested('vehicles', field.key, !$any(cfg.vehicles)[field.key])"
                                 style="opacity: 0; width: 0; height: 0; position: absolute;" />
                          <span style="position: absolute; inset: 0; background: {{ $any(cfg.vehicles)[field.key] ? '#005DAC' : '#D1D5DB' }}; border-radius: 12px; transition: background 0.2s;">
                            <span style="position: absolute; top: 2px; left: {{ $any(cfg.vehicles)[field.key] ? '22px' : '2px' }}; width: 20px; height: 20px; background: #FFFFFF; border-radius: 50%; transition: left 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.15);"></span>
                          </span>
                        </label>
                      } @else {
                        <input type="{{ field.type }}" [value]="$any(cfg.vehicles)[field.key]" (input)="patchNested('vehicles', field.key, field.type === 'number' ? Number($any($event.target).value) : $any($event.target).value)"
                               style="width: 100%; border: 1px solid #E5E7EB; border-radius: 10px; padding: 10px 14px; font-size: 14px; color: #1A1A2E; outline: none; box-sizing: border-box; background: #F9FAFB;" />
                      }
                    </div>
                  }
                </div>
              </div>
            }

            <!-- ==================== 5. PAYMENTS ==================== -->
            @case ('payments') {
              <div style="background: #FFFFFF; border-radius: 14px; border: 1px solid #F0F0F0; padding: 28px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <div class="flex items-center gap-3 mb-6">
                  <div style="width: 40px; height: 40px; border-radius: 10px; background: #E7F5ED; display: flex; align-items: center; justify-content: center;">
                    <span class="material-symbols-outlined" style="font-size: 22px; color: #059669;">payments</span>
                  </div>
                  <div>
                    <h2 style="font-size: 18px; font-weight: 800; color: #1A1A2E; margin: 0;">Payment Settings</h2>
                    <p style="font-size: 13px; color: #6B7280; margin: 1px 0 0;">Configure payment options and financial rules</p>
                  </div>
                </div>
                <div class="mb-6">
                  <label style="display: block; font-size: 12px; font-weight: 700; color: #374151; margin-bottom: 10px; letter-spacing: 0.3px; text-transform: uppercase;">Accepted Payment Methods</label>
                  <div class="grid grid-cols-2 gap-3">
                    @for (method of paymentMethods; track method.key) {
                      <div class="flex items-center justify-between" style="border: 1px solid #E5E7EB; border-radius: 10px; padding: 12px 16px; background: #F9FAFB;">
                        <div class="flex items-center gap-3">
                          <div style="width: 36px; height: 36px; border-radius: 8px; background: {{ method.bg }}; display: flex; align-items: center; justify-content: center;">
                            <span class="material-symbols-outlined" style="font-size: 18px; color: {{ method.color }};">{{ method.icon }}</span>
                          </div>
                          <span style="font-size: 13px; font-weight: 600; color: #1A1A2E;">{{ method.label }}</span>
                        </div>
                        <label style="position: relative; display: inline-block; width: 44px; height: 24px; cursor: pointer;">
                          <input type="checkbox" [checked]="$any(cfg.payments.methods)[method.key]" (change)="togglePaymentMethod(method.key)"
                                 style="opacity: 0; width: 0; height: 0; position: absolute;" />
                          <span style="position: absolute; inset: 0; background: {{ $any(cfg.payments.methods)[method.key] ? '#005DAC' : '#D1D5DB' }}; border-radius: 12px; transition: background 0.2s;">
                            <span style="position: absolute; top: 2px; left: {{ $any(cfg.payments.methods)[method.key] ? '22px' : '2px' }}; width: 20px; height: 20px; background: #FFFFFF; border-radius: 50%; transition: left 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.15);"></span>
                          </span>
                        </label>
                      </div>
                    }
                  </div>
                </div>
                <div class="grid grid-cols-3 gap-5">
                  <div>
                    <label style="display: block; font-size: 12px; font-weight: 700; color: #374151; margin-bottom: 5px; letter-spacing: 0.3px; text-transform: uppercase;">Tax Percentage</label>
                    <input type="number" [value]="cfg.payments.taxPercentage" (input)="patchNested('payments', 'taxPercentage', Number($any($event.target).value))"
                           style="width: 100%; border: 1px solid #E5E7EB; border-radius: 10px; padding: 10px 14px; font-size: 14px; outline: none; box-sizing: border-box; background: #F9FAFB;" />
                  </div>
                  <div>
                    <label style="display: block; font-size: 12px; font-weight: 700; color: #374151; margin-bottom: 5px; letter-spacing: 0.3px; text-transform: uppercase;">Deposit Percentage</label>
                    <input type="number" [value]="cfg.payments.depositPercentage" (input)="patchNested('payments', 'depositPercentage', Number($any($event.target).value))"
                           style="width: 100%; border: 1px solid #E5E7EB; border-radius: 10px; padding: 10px 14px; font-size: 14px; outline: none; box-sizing: border-box; background: #F9FAFB;" />
                  </div>
                  <div>
                    <label style="display: block; font-size: 12px; font-weight: 700; color: #374151; margin-bottom: 5px; letter-spacing: 0.3px; text-transform: uppercase;">Default Currency</label>
                    <select [value]="cfg.payments.defaultCurrency" (change)="patchNested('payments', 'defaultCurrency', $any($event.target).value)"
                            style="width: 100%; border: 1px solid #E5E7EB; border-radius: 10px; padding: 10px 14px; font-size: 14px; outline: none; background: #F9FAFB; cursor: pointer;">
                      <option value="USD">USD</option>
                      <option value="KHR">KHR</option>
                      <option value="EUR">EUR</option>
                      <option value="THB">THB</option>
                    </select>
                  </div>
                </div>
              </div>
            }

            <!-- ==================== 6. NOTIFICATIONS ==================== -->
            @case ('notifications') {
              <div style="background: #FFFFFF; border-radius: 14px; border: 1px solid #F0F0F0; padding: 28px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <div class="flex items-center gap-3 mb-6">
                  <div style="width: 40px; height: 40px; border-radius: 10px; background: #E5EEFF; display: flex; align-items: center; justify-content: center;">
                    <span class="material-symbols-outlined" style="font-size: 22px; color: #005DAC;">notifications</span>
                  </div>
                  <div>
                    <h2 style="font-size: 18px; font-weight: 800; color: #1A1A2E; margin: 0;">Notification Settings</h2>
                    <p style="font-size: 13px; color: #6B7280; margin: 1px 0 0;">Manage email and SMS notification preferences</p>
                  </div>
                </div>
                <div class="grid grid-cols-3 gap-4">
                  @for (n of notificationItems; track n.key) {
                    <div style="border: 1px solid #F0F0F0; border-radius: 12px; padding: 18px; background: #FAFBFC;">
                      <div class="flex items-center justify-between mb-2">
                        <span style="font-size: 13px; font-weight: 700; color: #1A1A2E;">{{ n.label }}</span>
                        <label style="position: relative; display: inline-block; width: 44px; height: 24px; cursor: pointer;">
                          <input type="checkbox" [checked]="$any(cfg.notifications)[n.key]" (change)="toggleNotif(n.key)"
                                 style="opacity: 0; width: 0; height: 0; position: absolute;" />
                          <span style="position: absolute; inset: 0; background: {{ $any(cfg.notifications)[n.key] ? '#005DAC' : '#D1D5DB' }}; border-radius: 12px; transition: background 0.2s;">
                            <span style="position: absolute; top: 2px; left: {{ $any(cfg.notifications)[n.key] ? '22px' : '2px' }}; width: 20px; height: 20px; background: #FFFFFF; border-radius: 50%; transition: left 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.15);"></span>
                          </span>
                        </label>
                      </div>
                      <p style="font-size: 12px; color: #6B7280; margin: 0;">{{ n.desc }}</p>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- ==================== 7. PROMOTIONS ==================== -->
            @case ('promotions') {
              <div style="background: #FFFFFF; border-radius: 14px; border: 1px solid #F0F0F0; padding: 28px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <div class="flex items-center gap-3 mb-6">
                  <div style="width: 40px; height: 40px; border-radius: 10px; background: #FFF3E0; display: flex; align-items: center; justify-content: center;">
                    <span class="material-symbols-outlined" style="font-size: 22px; color: #E65100;">local_offer</span>
                  </div>
                  <div>
                    <h2 style="font-size: 18px; font-weight: 800; color: #1A1A2E; margin: 0;">Promotion Settings</h2>
                    <p style="font-size: 13px; color: #6B7280; margin: 1px 0 0;">Configure discount and coupon rules</p>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-5">
                  @for (field of promotionFields; track field.key) {
                    <div>
                      <label style="display: block; font-size: 12px; font-weight: 700; color: #374151; margin-bottom: 5px; letter-spacing: 0.3px; text-transform: uppercase;">{{ field.label }}</label>
                      @if (field.type === 'toggle') {
                        <label style="position: relative; display: inline-block; width: 44px; height: 24px; cursor: pointer;">
                          <input type="checkbox" [checked]="$any(cfg.promotions)[field.key]" (change)="patchNested('promotions', field.key, !$any(cfg.promotions)[field.key])"
                                 style="opacity: 0; width: 0; height: 0; position: absolute;" />
                          <span style="position: absolute; inset: 0; background: {{ $any(cfg.promotions)[field.key] ? '#005DAC' : '#D1D5DB' }}; border-radius: 12px; transition: background 0.2s;">
                            <span style="position: absolute; top: 2px; left: {{ $any(cfg.promotions)[field.key] ? '22px' : '2px' }}; width: 20px; height: 20px; background: #FFFFFF; border-radius: 50%; transition: left 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.15);"></span>
                          </span>
                        </label>
                      } @else {
                        <input type="{{ field.type }}" [value]="$any(cfg.promotions)[field.key]" (input)="patchNested('promotions', field.key, field.type === 'number' ? Number($any($event.target).value) : $any($event.target).value)"
                               style="width: 100%; border: 1px solid #E5E7EB; border-radius: 10px; padding: 10px 14px; font-size: 14px; outline: none; box-sizing: border-box; background: #F9FAFB;" />
                      }
                    </div>
                  }
                </div>
              </div>
            }

            <!-- ==================== 8. USERS & ROLES ==================== -->
            @case ('users') {
              <div style="background: #FFFFFF; border-radius: 14px; border: 1px solid #F0F0F0; padding: 28px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <div class="flex items-center gap-3 mb-6">
                  <div style="width: 40px; height: 40px; border-radius: 10px; background: #F3F0FF; display: flex; align-items: center; justify-content: center;">
                    <span class="material-symbols-outlined" style="font-size: 22px; color: #7C3AED;">manage_accounts</span>
                  </div>
                  <div>
                    <h2 style="font-size: 18px; font-weight: 800; color: #1A1A2E; margin: 0;">User & Role Management</h2>
                    <p style="font-size: 13px; color: #6B7280; margin: 1px 0 0;">Manage permissions and access control</p>
                  </div>
                </div>
                <div style="overflow-x: auto;">
                  <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                    <thead>
                      <tr style="background: #F9FAFB;">
                        <th style="padding: 10px 16px; text-align: left; font-size: 11px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px;">Permission</th>
                        @for (role of permissionRoles; track role) {
                          <th style="padding: 10px 16px; text-align: center; font-size: 11px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px;">{{ role }}</th>
                        }
                      </tr>
                    </thead>
                    <tbody>
                      @for (perm of permissionMatrix; track perm.label) {
                        <tr style="border-bottom: 1px solid #F3F4F6;">
                          <td style="padding: 12px 16px; font-weight: 600; color: #1A1A2E;">{{ perm.label }}</td>
                          @for (role of perm.roles; track $index) {
                            <td style="padding: 12px 16px; text-align: center;">
                              <span style="color: {{ role ? '#059669' : '#D1D5DB' }};">
                                <span class="material-symbols-outlined" style="font-size: 18px;">{{ role ? 'check_circle' : 'cancel' }}</span>
                              </span>
                            </td>
                          }
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            }

            <!-- ==================== 9. SECURITY ==================== -->
            @case ('security') {
              <div style="background: #FFFFFF; border-radius: 14px; border: 1px solid #F0F0F0; padding: 28px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <div class="flex items-center gap-3 mb-6">
                  <div style="width: 40px; height: 40px; border-radius: 10px; background: #FFEAEA; display: flex; align-items: center; justify-content: center;">
                    <span class="material-symbols-outlined" style="font-size: 22px; color: #DC2626;">security</span>
                  </div>
                  <div>
                    <h2 style="font-size: 18px; font-weight: 800; color: #1A1A2E; margin: 0;">Security Center</h2>
                    <p style="font-size: 13px; color: #6B7280; margin: 1px 0 0;">Manage authentication and security settings</p>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-5">
                  @for (field of securityFields; track field.key) {
                    <div style="border: 1px solid #F0F0F0; border-radius: 12px; padding: 18px; background: #FAFBFC;">
                      <div class="flex items-center justify-between mb-1">
                        <span style="font-size: 13px; font-weight: 700; color: #1A1A2E;">{{ field.label }}</span>
                        @if (field.type === 'toggle') {
                          <label style="position: relative; display: inline-block; width: 44px; height: 24px; cursor: pointer;">
                            <input type="checkbox" [checked]="$any(cfg.security)[field.key]" (change)="patchNested('security', field.key, !$any(cfg.security)[field.key])"
                                   style="opacity: 0; width: 0; height: 0; position: absolute;" />
                            <span style="position: absolute; inset: 0; background: {{ $any(cfg.security)[field.key] ? '#005DAC' : '#D1D5DB' }}; border-radius: 12px; transition: background 0.2s;">
                              <span style="position: absolute; top: 2px; left: {{ $any(cfg.security)[field.key] ? '22px' : '2px' }}; width: 20px; height: 20px; background: #FFFFFF; border-radius: 50%; transition: left 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.15);"></span>
                            </span>
                          </label>
                        } @else if (field.type === 'button') {
                          <button style="border: 1px solid #E5E7EB; border-radius: 8px; padding: 6px 14px; font-size: 12px; font-weight: 600; cursor: pointer; background: #FFFFFF; color: #374151;">{{ field.btnLabel }}</button>
                        }
                      </div>
                      @if (field.desc) {
                        <p style="font-size: 12px; color: #6B7280; margin: 0;">{{ field.desc }}</p>
                      }
                    </div>
                  }
                </div>
                <div style="margin-top: 20px; border: 1px solid #F0F0F0; border-radius: 12px; padding: 18px; background: #FAFBFC;">
                  <div class="flex items-center justify-between mb-3">
                    <span style="font-size: 13px; font-weight: 700; color: #1A1A2E;">Recent Login Activity</span>
                    <button style="border: none; border-radius: 8px; padding: 6px 14px; font-size: 12px; font-weight: 600; cursor: pointer; background: #FFEAEA; color: #DC2626;">Logout All Devices</button>
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 8px;">
                    @for (a of loginActivity; track a.label) {
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                          <span style="font-size: 12px; font-weight: 600; color: #1A1A2E;">{{ a.label }}</span>
                          <span style="font-size: 11px; color: #6B7280;">{{ a.device }}</span>
                        </div>
                        <span style="font-size: 11px; color: #6B7280;">{{ a.time }}</span>
                      </div>
                    }
                  </div>
                </div>
              </div>
            }

            <!-- ==================== 10. BACKUP ==================== -->
            @case ('backup') {
              <div style="background: #FFFFFF; border-radius: 14px; border: 1px solid #F0F0F0; padding: 28px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <div class="flex items-center gap-3 mb-6">
                  <div style="width: 40px; height: 40px; border-radius: 10px; background: #E7F5ED; display: flex; align-items: center; justify-content: center;">
                    <span class="material-symbols-outlined" style="font-size: 22px; color: #059669;">backup</span>
                  </div>
                  <div>
                    <h2 style="font-size: 18px; font-weight: 800; color: #1A1A2E; margin: 0;">Backup & Restore</h2>
                    <p style="font-size: 13px; color: #6B7280; margin: 1px 0 0;">Manage data backup and restoration</p>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-5">
                  @for (field of backupFields; track field.key) {
                    <div style="border: 1px solid #F0F0F0; border-radius: 12px; padding: 18px; background: #FAFBFC;">
                      <div class="flex items-center justify-between">
                        <span style="font-size: 13px; font-weight: 700; color: #1A1A2E;">{{ field.label }}</span>
                        @if (field.type === 'toggle') {
                          <label style="position: relative; display: inline-block; width: 44px; height: 24px; cursor: pointer;">
                            <input type="checkbox" [checked]="$any(cfg.backup)[field.key]" (change)="patchNested('backup', field.key, !$any(cfg.backup)[field.key])"
                                   style="opacity: 0; width: 0; height: 0; position: absolute;" />
                            <span style="position: absolute; inset: 0; background: {{ $any(cfg.backup)[field.key] ? '#005DAC' : '#D1D5DB' }}; border-radius: 12px; transition: background 0.2s;">
                              <span style="position: absolute; top: 2px; left: {{ $any(cfg.backup)[field.key] ? '22px' : '2px' }}; width: 20px; height: 20px; background: #FFFFFF; border-radius: 50%; transition: left 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.15);"></span>
                            </span>
                          </label>
                        } @else {
                          <button style="border: 1px solid #E5E7EB; border-radius: 8px; padding: 6px 14px; font-size: 12px; font-weight: 600; cursor: pointer; background: #FFFFFF; color: #374151;">{{ field.btnLabel }}</button>
                        }
                      </div>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- ==================== 11. INTEGRATIONS ==================== -->
            @case ('integrations') {
              <div style="background: #FFFFFF; border-radius: 14px; border: 1px solid #F0F0F0; padding: 28px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <div class="flex items-center gap-3 mb-6">
                  <div style="width: 40px; height: 40px; border-radius: 10px; background: #E5EEFF; display: flex; align-items: center; justify-content: center;">
                    <span class="material-symbols-outlined" style="font-size: 22px; color: #005DAC;">extension</span>
                  </div>
                  <div>
                    <h2 style="font-size: 18px; font-weight: 800; color: #1A1A2E; margin: 0;">Integrations</h2>
                    <p style="font-size: 13px; color: #6B7280; margin: 1px 0 0;">Connect third-party services</p>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  @for (int of integrations; track int.name) {
                    <div style="border: 1px solid #F0F0F0; border-radius: 12px; padding: 18px; background: #FAFBFC; display: flex; align-items: center; justify-content: between;">
                      <div class="flex items-center gap-3">
                        <div style="width: 40px; height: 40px; border-radius: 10px; background: {{ int.color }}; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; color: #FFFFFF;">{{ int.logo }}</div>
                        <div>
                          <span style="font-size: 13px; font-weight: 700; color: #1A1A2E;">{{ int.name }}</span>
                          <span style="display: block; font-size: 11px; color: {{ int.status === 'Connected' ? '#059669' : int.status === 'Error' ? '#DC2626' : '#6B7280' }};">{{ int.status }}</span>
                        </div>
                      </div>
                      <div class="flex items-center gap-2">
                        <button style="border: 1px solid #E5E7EB; border-radius: 8px; padding: 6px 12px; font-size: 11px; font-weight: 600; cursor: pointer; background: #FFFFFF; color: #374151;">Configure</button>
                        <button style="border: 1px solid #FEE2E2; border-radius: 8px; padding: 6px 12px; font-size: 11px; font-weight: 600; cursor: pointer; background: #FFEAEA; color: #DC2626;">{{ int.status === 'Connected' ? 'Disconnect' : 'Connect' }}</button>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- ==================== 12. APPEARANCE ==================== -->
            @case ('appearance') {
              <div style="background: #FFFFFF; border-radius: 14px; border: 1px solid #F0F0F0; padding: 28px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <div class="flex items-center gap-3 mb-6">
                  <div style="width: 40px; height: 40px; border-radius: 10px; background: #F3F0FF; display: flex; align-items: center; justify-content: center;">
                    <span class="material-symbols-outlined" style="font-size: 22px; color: #7C3AED;">contrast</span>
                  </div>
                  <div>
                    <h2 style="font-size: 18px; font-weight: 800; color: #1A1A2E; margin: 0;">Appearance</h2>
                    <p style="font-size: 13px; color: #6B7280; margin: 1px 0 0;">Customize the look and feel</p>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-5">
                  <div>
                    <label style="display: block; font-size: 12px; font-weight: 700; color: #374151; margin-bottom: 8px; letter-spacing: 0.3px; text-transform: uppercase;">Theme</label>
                    <div class="flex gap-3">
                      @for (t of themes; track t.value) {
                        <button (click)="patch('appearanceTheme', t.value)"
                                style="flex: 1; border: 2px solid {{ cfg.appearanceTheme === t.value ? '#005DAC' : '#E5E7EB' }}; border-radius: 12px; padding: 16px; text-align: center; cursor: pointer; background: {{ t.bg }}; transition: all 0.15s;">
                          <span style="font-size: 13px; font-weight: 700; color: {{ t.color }};">{{ t.label }}</span>
                        </button>
                      }
                    </div>
                  </div>
                  <div>
                    <label style="display: block; font-size: 12px; font-weight: 700; color: #374151; margin-bottom: 8px; letter-spacing: 0.3px; text-transform: uppercase;">Language</label>
                    <select [value]="cfg.language" (change)="patch('language', $any($event.target).value)"
                            style="width: 100%; border: 1px solid #E5E7EB; border-radius: 10px; padding: 10px 14px; font-size: 14px; outline: none; background: #F9FAFB; cursor: pointer;">
                      <option value="en">English</option>
                      <option value="km">Khmer</option>
                      <option value="ja">Japanese</option>
                      <option value="th">Thai</option>
                    </select>
                  </div>
                </div>
                <div style="margin-top: 20px;">
                  <label style="display: block; font-size: 12px; font-weight: 700; color: #374151; margin-bottom: 8px; letter-spacing: 0.3px; text-transform: uppercase;">Compact Mode</label>
                  <label style="position: relative; display: inline-block; width: 44px; height: 24px; cursor: pointer;">
                    <input type="checkbox" [checked]="cfg.compactMode" (change)="patch('compactMode', !cfg.compactMode)"
                           style="opacity: 0; width: 0; height: 0; position: absolute;" />
                    <span style="position: absolute; inset: 0; background: {{ cfg.compactMode ? '#005DAC' : '#D1D5DB' }}; border-radius: 12px; transition: background 0.2s;">
                      <span style="position: absolute; top: 2px; left: {{ cfg.compactMode ? '22px' : '2px' }}; width: 20px; height: 20px; background: #FFFFFF; border-radius: 50%; transition: left 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.15);"></span>
                    </span>
                  </label>
                  <span style="font-size: 12px; color: #6B7280; margin-left: 8px;">Reduce padding and font sizes for a denser layout</span>
                </div>
              </div>
            }

            <!-- ==================== 13. REPORTS ==================== -->
            @case ('reports') {
              <div style="background: #FFFFFF; border-radius: 14px; border: 1px solid #F0F0F0; padding: 28px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <div class="flex items-center gap-3 mb-6">
                  <div style="width: 40px; height: 40px; border-radius: 10px; background: #E5EEFF; display: flex; align-items: center; justify-content: center;">
                    <span class="material-symbols-outlined" style="font-size: 22px; color: #005DAC;">analytics</span>
                  </div>
                  <div>
                    <h2 style="font-size: 18px; font-weight: 800; color: #1A1A2E; margin: 0;">Reports Settings</h2>
                    <p style="font-size: 13px; color: #6B7280; margin: 1px 0 0;">Configure reporting preferences</p>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-5">
                  @for (field of reportFields; track field.key) {
                    <div>
                      <label style="display: block; font-size: 12px; font-weight: 700; color: #374151; margin-bottom: 5px; letter-spacing: 0.3px; text-transform: uppercase;">{{ field.label }}</label>
                      @if (field.type === 'toggle') {
                        <label style="position: relative; display: inline-block; width: 44px; height: 24px; cursor: pointer;">
                          <input type="checkbox" [checked]="$any(cfg.reports)[field.key]" (change)="patchNested('reports', field.key, !$any(cfg.reports)[field.key])"
                                 style="opacity: 0; width: 0; height: 0; position: absolute;" />
                          <span style="position: absolute; inset: 0; background: {{ $any(cfg.reports)[field.key] ? '#005DAC' : '#D1D5DB' }}; border-radius: 12px; transition: background 0.2s;">
                            <span style="position: absolute; top: 2px; left: {{ $any(cfg.reports)[field.key] ? '22px' : '2px' }}; width: 20px; height: 20px; background: #FFFFFF; border-radius: 50%; transition: left 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.15);"></span>
                          </span>
                        </label>
                      } @else {
                        <select [value]="$any(cfg.reports)[field.key]" (change)="patchNested('reports', field.key, $any($event.target).value)"
                                style="width: 100%; border: 1px solid #E5E7EB; border-radius: 10px; padding: 10px 14px; font-size: 14px; outline: none; background: #F9FAFB; cursor: pointer;">
                          @for (opt of field.options; track opt) {
                            <option value="{{ opt }}">{{ opt }}</option>
                          }
                        </select>
                      }
                    </div>
                  }
                </div>
              </div>
            }

            <!-- ==================== 14. EMAIL TEMPLATES ==================== -->
            @case ('email') {
              <div style="background: #FFFFFF; border-radius: 14px; border: 1px solid #F0F0F0; padding: 28px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <div class="flex items-center gap-3 mb-6">
                  <div style="width: 40px; height: 40px; border-radius: 10px; background: #E5EEFF; display: flex; align-items: center; justify-content: center;">
                    <span class="material-symbols-outlined" style="font-size: 22px; color: #005DAC;">mail</span>
                  </div>
                  <div>
                    <h2 style="font-size: 18px; font-weight: 800; color: #1A1A2E; margin: 0;">Email Templates</h2>
                    <p style="font-size: 13px; color: #6B7280; margin: 1px 0 0;">Manage email notification templates</p>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  @for (tpl of emailTemplates; track tpl.label) {
                    <div style="border: 1px solid #F0F0F0; border-radius: 12px; padding: 18px; background: #FAFBFC;">
                      <div class="flex items-center justify-between mb-2">
                        <span style="font-size: 13px; font-weight: 700; color: #1A1A2E;">{{ tpl.label }}</span>
                        <span style="font-size: 11px; color: #6B7280;">{{ tpl.status }}</span>
                      </div>
                      <div style="display: flex; gap: 6px;">
                        <button style="flex: 1; border: 1px solid #E5E7EB; border-radius: 8px; padding: 6px; font-size: 11px; font-weight: 600; cursor: pointer; background: #FFFFFF; color: #374151;">Edit</button>
                        <button style="flex: 1; border: 1px solid #E5E7EB; border-radius: 8px; padding: 6px; font-size: 11px; font-weight: 600; cursor: pointer; background: #FFFFFF; color: #374151;">Preview</button>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- ==================== 15. SYSTEM ==================== -->
            @case ('system') {
              <div style="background: #FFFFFF; border-radius: 14px; border: 1px solid #F0F0F0; padding: 28px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <div class="flex items-center gap-3 mb-6">
                  <div style="width: 40px; height: 40px; border-radius: 10px; background: #F3F4F6; display: flex; align-items: center; justify-content: center;">
                    <span class="material-symbols-outlined" style="font-size: 22px; color: #6B7280;">info</span>
                  </div>
                  <div>
                    <h2 style="font-size: 18px; font-weight: 800; color: #1A1A2E; margin: 0;">System Information</h2>
                    <p style="font-size: 13px; color: #6B7280; margin: 1px 0 0;">Application version and system health</p>
                  </div>
                </div>
                <div class="grid grid-cols-3 gap-4 mb-6">
                  @for (info of systemInfo; track info.label) {
                    <div style="border: 1px solid #F0F0F0; border-radius: 12px; padding: 16px; background: #FAFBFC;">
                      <span style="font-size: 11px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.3px;">{{ info.label }}</span>
                      <p style="font-size: 15px; font-weight: 700; color: #1A1A2E; margin: 4px 0 0;">{{ info.value }}</p>
                      @if (info.status) {
                        <span style="font-size: 11px; font-weight: 600; color: {{ info.statusColor }};">🟢 {{ info.status }}</span>
                      }
                    </div>
                  }
                </div>
                <div style="border-top: 1px solid #F3F4F6; padding-top: 20px;">
                  <div class="flex items-center gap-4 mb-6">
                    <div>
                      <span style="font-size: 16px; font-weight: 800; color: #1A1A2E;">Cambo Rent</span>
                      <span style="font-size: 13px; color: #6B7280; margin-left: 6px;">Version 1.0.0</span>
                    </div>
                    <span style="font-size: 12px; color: #6B7280;">Built by Your Team</span>
                  </div>
                  <div class="flex gap-3">
                    <button style="border: 1px solid #E5E7EB; border-radius: 10px; padding: 10px 20px; font-size: 13px; font-weight: 600; cursor: pointer; background: #FFFFFF; color: #374151;">Check for Updates</button>
                    <button style="border: 1px solid #E5E7EB; border-radius: 10px; padding: 10px 20px; font-size: 13px; font-weight: 600; cursor: pointer; background: #FFFFFF; color: #374151;">Documentation</button>
                    <button style="border: 1px solid #E5E7EB; border-radius: 10px; padding: 10px 20px; font-size: 13px; font-weight: 600; cursor: pointer; background: #FFFFFF; color: #374151;">Support</button>
                  </div>
                </div>
              </div>

              <!-- Data Management -->
              <div style="background: #FFFFFF; border-radius: 14px; border: 1px solid #F0F0F0; padding: 28px; margin-top: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <div class="flex items-center gap-3 mb-6">
                  <div style="width: 40px; height: 40px; border-radius: 10px; background: #FFF3E0; display: flex; align-items: center; justify-content: center;">
                    <span class="material-symbols-outlined" style="font-size: 22px; color: #E65100;">storage</span>
                  </div>
                  <div>
                    <h2 style="font-size: 18px; font-weight: 800; color: #1A1A2E; margin: 0;">Data Management</h2>
                    <p style="font-size: 13px; color: #6B7280; margin: 1px 0 0;">Export, import, and optimize your data</p>
                  </div>
                </div>
                <div class="flex flex-wrap gap-3">
                  @for (action of dataActions; track action.label) {
                    <button style="border: 1px solid #E5E7EB; border-radius: 10px; padding: 10px 20px; font-size: 13px; font-weight: 600; cursor: pointer; background: #FFFFFF; color: {{ action.color }}; display: flex; align-items: center; gap: 6px;
                           {{ action.danger ? 'border-color: #FEE2E2;' : '' }}"
                           onmouseover="this.style.background='#F9FAFB'" onmouseout="this.style.background='#FFFFFF'">
                      <span class="material-symbols-outlined" style="font-size: 16px;">{{ action.icon }}</span>
                      {{ action.label }}
                    </button>
                  }
                </div>
              </div>
            }
          }
        </div>
      </div>

      <!-- ==================== STICKY SAVE BAR ==================== -->
      @if (dirty()) {
        <div style="position: sticky; bottom: 0; left: 0; right: 0; background: #FFFFFF; border-top: 1px solid #E5E7EB; padding: 16px 32px; display: flex; align-items: center; justify-content: space-between; z-index: 40; box-shadow: 0 -4px 20px rgba(0,0,0,0.08); animation: fade-in-up 0.3s ease;">
          <div class="flex items-center gap-2">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #F59E0B; display: inline-block;"></span>
            <span style="font-size: 13px; font-weight: 600; color: #374151;">Unsaved Changes</span>
            <span style="font-size: 12px; color: #6B7280;">Your settings have not been saved yet</span>
          </div>
          <div class="flex items-center gap-3">
            <button (click)="resetChanges()"
                    style="border: 1px solid #E5E7EB; border-radius: 10px; padding: 10px 20px; font-size: 13px; font-weight: 600; cursor: pointer; background: #FFFFFF; color: #374151; transition: all 0.15s;"
                    onmouseover="this.style.background='#F9FAFB'" onmouseout="this.style.background='#FFFFFF'">
              Discard
            </button>
            <button (click)="saveChanges()"
                    style="border: none; border-radius: 10px; padding: 10px 24px; font-size: 13px; font-weight: 700; cursor: pointer; background: #005DAC; color: #FFFFFF; display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 6px rgba(0,93,172,0.25); transition: all 0.15s;"
                    onmouseover="this.style.background='#004080'" onmouseout="this.style.background='#005DAC'">
              <span class="material-symbols-outlined" style="font-size: 18px;">save</span>
              Save Changes
            </button>
          </div>
        </div>
      }

      <!-- ==================== SUCCESS TOAST ==================== -->
      @if (savedToast()) {
        <div style="position: fixed; bottom: 80px; right: 32px; background: #059669; color: #FFFFFF; border-radius: 12px; padding: 14px 24px; display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 600; box-shadow: 0 8px 32px rgba(5,150,105,0.3); z-index: 50; animation: fade-in-up 0.3s ease;">
          <span class="material-symbols-outlined" style="font-size: 20px;">check_circle</span>
          Settings saved successfully
        </div>
      }
    </div>
  `,
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
    { key: 'cash', label: 'Cash', icon: 'payments', bg: '#E7F5ED', color: '#059669' },
    { key: 'creditCard', label: 'Credit Card', icon: 'credit_card', bg: '#E5EEFF', color: '#005DAC' },
    { key: 'abaPay', label: 'ABA Pay', icon: 'smartphone', bg: '#F3F0FF', color: '#7C3AED' },
    { key: 'acleda', label: 'ACLEDA', icon: 'account_balance', bg: '#FFF3E0', color: '#E65100' },
    { key: 'wing', label: 'Wing', icon: 'mobile_friendly', bg: '#FFEAEA', color: '#DC2626' },
    { key: 'bankTransfer', label: 'Bank Transfer', icon: 'account_balance', bg: '#F3F4F6', color: '#6B7280' },
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
