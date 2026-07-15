import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../../core/services/booking.service';
import { Booking, BookingStatus } from '../../../models/booking.model';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

const STATUS_STYLE: Record<string, { bg: string; color: string; border: string; dot: string }> = {
  pending:    { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A', dot: '#F59E0B' },
  confirmed:  { bg: '#EFF6FF', color: '#005DAC', border: '#DBEAFE', dot: '#3980F4' },
  active:     { bg: '#ECFDF5', color: '#059669', border: '#A7F3D0', dot: '#10B981' },
  completed:  { bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0', dot: '#22C55E' },
  cancelled:  { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA', dot: '#F87171' },
  overdue:    { bg: '#FFF7ED', color: '#EA580C', border: '#FED7AA', dot: '#F97316' },
};

const PAYMENT_STYLE: Record<string, { bg: string; color: string; border: string; dot: string }> = {
  paid:     { bg: '#ECFDF5', color: '#059669', border: '#A7F3D0', dot: '#10B981' },
  unpaid:   { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A', dot: '#F59E0B' },
  refunded: { bg: '#F3F4F6', color: '#6B7280', border: '#E5E7EB', dot: '#9CA3AF' },
  failed:   { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA', dot: '#F87171' },
};

const QUICK_FILTERS = [
  { key: null, label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'overdue', label: 'Overdue' },
] as const;

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'price_high', label: 'Amount High \u2192 Low' },
  { value: 'price_low', label: 'Amount Low \u2192 High' },
];

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function daysBetween(a: string, b: string): number {
  return Math.max(1, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000));
}

const CUSTOMER_AVATARS = ['#005DAC', '#7C3AED', '#059669', '#DC2626', '#D97706', '#DB2777', '#0D9488', '#4F46E5'];

@Component({
  selector: 'app-manage-bookings',
  standalone: true,
  imports: [DatePipe, FormsModule],
  template: `
    <div style="background: #F8F9FA; min-height: 100%; padding: 28px 32px; font-family: 'Inter', system-ui, -apple-system, sans-serif;">

      <!-- ==================== HEADER ==================== -->
      <div class="flex items-start justify-between mb-8">
        <div>
          <h1 style="font-size: 26px; font-weight: 800; color: #1A1A2E; margin: 0; letter-spacing: -0.3px;">Bookings</h1>
          <p style="font-size: 14px; color: #6B7280; margin: 4px 0 0;">Manage all vehicle reservations and rental transactions.</p>
        </div>
        <button (click)="openBookingWizard()"
                style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 10px; background: #005DAC; color: #FFFFFF; border: none; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 2px 8px rgba(0,93,172,0.25);"
                onmouseover="this.style.background='#004d91';this.style.boxShadow='0 4px 14px rgba(0,93,172,0.35)';this.style.transform='translateY(-1px)'"
                onmouseout="this.style.background='#005DAC';this.style.boxShadow='0 2px 8px rgba(0,93,172,0.25)';this.style.transform='translateY(0)'">
          <span class="material-symbols-outlined" style="font-size: 18px;">add</span>
          New Booking
        </button>
      </div>

      <!-- ==================== FILTER BAR ==================== -->
      <div class="flex items-center gap-3 mb-6 flex-wrap">
        <div style="position: relative; flex: 1; min-width: 220px; max-width: 320px;">
          <span class="material-symbols-outlined" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-size: 18px; color: #9CA3AF; pointer-events: none;">search</span>
          <input #searchInput type="text" placeholder="Search by ID, name, vehicle..."
                 (input)="onSearch(searchInput.value)"
                 style="width: 100%; padding: 10px 14px 10px 42px; border-radius: 10px; border: 1px solid #E5E7EB; background: #FFFFFF; font-size: 14px; color: #1A1A2E; outline: none; transition: all 0.2s ease; box-sizing: border-box;"
                 onfocus="this.style.borderColor='#3980F4';this.style.boxShadow='0 0 0 3px rgba(57,128,244,0.12)'"
                 onblur="this.style.borderColor='#E5E7EB';this.style.boxShadow='none'" />
        </div>

        <div style="position: relative;">
          <select [(ngModel)]="statusFilter" (change)="onFilterChange()" [ngModelOptions]="{standalone: true}"
                  style="padding: 10px 32px 10px 14px; border-radius: 10px; border: 1px solid #E5E7EB; background: #FFFFFF; font-size: 13px; font-weight: 500; color: #1A1A2E; outline: none; cursor: pointer; appearance: none; min-width: 150px; transition: border-color 0.2s, box-shadow 0.2s;"
                  onfocus="this.style.borderColor='#3980F4';this.style.boxShadow='0 0 0 3px rgba(57,128,244,0.12)'"
                  onblur="this.style.borderColor='#E5E7EB';this.style.boxShadow='none'">
            @for (f of quickFilters; track f.key) {
              <option [value]="f.key ?? ''">{{ f.label }}</option>
            }
          </select>
          <span style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; color: #9CA3AF; font-size: 10px;">&#9660;</span>
        </div>

        <div style="position: relative;">
          <select [(ngModel)]="sortBy" (change)="onFilterChange()" [ngModelOptions]="{standalone: true}"
                  style="padding: 10px 32px 10px 14px; border-radius: 10px; border: 1px solid #E5E7EB; background: #FFFFFF; font-size: 13px; font-weight: 500; color: #1A1A2E; outline: none; cursor: pointer; appearance: none; min-width: 170px; transition: border-color 0.2s, box-shadow 0.2s;"
                  onfocus="this.style.borderColor='#3980F4';this.style.boxShadow='0 0 0 3px rgba(57,128,244,0.12)'"
                  onblur="this.style.borderColor='#E5E7EB';this.style.boxShadow='none'">
            @for (s of sortOptions; track s.value) {
              <option [value]="s.value">{{ s.label }}</option>
            }
          </select>
          <span style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; color: #9CA3AF; font-size: 10px;">&#9660;</span>
        </div>

        <div style="position: relative;">
          <button (click)="showExportMenu.set(!showExportMenu())"
                  style="display: inline-flex; align-items: center; gap: 6px; padding: 10px 16px; border-radius: 10px; border: 1px solid #E5E7EB; background: #FFFFFF; font-size: 13px; font-weight: 600; color: #4B5563; cursor: pointer; transition: all 0.15s ease;"
                  onmouseover="this.style.borderColor='#D1D5DB';this.style.color='#1A1A2E'"
                  onmouseout="this.style.borderColor='#E5E7EB';this.style.color='#4B5563'">
            <span class="material-symbols-outlined" style="font-size: 16px;">download</span>
            Export
            <span style="font-size: 10px; color: #9CA3AF;">&#9660;</span>
          </button>
          @if (showExportMenu()) {
            <div style="position: absolute; top: 44px; right: 0; background: #FFFFFF; border-radius: 10px; border: 1px solid #E5E7EB; box-shadow: 0 8px 30px rgba(0,0,0,0.12); min-width: 140px; z-index: 40; padding: 6px;">
              <button style="display: flex; align-items: center; gap: 8px; width: 100%; padding: 9px 12px; border: none; border-radius: 7px; background: transparent; font-size: 13px; font-weight: 500; color: #1A1A2E; cursor: pointer; transition: background 0.1s; text-align: left;"
                      onmouseover="this.style.background='#F9FAFB'" onmouseout="this.style.background='transparent'">
                <span class="material-symbols-outlined" style="font-size: 16px; color: #6B7280;">table</span> Export CSV
              </button>
              <button style="display: flex; align-items: center; gap: 8px; width: 100%; padding: 9px 12px; border: none; border-radius: 7px; background: transparent; font-size: 13px; font-weight: 500; color: #1A1A2E; cursor: pointer; transition: background 0.1s; text-align: left;"
                      onmouseover="this.style.background='#F9FAFB'" onmouseout="this.style.background='transparent'">
                <span class="material-symbols-outlined" style="font-size: 16px; color: #6B7280;">description</span> Export Excel
              </button>
              <button style="display: flex; align-items: center; gap: 8px; width: 100%; padding: 9px 12px; border: none; border-radius: 7px; background: transparent; font-size: 13px; font-weight: 500; color: #1A1A2E; cursor: pointer; transition: background 0.1s; text-align: left;"
                      onmouseover="this.style.background='#F9FAFB'" onmouseout="this.style.background='transparent'">
                <span class="material-symbols-outlined" style="font-size: 16px; color: #6B7280;">picture_as_pdf</span> Export PDF
              </button>
            </div>
          }
        </div>

        @if (statusFilter() || searchQuery() || sortBy() !== 'newest') {
          <button (click)="resetFilters()"
                  style="display: inline-flex; align-items: center; gap: 4px; padding: 10px 14px; border-radius: 10px; border: 1px solid #E5E7EB; background: #FFFFFF; font-size: 13px; font-weight: 600; color: #6B7280; cursor: pointer; transition: all 0.2s ease; white-space: nowrap;"
                  onmouseover="this.style.borderColor='#D1D5DB';this.style.color='#1A1A2E'"
                  onmouseout="this.style.borderColor='#E5E7EB';this.style.color='#6B7280'">
            <span class="material-symbols-outlined" style="font-size: 16px;">close</span>
            Clear
          </button>
        }
      </div>

      <!-- ==================== QUICK FILTER PILLS ==================== -->
      <div class="flex items-center gap-2 mb-6 flex-wrap">
        @for (f of quickFilters; track f.key) {
          <button (click)="setQuickFilter(f.key)"
                  [style]="'padding: 7px 16px; border-radius: 20px; border: 1px solid ' + (activeFilter() === f.key ? '#005DAC' : '#E5E7EB') + '; background: ' + (activeFilter() === f.key ? '#EFF6FF' : '#FFFFFF') + '; font-size: 13px; font-weight: ' + (activeFilter() === f.key ? '700' : '500') + '; color: ' + (activeFilter() === f.key ? '#005DAC' : '#4B5563') + '; cursor: pointer; transition: all 0.15s ease; white-space: nowrap;'">
            {{ f.label }}
          </button>
        }
      </div>

      <!-- ==================== STATISTICS ROW ==================== -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        @for (stat of statCards(); track stat.label) {
          <div style="background: #FFFFFF; border-radius: 12px; padding: 16px 18px; border: 1px solid #F0F0F0; box-shadow: 0 1px 3px rgba(0,0,0,0.04); transition: all 0.2s ease; cursor: default;"
               onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 12px rgba(0,0,0,0.08)'"
               onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 1px 3px rgba(0,0,0,0.04)'">
            <div class="flex items-center gap-3">
              <div [style]="'width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; ' + stat.bg">
                <span class="material-symbols-outlined" [style]="'font-size: 18px; ' + stat.iconColor">{{ stat.icon }}</span>
              </div>
              <div>
                <p style="font-size: 20px; font-weight: 800; color: #1A1A2E; margin: 0; line-height: 1.1;">{{ stat.value }}</p>
                <p style="font-size: 11px; font-weight: 500; color: #6B7280; margin: 2px 0 0;">{{ stat.label }}</p>
              </div>
            </div>
            @if (stat.trend !== null) {
              <span [style]="'display: inline-flex; align-items: center; gap: 2px; margin-top: 6px; font-size: 10px; font-weight: 600; ' + (stat.trend >= 0 ? 'color: #10B981;' : 'color: #DC2626;')">
                <span class="material-symbols-outlined" style="font-size: 12px;">{{ stat.trend >= 0 ? 'trending_up' : 'trending_down' }}</span>
                {{ stat.trend >= 0 ? '+' : '' }}{{ stat.trend }}%
              </span>
            }
          </div>
        }
      </div>

      <!-- ==================== REVENUE SUMMARY ==================== -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        @for (card of revenueCards; track card.label) {
          <div style="background: #FFFFFF; border-radius: 12px; padding: 16px 18px; border: 1px solid #F0F0F0; box-shadow: 0 1px 3px rgba(0,0,0,0.04); transition: all 0.2s ease; cursor: default;"
               onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 12px rgba(0,0,0,0.08)'"
               onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 1px 3px rgba(0,0,0,0.04)'">
            <p style="font-size: 11px; font-weight: 600; color: #6B7280; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 0.4px;">{{ card.label }}</p>
            <p style="font-size: 22px; font-weight: 800; color: #1A1A2E; margin: 0;">{{ card.value }}</p>
          </div>
        }
      </div>

      <!-- ==================== BULK ACTION BAR ==================== -->
      @if (selectedBookings().size > 0) {
        <div style="background: #FFFFFF; border-radius: 12px; padding: 12px 20px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; border: 1px solid #E5E7EB; box-shadow: 0 1px 3px rgba(0,0,0,0.04); animation: fade-in 0.2s ease;">
          <span style="font-size: 14px; font-weight: 600; color: #1A1A2E;">{{ selectedBookings().size }} selected</span>
          <div class="flex items-center gap-2">
            <button (click)="deselectAll()"
                    style="padding: 7px 14px; border-radius: 8px; border: 1px solid #E5E7EB; background: #FFFFFF; font-size: 13px; font-weight: 600; color: #6B7280; cursor: pointer;"
                    onmouseover="this.style.borderColor='#D1D5DB'" onmouseout="this.style.borderColor='#E5E7EB'">Deselect All</button>
            <button (click)="bulkApprove()"
                    style="padding: 7px 14px; border-radius: 8px; border: 1px solid #A7F3D0; background: #ECFDF5; font-size: 13px; font-weight: 600; color: #059669; cursor: pointer; display: flex; align-items: center; gap: 4px;"
                    onmouseover="this.style.background='#D1FAE5'" onmouseout="this.style.background='#ECFDF5'">
              <span class="material-symbols-outlined" style="font-size: 16px;">check</span> Approve
            </button>
            <button (click)="bulkCancel()"
                    style="padding: 7px 14px; border-radius: 8px; border: 1px solid #FECACA; background: #FEF2F2; font-size: 13px; font-weight: 600; color: #DC2626; cursor: pointer; display: flex; align-items: center; gap: 4px;"
                    onmouseover="this.style.background='#FEE2E2'" onmouseout="this.style.background='#FEF2F2'">
              <span class="material-symbols-outlined" style="font-size: 16px;">cancel</span> Cancel
            </button>
          </div>
        </div>
      }

      <!-- ==================== TABLE ==================== -->
      @if (loading()) {
        <div style="background: #FFFFFF; border-radius: 12px; border: 1px solid #F0F0F0; box-shadow: 0 1px 3px rgba(0,0,0,0.04); overflow: hidden;">
          <div style="padding: 14px 20px; border-bottom: 1px solid #F3F4F6; display: flex; gap: 16px; background: #F9FAFB;">
            @for (h of ['ID','Customer','Vehicle','Period','Amount','Payment','Status','Actions']; track h) {
              <div class="skeleton" style="height: 12px; width: {{ h === 'Customer' ? '140px' : h === 'Vehicle' ? '120px' : h === 'Period' ? '140px' : '80px' }};"></div>
            }
          </div>
          @for (i of [1,2,3,4]; track i) {
            <div style="padding: 16px 20px; border-bottom: 1px solid #F3F4F6; display: flex; gap: 16px; align-items: center;">
              <div class="skeleton" style="width: 36px; height: 36px; border-radius: 50%;"></div>
              <div style="flex: 1.5;"><div class="skeleton" style="height: 14px; width: 55%;"></div></div>
              <div style="flex: 1.5;"><div class="skeleton" style="height: 14px; width: 50%;"></div></div>
              <div style="flex: 1.5;"><div class="skeleton" style="height: 14px; width: 40%;"></div></div>
              <div style="flex: 0.8;"><div class="skeleton" style="height: 14px; width: 50px;"></div></div>
              <div style="flex: 0.8;"><div class="skeleton" style="height: 22px; width: 70px; border-radius: 20px;"></div></div>
              <div style="flex: 0.8;"><div class="skeleton" style="height: 22px; width: 60px; border-radius: 20px;"></div></div>
            </div>
          }
        </div>
      } @else if (bookings().length === 0) {
        <div style="background: #FFFFFF; border-radius: 16px; border: 1px solid #F0F0F0; box-shadow: 0 1px 3px rgba(0,0,0,0.04); text-align: center; padding: 80px 20px;">
          <div style="width: 72px; height: 72px; border-radius: 20px; background: #F3F4F6; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
            <span class="material-symbols-outlined" style="font-size: 36px; color: #D1D5DB;">calendar_month</span>
          </div>
          <h3 style="font-size: 18px; font-weight: 700; color: #1A1A2E; margin: 0 0 4px;">No bookings found</h3>
          <p style="font-size: 14px; color: #6B7280; margin: 0 0 24px;">
            @if (searchQuery() || activeFilter()) {
              Try adjusting your filters.
            } @else {
              Create your first booking to get started.
            }
          </p>
          @if (!searchQuery() && !activeFilter()) {
            <button (click)="openBookingWizard()"
                    style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 24px; border-radius: 10px; background: #005DAC; color: #FFFFFF; border: none; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 2px 8px rgba(0,93,172,0.25);"
                    onmouseover="this.style.background='#004d91';this.style.boxShadow='0 4px 14px rgba(0,93,172,0.35)';this.style.transform='translateY(-1px)'"
                    onmouseout="this.style.background='#005DAC';this.style.boxShadow='0 2px 8px rgba(0,93,172,0.25)';this.style.transform='translateY(0)'">
              <span class="material-symbols-outlined" style="font-size: 18px;">add</span>
              Create Booking
            </button>
          }
        </div>
      } @else {
        <div style="background: #FFFFFF; border-radius: 12px; border: 1px solid #F0F0F0; box-shadow: 0 1px 3px rgba(0,0,0,0.04); overflow: hidden;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #F9FAFB;">
                <th style="width: 36px; padding: 14px 8px 14px 20px;">
                  <input type="checkbox"
                         [checked]="allSelected()"
                         (change)="toggleSelectAll()"
                         style="width: 16px; height: 16px; border-radius: 4px; accent-color: #005DAC; cursor: pointer;"
                         aria-label="Select all" />
                </th>
                <th style="padding: 14px 12px; text-align: left; font-size: 11px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.6px;">ID</th>
                <th style="padding: 14px 12px; text-align: left; font-size: 11px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.6px;">Customer</th>
                <th style="padding: 14px 12px; text-align: left; font-size: 11px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.6px;">Vehicle</th>
                <th style="padding: 14px 12px; text-align: left; font-size: 11px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.6px;">Rental Period</th>
                <th style="padding: 14px 12px; text-align: left; font-size: 11px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.6px;">Amount</th>
                <th style="padding: 14px 12px; text-align: center; font-size: 11px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.6px;">Payment</th>
                <th style="padding: 14px 12px; text-align: center; font-size: 11px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.6px;">Status</th>
                <th style="padding: 14px 20px 14px 12px; text-align: right; font-size: 11px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.6px; width: 80px;">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (booking of bookings(); track booking._id) {
                <tr style="border-bottom: 1px solid #F3F4F6; transition: background 0.15s ease; cursor: pointer;"
                    onmouseover="this.style.background='#FAFBFC'" onmouseout="this.style.background='transparent'"
                    (click)="openBookingDrawer(booking)">
                  <td style="padding: 14px 8px 14px 20px;" (click)="$event.stopPropagation()">
                    <input type="checkbox"
                           [checked]="selectedBookings().has(booking._id)"
                           (change)="toggleSelect(booking._id)"
                           style="width: 16px; height: 16px; border-radius: 4px; accent-color: #005DAC; cursor: pointer;"
                           [attr.aria-label]="'Select booking ' + booking._id" />
                  </td>
                  <td style="padding: 14px 12px;">
                    <span style="font-size: 13px; font-weight: 700; color: #005DAC;">#{{ booking._id.slice(-6).toUpperCase() }}</span>
                  </td>
                  <td style="padding: 14px 12px;">
                    <div class="flex items-center gap-2.5">
                      <div [style]="'width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #FFFFFF; flex-shrink: 0; ' + getAvatarColor(getCustomerName(booking))">
                        {{ getInitials(getCustomerName(booking)) }}
                      </div>
                      <div>
                        <span style="font-size: 13px; font-weight: 600; color: #1A1A2E; display: block; line-height: 1.2;">{{ getCustomerName(booking) }}</span>
                        <span style="font-size: 11px; color: #9CA3AF;">{{ getCustomerEmail(booking) }}</span>
                      </div>
                    </div>
                  </td>
                  <td style="padding: 14px 12px;">
                    <div class="flex items-center gap-2.5">
                      <div style="width: 40px; height: 32px; border-radius: 6px; overflow: hidden; flex-shrink: 0; background: #F3F4F6;">
                        @if (getVehicleImage(booking); as img) {
                          <img [src]="img" style="width: 100%; height: 100%; object-fit: cover;" />
                        } @else {
                          <span class="material-symbols-outlined" style="font-size: 18px; color: #3980F4; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">directions_car</span>
                        }
                      </div>
                      <span style="font-size: 13px; font-weight: 600; color: #1A1A2E;">{{ getVehicleName(booking) }}</span>
                    </div>
                  </td>
                  <td style="padding: 14px 12px;">
                    <span style="font-size: 13px; font-weight: 700; color: #1A1A2E; display: block; line-height: 1.3;">{{ bookingDays(booking) }} {{ rentalTypeLabel(booking.rentalType) }}{{ bookingDays(booking) > 1 ? 's' : '' }}</span>
                    <span style="font-size: 11px; color: #9CA3AF;">{{ booking.startDate | date:'MMM d' }} &rarr; {{ booking.endDate | date:'MMM d, y' }}</span>
                  </td>
                  <td style="padding: 14px 12px;">
                    <span style="font-size: 15px; font-weight: 700; color: #1A1A2E;">\${{ booking.totalPrice.toFixed(2) }}</span>
                  </td>
                  <td style="padding: 14px 12px; text-align: center;">
                    @if (getPaymentBadge(booking.paymentStatus); as badge) {
                      <span [style]="'display: inline-flex; align-items: center; gap: 5px; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; background: ' + badge.bg + '; color: ' + badge.color + '; border: 1px solid ' + badge.border + ';'">
                        <span [style]="'width: 5px; height: 5px; border-radius: 50%; background: ' + badge.dot + ';'"></span>
                        {{ badge.label }}
                      </span>
                    }
                  </td>
                  <td style="padding: 14px 12px; text-align: center;">
                    @if (getStatusBadge(booking.status); as badge) {
                      <span [style]="'display: inline-flex; align-items: center; gap: 5px; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; background: ' + badge.bg + '; color: ' + badge.color + '; border: 1px solid ' + badge.border + ';'">
                        <span [style]="'width: 5px; height: 5px; border-radius: 50%; background: ' + badge.dot + ';'"></span>
                        {{ badge.label }}
                      </span>
                    }
                  </td>
                  <td style="padding: 14px 20px 14px 12px; text-align: right;" (click)="$event.stopPropagation()">
                    <div class="flex items-center justify-end gap-1" style="position: relative;">
                      <button (click)="openBookingDrawer(booking)"
                              style="width: 30px; height: 30px; border-radius: 7px; border: none; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #9CA3AF; transition: all 0.15s ease;"
                              onmouseover="this.style.background='#F3F4F6';this.style.color='#4B5563'"
                              onmouseout="this.style.background='transparent';this.style.color='#9CA3AF'"
                              aria-label="View booking details">
                        <span class="material-symbols-outlined" style="font-size: 17px;">visibility</span>
                      </button>
                      <button (click)="openBookingDrawer(booking)"
                              style="width: 30px; height: 30px; border-radius: 7px; border: none; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #9CA3AF; transition: all 0.15s ease;"
                              onmouseover="this.style.background='#F3F4F6';this.style.color='#4B5563'"
                              onmouseout="this.style.background='transparent';this.style.color='#9CA3AF'"
                              aria-label="Edit booking">
                        <span class="material-symbols-outlined" style="font-size: 17px;">edit</span>
                      </button>
                      <div style="position: relative;">
                        <button (click)="toggleQuickMenu(booking._id)"
                                style="width: 30px; height: 30px; border-radius: 7px; border: none; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #9CA3AF; transition: all 0.15s ease;"
                                onmouseover="this.style.background='#F3F4F6';this.style.color='#4B5563'"
                                onmouseout="this.style.background='transparent';this.style.color='#9CA3AF'"
                                aria-label="More actions">
                          <span class="material-symbols-outlined" style="font-size: 17px;">more_vert</span>
                        </button>
                        @if (showQuickMenu() === booking._id) {
                          <div style="position: absolute; top: 34px; right: 0; background: #FFFFFF; border-radius: 10px; border: 1px solid #E5E7EB; box-shadow: 0 8px 30px rgba(0,0,0,0.12); min-width: 200px; z-index: 30; padding: 6px; animation: fade-in 0.15s ease;">
                            <button (click)="openBookingDrawer(booking); showQuickMenu.set(null)"
                                    style="display: flex; align-items: center; gap: 10px; width: 100%; padding: 9px 12px; border: none; border-radius: 7px; background: transparent; font-size: 13px; font-weight: 500; color: #1A1A2E; cursor: pointer; text-align: left;"
                                    onmouseover="this.style.background='#F9FAFB'" onmouseout="this.style.background='transparent'">
                              <span class="material-symbols-outlined" style="font-size: 16px; color: #6B7280;">visibility</span> View Details
                            </button>
                            @if (booking.status === 'pending') {
                              <button (click)="quickStatus(booking._id, 'confirmed'); showQuickMenu.set(null)"
                                      style="display: flex; align-items: center; gap: 10px; width: 100%; padding: 9px 12px; border: none; border-radius: 7px; background: transparent; font-size: 13px; font-weight: 500; color: #059669; cursor: pointer; text-align: left;"
                                      onmouseover="this.style.background='#ECFDF5'" onmouseout="this.style.background='transparent'">
                                <span class="material-symbols-outlined" style="font-size: 16px;">check</span> Approve
                              </button>
                            }
                            @if (booking.status === 'confirmed') {
                              <button (click)="quickStatus(booking._id, 'completed'); showQuickMenu.set(null)"
                                      style="display: flex; align-items: center; gap: 10px; width: 100%; padding: 9px 12px; border: none; border-radius: 7px; background: transparent; font-size: 13px; font-weight: 500; color: #005DAC; cursor: pointer; text-align: left;"
                                      onmouseover="this.style.background='#EFF6FF'" onmouseout="this.style.background='transparent'">
                                <span class="material-symbols-outlined" style="font-size: 16px;">check_circle</span> Complete
                              </button>
                            }
                            <button (click)="showQuickMenu.set(null)"
                                    style="display: flex; align-items: center; gap: 10px; width: 100%; padding: 9px 12px; border: none; border-radius: 7px; background: transparent; font-size: 13px; font-weight: 500; color: #1A1A2E; cursor: pointer; text-align: left;"
                                    onmouseover="this.style.background='#F9FAFB'" onmouseout="this.style.background='transparent'">
                              <span class="material-symbols-outlined" style="font-size: 16px; color: #6B7280;">receipt</span> Generate Invoice
                            </button>
                            @if (booking.status !== 'cancelled' && booking.status !== 'completed') {
                              <div style="height: 1px; background: #F0F0F0; margin: 4px 8px;"></div>
                              <button (click)="cancelBooking(booking._id); showQuickMenu.set(null)"
                                      style="display: flex; align-items: center; gap: 10px; width: 100%; padding: 9px 12px; border: none; border-radius: 7px; background: transparent; font-size: 13px; font-weight: 500; color: #DC2626; cursor: pointer; text-align: left;"
                                      onmouseover="this.style.background='#FEF2F2'" onmouseout="this.style.background='transparent'">
                                <span class="material-symbols-outlined" style="font-size: 16px;">cancel</span> Cancel Booking
                              </button>
                            }
                          </div>
                        }
                      </div>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- ==================== PAGINATION ==================== -->
        @if (totalPages() > 1) {
          <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 24px; margin-top: 24px; border-top: 1px solid #F0F0F0;">
            <span style="font-size: 13px; color: #6B7280;">
              Showing {{ (currentPage() - 1) * pageSize + 1 }}&ndash;{{ pageEnd }} of {{ total() }} bookings
            </span>
            <div class="flex items-center gap-1.5">
              <button (click)="goToPage(currentPage() - 1)" [disabled]="currentPage() <= 1"
                      [style]="'width: 34px; height: 34px; border-radius: 8px; border: 1px solid #E5E7EB; background: #FFFFFF; display: flex; align-items: center; justify-content: center; color: ' + (currentPage() <= 1 ? '#D1D5DB' : '#4B5563') + '; cursor: ' + (currentPage() <= 1 ? 'not-allowed' : 'pointer') + '; transition: all 0.15s ease;'"
                      aria-label="Previous page">
                <span class="material-symbols-outlined" style="font-size: 16px;">chevron_left</span>
              </button>

              @for (p of pageNumbers; track p) {
                @if (p === '...') {
                  <span style="padding: 0 4px; color: #D1D5DB; font-size: 13px;">...</span>
                } @else {
                  <button (click)="goToPage($any(p))"
                          [style]="'min-width: 34px; height: 34px; border-radius: 8px; border: ' + (p === currentPage() ? 'none' : '1px solid #E5E7EB') + '; background: ' + (p === currentPage() ? '#005DAC' : '#FFFFFF') + '; color: ' + (p === currentPage() ? '#FFFFFF' : '#4B5563') + '; font-size: 13px; font-weight: ' + (p === currentPage() ? '700' : '500') + '; cursor: pointer; padding: 0 8px; transition: all 0.15s ease;'"
                          [attr.aria-label]="'Page ' + p">
                    {{ p }}
                  </button>
                }
              }

              <button (click)="goToPage(currentPage() + 1)" [disabled]="currentPage() >= totalPages()"
                      [style]="'width: 34px; height: 34px; border-radius: 8px; border: 1px solid #E5E7EB; background: #FFFFFF; display: flex; align-items: center; justify-content: center; color: ' + (currentPage() >= totalPages() ? '#D1D5DB' : '#4B5563') + '; cursor: ' + (currentPage() >= totalPages() ? 'not-allowed' : 'pointer') + '; transition: all 0.15s ease;'"
                      aria-label="Next page">
                <span class="material-symbols-outlined" style="font-size: 16px;">chevron_right</span>
              </button>
            </div>
          </div>
        }
      }

      <!-- ==================== BOOKING DETAILS DRAWER ==================== -->
      @if (showBookingDrawer(); as booking) {
        <div style="position: fixed; inset: 0; z-index: 90; background: rgba(0,0,0,0.3); backdrop-filter: blur(4px); animation: fade-in 0.15s ease;" (click)="showBookingDrawer.set(null)"></div>
        <div style="position: fixed; top: 0; right: 0; bottom: 0; width: 100%; max-width: 480px; background: #FFFFFF; box-shadow: -8px 0 40px rgba(0,0,0,0.12); z-index: 91; overflow-y: auto; animation: slide-in-right 0.25s ease; display: flex; flex-direction: column;">

          <div style="padding: 24px; border-bottom: 1px solid #F3F4F6; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;">
            <div>
              <h2 style="font-size: 18px; font-weight: 700; color: #1A1A2E; margin: 0;">Booking Details</h2>
              <span style="font-size: 13px; font-weight: 700; color: #005DAC;">#{{ booking._id.slice(-6).toUpperCase() }}</span>
            </div>
            <button (click)="showBookingDrawer.set(null)"
                    style="width: 36px; height: 36px; border: none; border-radius: 10px; background: #F3F4F6; cursor: pointer; color: #6B7280; display: flex; align-items: center; justify-content: center;"
                    onmouseover="this.style.background='#E5E7EB'" onmouseout="this.style.background='#F3F4F6'">
              <span class="material-symbols-outlined" style="font-size: 20px;">close</span>
            </button>
          </div>

          <div style="padding: 24px; flex: 1;">
            <!-- Status Badges -->
            <div class="flex items-center gap-2 mb-6">
              @if (getStatusBadge(booking.status); as badge) {
                <span [style]="'display: inline-flex; align-items: center; gap: 5px; padding: 5px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; background: ' + badge.bg + '; color: ' + badge.color + '; border: 1px solid ' + badge.border + ';'">
                  <span [style]="'width: 6px; height: 6px; border-radius: 50%; background: ' + badge.dot + ';'"></span>
                  {{ badge.label }}
                </span>
              }
              @if (getPaymentBadge(booking.paymentStatus); as badge) {
                <span [style]="'display: inline-flex; align-items: center; gap: 5px; padding: 5px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; background: ' + badge.bg + '; color: ' + badge.color + '; border: 1px solid ' + badge.border + ';'">
                  <span [style]="'width: 6px; height: 6px; border-radius: 50%; background: ' + badge.dot + ';'"></span>
                  {{ badge.label }}
                </span>
              }
            </div>

            <!-- Customer -->
            <div style="margin-bottom: 20px;">
              <p style="font-size: 11px; font-weight: 700; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.6px; margin: 0 0 10px;">Customer</p>
              <div class="flex items-center gap-3 p-3" style="background: #F9FAFB; border-radius: 10px;">
                <div [style]="'width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: #FFFFFF; ' + getAvatarColor(getCustomerName(booking))">
                  {{ getInitials(getCustomerName(booking)) }}
                </div>
                <div>
                  <span style="font-size: 14px; font-weight: 600; color: #1A1A2E; display: block;">{{ getCustomerName(booking) }}</span>
                  <span style="font-size: 12px; color: #6B7280;">{{ getCustomerEmail(booking) }}</span>
                </div>
              </div>
            </div>

            <!-- Vehicle -->
            <div style="margin-bottom: 20px;">
              <p style="font-size: 11px; font-weight: 700; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.6px; margin: 0 0 10px;">Vehicle</p>
              <div class="flex items-center gap-3 p-3" style="background: #F9FAFB; border-radius: 10px;">
                <div style="width: 52px; height: 40px; border-radius: 6px; overflow: hidden; flex-shrink: 0; background: #F3F4F6;">
                  @if (getVehicleImage(booking); as img) {
                    <img [src]="img" style="width: 100%; height: 100%; object-fit: cover;" />
                  } @else {
                    <span class="material-symbols-outlined" style="font-size: 22px; color: #3980F4; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">directions_car</span>
                  }
                </div>
                <div>
                  <span style="font-size: 14px; font-weight: 600; color: #1A1A2E; display: block;">{{ getVehicleName(booking) }}</span>
                  <span style="font-size: 12px; color: #6B7280;">{{ getVehicleBrand(booking) }}</span>
                </div>
              </div>
            </div>

            <!-- Rental Details -->
            <div style="margin-bottom: 20px;">
              <p style="font-size: 11px; font-weight: 700; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.6px; margin: 0 0 10px;">Rental Period</p>
              <div style="background: #F9FAFB; border-radius: 10px; padding: 14px;">
                <div class="flex items-center justify-between mb-3" style="padding-bottom: 10px; border-bottom: 1px solid #F3F4F6;">
                  <span style="font-size: 13px; color: #6B7280;">Pickup</span>
                  <span style="font-size: 13px; font-weight: 600; color: #1A1A2E;">{{ booking.startDate | date:'MMM d, yyyy' }}</span>
                </div>
                <div class="flex items-center justify-between mb-3" style="padding-bottom: 10px; border-bottom: 1px solid #F3F4F6;">
                  <span style="font-size: 13px; color: #6B7280;">Return</span>
                  <span style="font-size: 13px; font-weight: 600; color: #1A1A2E;">{{ booking.endDate | date:'MMM d, yyyy' }}</span>
                </div>
                <div class="flex items-center justify-between mb-3" style="padding-bottom: 10px; border-bottom: 1px solid #F3F4F6;">
                  <span style="font-size: 13px; color: #6B7280;">Duration</span>
                  <span style="font-size: 13px; font-weight: 600; color: #1A1A2E;">{{ bookingDays(booking) }} {{ rentalTypeLabel(booking.rentalType) }}{{ bookingDays(booking) > 1 ? 's' : '' }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span style="font-size: 13px; color: #6B7280;">Type</span>
                  <span style="font-size: 13px; font-weight: 600; color: #1A1A2E; text-transform: capitalize;">{{ booking.rentalType }}</span>
                </div>
              </div>
            </div>

            <!-- Pricing -->
            <div style="margin-bottom: 20px;">
              <p style="font-size: 11px; font-weight: 700; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.6px; margin: 0 0 10px;">Pricing</p>
              <div style="background: #F9FAFB; border-radius: 10px; padding: 14px;">
                <div class="flex items-center justify-between mb-3" style="padding-bottom: 10px; border-bottom: 1px solid #F3F4F6;">
                  <span style="font-size: 13px; color: #6B7280;">Base Price</span>
                  <span style="font-size: 13px; font-weight: 600; color: #1A1A2E;">\${{ booking.totalPrice.toFixed(2) }}</span>
                </div>
                @if (booking.discount > 0) {
                  <div class="flex items-center justify-between mb-3" style="padding-bottom: 10px; border-bottom: 1px solid #F3F4F6;">
                    <span style="font-size: 13px; color: #6B7280;">Discount</span>
                    <span style="font-size: 13px; font-weight: 600; color: #DC2626;">-{{ booking.discount }}%</span>
                  </div>
                }
                <div class="flex items-center justify-between">
                  <span style="font-size: 14px; font-weight: 700; color: #1A1A2E;">Total</span>
                  <span style="font-size: 18px; font-weight: 800; color: #005DAC;">\${{ booking.totalPrice.toFixed(2) }}</span>
                </div>
              </div>
            </div>

            <!-- Notes -->
            @if (booking.notes) {
              <div style="margin-bottom: 20px;">
                <p style="font-size: 11px; font-weight: 700; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.6px; margin: 0 0 10px;">Notes</p>
                <div style="background: #FFFBEB; border-radius: 10px; padding: 12px 14px; border: 1px solid #FDE68A;">
                  <p style="font-size: 13px; color: #92400E; margin: 0;">{{ booking.notes }}</p>
                </div>
              </div>
            }

            <!-- Timeline -->
            <div style="margin-bottom: 20px;">
              <p style="font-size: 11px; font-weight: 700; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.6px; margin: 0 0 12px;">Timeline</p>
              <div style="position: relative; padding-left: 20px;">
                <div style="position: absolute; left: 7px; top: 8px; bottom: 8px; width: 2px; background: #E5E7EB;"></div>
                @for (event of getTimeline(booking); track event.label) {
                  <div style="position: relative; padding-bottom: 16px; padding-left: 16px;">
                    <div [style]="'position: absolute; left: -16px; top: 4px; width: 10px; height: 10px; border-radius: 50%; background: ' + event.color + '; border: 2px solid #FFFFFF; box-shadow: 0 0 0 2px ' + event.color + ';'"></div>
                    <p style="font-size: 13px; font-weight: 600; color: #1A1A2E; margin: 0;">{{ event.label }}</p>
                    <p style="font-size: 11px; color: #9CA3AF; margin: 2px 0 0;">{{ event.time }}</p>
                  </div>
                }
              </div>
            </div>

            <!-- Actions -->
            <div style="display: flex; flex-direction: column; gap: 8px;">
              @if (booking.status === 'pending') {
                <button (click)="quickStatus(booking._id, 'confirmed'); showBookingDrawer.set(null)"
                        style="display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 12px; border-radius: 10px; border: none; background: #059669; font-size: 14px; font-weight: 700; color: #FFFFFF; cursor: pointer; transition: all 0.15s ease;"
                        onmouseover="this.style.background='#047857'" onmouseout="this.style.background='#059669'">
                  <span class="material-symbols-outlined" style="font-size: 18px;">check</span> Approve Booking
                </button>
              }
              @if (booking.status === 'confirmed') {
                <button (click)="quickStatus(booking._id, 'completed'); showBookingDrawer.set(null)"
                        style="display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 12px; border-radius: 10px; border: none; background: #005DAC; font-size: 14px; font-weight: 700; color: #FFFFFF; cursor: pointer; transition: all 0.15s ease;"
                        onmouseover="this.style.background='#004d91'" onmouseout="this.style.background='#005DAC'">
                  <span class="material-symbols-outlined" style="font-size: 18px;">check_circle</span> Complete Booking
                </button>
              }
              @if (booking.status !== 'cancelled' && booking.status !== 'completed') {
                <button (click)="cancelBooking(booking._id); showBookingDrawer.set(null)"
                        style="display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 12px; border-radius: 10px; border: 1px solid #FECACA; background: #FEF2F2; font-size: 14px; font-weight: 700; color: #DC2626; cursor: pointer; transition: all 0.15s ease;"
                        onmouseover="this.style.background='#FEE2E2'" onmouseout="this.style.background='#FEF2F2'">
                  <span class="material-symbols-outlined" style="font-size: 18px;">cancel</span> Cancel Booking
                </button>
              }
            </div>
          </div>
        </div>
      }

      <!-- ==================== BOOKING WIZARD ==================== -->
      @if (showWizard()) {
        <div style="position: fixed; inset: 0; z-index: 100; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.4); padding: 16px; backdrop-filter: blur(6px); animation: fade-in 0.15s ease;">
          <div style="width: 100%; max-width: 540px; background: #FFFFFF; border-radius: 16px; box-shadow: 0 24px 80px rgba(0,0,0,0.2); animation: scale-in 0.2s ease; overflow: hidden;">
            <!-- Wizard Header -->
            <div style="padding: 24px 28px 0; display: flex; align-items: center; justify-content: space-between;">
              <div>
                <h2 style="font-size: 20px; font-weight: 700; color: #1A1A2E; margin: 0;">New Booking</h2>
                <p style="font-size: 13px; color: #6B7280; margin: 2px 0 0;">Step {{ wizardStep() }} of 4</p>
              </div>
              <button (click)="showWizard.set(false)"
                      style="width: 36px; height: 36px; border: none; border-radius: 10px; background: #F3F4F6; cursor: pointer; color: #6B7280; display: flex; align-items: center; justify-content: center;"
                      onmouseover="this.style.background='#E5E7EB'" onmouseout="this.style.background='#F3F4F6'">
                <span class="material-symbols-outlined" style="font-size: 20px;">close</span>
              </button>
            </div>

            <!-- Steps -->
            <div class="flex items-center gap-2" style="padding: 16px 28px;">
              @for (s of [1,2,3,4]; track s) {
                <div [style]="'flex: 1; height: 4px; border-radius: 4px; background: ' + (s <= wizardStep() ? '#005DAC' : '#E5E7EB') + '; transition: background 0.3s;'"></div>
              }
            </div>

            <!-- Step Content -->
            <div style="padding: 0 28px 24px;">
              @if (wizardStep() === 1) {
                <div>
                  <p style="font-size: 14px; font-weight: 600; color: #374151; margin: 0 0 4px;">Select Customer</p>
                  <p style="font-size: 13px; color: #6B7280; margin: 0 0 12px;">Search and select the customer for this booking.</p>
                  <input type="text" placeholder="Search by name or email..."
                         style="width: 100%; padding: 10px 14px; border-radius: 10px; border: 1px solid #E5E7EB; font-size: 14px; color: #1A1A2E; outline: none; box-sizing: border-box; transition: border-color 0.15s;"
                         onfocus="this.style.borderColor='#3980F4';this.style.boxShadow='0 0 0 3px rgba(57,128,244,0.12)'"
                         onblur="this.style.borderColor='#E5E7EB';this.style.boxShadow='none'" />
                </div>
              }
              @if (wizardStep() === 2) {
                <div>
                  <p style="font-size: 14px; font-weight: 600; color: #374151; margin: 0 0 4px;">Choose Vehicle</p>
                  <p style="font-size: 13px; color: #6B7280; margin: 0 0 12px;">Select an available vehicle from the fleet.</p>
                  <div style="border: 1px solid #E5E7EB; border-radius: 10px; padding: 20px; text-align: center;">
                    <span class="material-symbols-outlined" style="font-size: 32px; color: #D1D5DB;">directions_car</span>
                    <p style="font-size: 13px; color: #9CA3AF; margin: 8px 0 0;">Vehicle selection will be loaded from inventory.</p>
                  </div>
                </div>
              }
              @if (wizardStep() === 3) {
                <div>
                  <p style="font-size: 14px; font-weight: 600; color: #374151; margin: 0 0 4px;">Rental Details</p>
                  <p style="font-size: 13px; color: #6B7280; margin: 0 0 12px;">Set the pickup and return dates.</p>
                  <div class="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label style="display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 4px;">Pickup Date</label>
                      <input type="date" style="width: 100%; padding: 10px 14px; border-radius: 10px; border: 1px solid #E5E7EB; font-size: 14px; outline: none; box-sizing: border-box;" />
                    </div>
                    <div>
                      <label style="display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 4px;">Return Date</label>
                      <input type="date" style="width: 100%; padding: 10px 14px; border-radius: 10px; border: 1px solid #E5E7EB; font-size: 14px; outline: none; box-sizing: border-box;" />
                    </div>
                  </div>
                  <div>
                    <label style="display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 4px;">Rental Type</label>
                    <select style="width: 100%; padding: 10px 14px; border-radius: 10px; border: 1px solid #E5E7EB; font-size: 14px; outline: none; background: #FFFFFF; box-sizing: border-box;">
                      <option>Daily</option>
                      <option>Hourly</option>
                      <option>Weekly</option>
                      <option>Monthly</option>
                    </select>
                  </div>
                </div>
              }
              @if (wizardStep() === 4) {
                <div>
                  <p style="font-size: 14px; font-weight: 600; color: #374151; margin: 0 0 4px;">Confirmation</p>
                  <p style="font-size: 13px; color: #6B7280; margin: 0 0 12px;">Review the booking summary before creating.</p>
                  <div style="background: #F9FAFB; border-radius: 12px; padding: 16px;">
                    <div class="flex items-center justify-between mb-2">
                      <span style="font-size: 13px; color: #6B7280;">Customer</span>
                      <span style="font-size: 13px; font-weight: 600; color: #1A1A2E;">—</span>
                    </div>
                    <div class="flex items-center justify-between mb-2">
                      <span style="font-size: 13px; color: #6B7280;">Vehicle</span>
                      <span style="font-size: 13px; font-weight: 600; color: #1A1A2E;">—</span>
                    </div>
                    <div class="flex items-center justify-between mb-2">
                      <span style="font-size: 13px; color: #6B7280;">Duration</span>
                      <span style="font-size: 13px; font-weight: 600; color: #1A1A2E;">—</span>
                    </div>
                    <div style="border-top: 1px solid #E5E7EB; margin: 8px 0; padding-top: 8px;">
                      <div class="flex items-center justify-between">
                        <span style="font-size: 14px; font-weight: 700; color: #1A1A2E;">Total</span>
                        <span style="font-size: 20px; font-weight: 800; color: #005DAC;">\$0.00</span>
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>

            <!-- Wizard Footer -->
            <div style="padding: 16px 28px 24px; display: flex; justify-content: space-between; border-top: 1px solid #F3F4F6;">
              <button (click)="prevStep()" [disabled]="wizardStep() <= 1"
                      [style]="'padding: 10px 20px; border-radius: 10px; border: 1px solid #E5E7EB; background: #FFFFFF; font-size: 14px; font-weight: 600; color: ' + (wizardStep() <= 1 ? '#D1D5DB' : '#6B7280') + '; cursor: ' + (wizardStep() <= 1 ? 'not-allowed' : 'pointer') + '; transition: all 0.15s ease;'">
                Back
              </button>
              @if (wizardStep() < 4) {
                <button (click)="nextStep()"
                        style="padding: 10px 24px; border-radius: 10px; border: none; background: #005DAC; font-size: 14px; font-weight: 700; color: #FFFFFF; cursor: pointer; transition: all 0.15s ease; box-shadow: 0 2px 8px rgba(0,93,172,0.25);"
                        onmouseover="this.style.background='#004d91'" onmouseout="this.style.background='#005DAC'">
                  Continue
                </button>
              } @else {
                <button (click)="showWizard.set(false)"
                        style="padding: 10px 24px; border-radius: 10px; border: none; background: #059669; font-size: 14px; font-weight: 700; color: #FFFFFF; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.15s ease; box-shadow: 0 2px 8px rgba(5,150,105,0.25);"
                        onmouseover="this.style.background='#047857'" onmouseout="this.style.background='#059669'">
                  <span class="material-symbols-outlined" style="font-size: 18px;">check</span>
                  Create Booking
                </button>
              }
            </div>
          </div>
        </div>
      }

      <!-- Backdrops -->
      @if (showQuickMenu()) { <div style="position: fixed; inset: 0; z-index: 20;" (click)="showQuickMenu.set(null)"></div> }
      @if (showExportMenu()) { <div style="position: fixed; inset: 0; z-index: 35;" (click)="showExportMenu.set(false)"></div> }

    </div>
  `,
})
export class ManageBookingsComponent implements OnInit {
  private readonly bookingService = inject(BookingService);
  private readonly searchSubject = new Subject<string>();

  readonly bookings = signal<Booking[]>([]);
  readonly loading = signal(true);
  readonly activeFilter = signal<string | null>(null);
  readonly statusFilter = signal('');
  readonly searchQuery = signal('');
  readonly sortBy = signal('newest');
  readonly currentPage = signal(1);
  readonly totalPages = signal(0);
  readonly total = signal(0);
  readonly pageSize = 10;

  readonly selectedBookings = signal<Set<string>>(new Set());
  readonly showBookingDrawer = signal<Booking | null>(null);
  readonly showQuickMenu = signal<string | null>(null);
  readonly showExportMenu = signal(false);
  readonly showWizard = signal(false);
  readonly wizardStep = signal(1);

  readonly quickFilters = QUICK_FILTERS;
  readonly sortOptions = SORT_OPTIONS;

  constructor() {
    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => { this.currentPage.set(1); this.loadBookings(); });
  }

  ngOnInit() { this.loadBookings(); }

  get pageEnd() {
    return Math.min(this.currentPage() * this.pageSize, this.total());
  }

  get pageNumbers() {
    const total = this.totalPages();
    const current = this.currentPage();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | '...')[] = [1];
    if (current > 3) pages.push('...');
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (current < total - 2) pages.push('...');
    pages.push(total);
    return pages;
  }

  readonly statCards = computed(() => {
    const all = this.bookings();
    const pending = all.filter(b => b.status === 'pending').length;
    const confirmed = all.filter(b => b.status === 'confirmed').length;
    const completed = all.filter(b => b.status === 'completed').length;
    const cancelled = all.filter(b => b.status === 'cancelled').length;
    const totalRev = all.reduce((s, b) => s + b.totalPrice, 0);
    const lastMonth = all.filter(b => {
      const d = new Date(b.createdAt || b.startDate);
      const now = new Date();
      return d.getMonth() === (now.getMonth() - 1 + 12) % 12;
    });
    const lastMonthRev = lastMonth.reduce((s, b) => s + b.totalPrice, 0);
    const trend = lastMonthRev > 0 ? Math.round((totalRev - lastMonthRev) / lastMonthRev * 100) : 0;
    return [
      { label: 'Total Bookings', icon: 'calendar_month', value: this.total(),
        bg: 'background:#EFF6FF', iconColor: 'color:#3980F4', trend },
      { label: 'Active Rentals', icon: 'trending_up', value: confirmed,
        bg: 'background:#ECFDF5', iconColor: 'color:#10B981', trend: null },
      { label: 'Pending', icon: 'schedule', value: pending,
        bg: 'background:#FFFBEB', iconColor: 'color:#F59E0B', trend: null },
      { label: 'Completed', icon: 'check_circle', value: completed,
        bg: 'background:#F0FDF4', iconColor: 'color:#22C55E', trend: null },
      { label: 'Cancelled', icon: 'cancel', value: cancelled,
        bg: 'background:#FEF2F2', iconColor: 'color:#F87171', trend: null },
      { label: 'Revenue', icon: 'payments', value: '$' + totalRev.toLocaleString(),
        bg: 'background:#F5F3FF', iconColor: 'color:#8B5CF6', trend },
    ];
  });

  get revenueCards() {
    const all = this.bookings();
    const totalRev = all.reduce((s, b) => s + b.totalPrice, 0);
    const today = all.filter(b => {
      const d = new Date(b.createdAt || b.startDate);
      const now = new Date();
      return d.toDateString() === now.toDateString();
    });
    const todayRev = today.reduce((s, b) => s + b.totalPrice, 0);
    const thisWeek = all.filter(b => {
      const d = new Date(b.createdAt || b.startDate);
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      return d >= weekStart;
    });
    const weekRev = thisWeek.reduce((s, b) => s + b.totalPrice, 0);
    const avgVal = all.length > 0 ? totalRev / all.length : 0;
    return [
      { label: "Today's Revenue", value: '$' + todayRev.toLocaleString() },
      { label: 'This Week', value: '$' + weekRev.toLocaleString() },
      { label: 'Avg Booking Value', value: '$' + avgVal.toFixed(2) },
      { label: 'Occupancy', value: all.length > 0 ? Math.round(all.filter(b => b.status === 'confirmed').length / all.length * 100) + '%' : '0%' },
    ];
  }

  onSearch(query: string) {
    this.searchQuery.set(query);
    this.searchSubject.next(query);
  }

  onFilterChange() {
    this.currentPage.set(1);
    this.loadBookings();
  }

  setQuickFilter(key: string | null) {
    this.activeFilter.set(key);
    this.statusFilter.set(key ?? '');
    this.currentPage.set(1);
    this.loadBookings();
  }

  resetFilters() {
    this.searchQuery.set('');
    this.activeFilter.set(null);
    this.statusFilter.set('');
    this.sortBy.set('newest');
    this.currentPage.set(1);
    this.loadBookings();
  }

  loadBookings() {
    this.loading.set(true);
    const status = this.activeFilter() || this.statusFilter() || undefined;
    this.bookingService.getBookings(status, this.currentPage(), this.pageSize).subscribe({
      next: (res) => {
        this.bookings.set(res.bookings);
        this.totalPages.set(res.totalPages);
        this.total.set(res.total);
        this.loading.set(false);
        this.selectedBookings.set(new Set());
      },
      error: () => this.loading.set(false),
    });
  }

  goToPage(page: string | number) {
    page = typeof page === 'string' ? parseInt(page, 10) : page;
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadBookings();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  allSelected(): boolean {
    return this.bookings().length > 0 && this.selectedBookings().size === this.bookings().length;
  }

  toggleSelect(id: string) {
    const set = new Set(this.selectedBookings());
    if (set.has(id)) set.delete(id); else set.add(id);
    this.selectedBookings.set(set);
  }

  toggleSelectAll() {
    if (this.allSelected()) this.selectedBookings.set(new Set());
    else this.selectedBookings.set(new Set(this.bookings().map(b => b._id)));
  }

  deselectAll() { this.selectedBookings.set(new Set()); }

  toggleQuickMenu(id: string) {
    this.showQuickMenu.set(this.showQuickMenu() === id ? null : id);
  }

  openBookingDrawer(booking: Booking) {
    this.showBookingDrawer.set(booking);
  }

  openBookingWizard() {
    this.wizardStep.set(1);
    this.showWizard.set(true);
  }

  nextStep() { if (this.wizardStep() < 4) this.wizardStep.update(s => s + 1); }
  prevStep() { if (this.wizardStep() > 1) this.wizardStep.update(s => s - 1); }

  quickStatus(id: string, status: BookingStatus) {
    this.bookingService.updateBookingStatus(id, status).subscribe(() => this.loadBookings());
  }

  cancelBooking(id: string) {
    if (confirm('Cancel this booking?')) {
      this.bookingService.cancelBooking(id).subscribe(() => this.loadBookings());
    }
  }

  bulkApprove() {
    const ids = Array.from(this.selectedBookings());
    ids.forEach(id => this.bookingService.updateBookingStatus(id, 'confirmed').subscribe());
    this.deselectAll();
    setTimeout(() => this.loadBookings(), 500);
  }

  bulkCancel() {
    const ids = Array.from(this.selectedBookings());
    ids.forEach(id => this.bookingService.cancelBooking(id).subscribe());
    this.deselectAll();
    setTimeout(() => this.loadBookings(), 500);
  }

  getStatusBadge(status: string): { bg: string; color: string; border: string; dot: string; label: string } | null {
    const s = STATUS_STYLE[status];
    if (!s) return null;
    return { ...s, label: status.charAt(0).toUpperCase() + status.slice(1) };
  }

  getPaymentBadge(status: string): { bg: string; color: string; border: string; dot: string; label: string } | null {
    const s = PAYMENT_STYLE[status];
    if (!s) return null;
    const labels: Record<string, string> = { paid: 'Paid', unpaid: 'Pending', refunded: 'Refunded', failed: 'Failed' };
    return { ...s, label: labels[status] || status };
  }

  getInitials = getInitials;

  getAvatarColor(name: string): string {
    const colors = ['#005DAC', '#7C3AED', '#059669', '#DC2626', '#D97706', '#DB2777', '#0D9488', '#4F46E5'];
    return 'background: ' + colors[name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length] + ';';
  }

  getCustomerName(booking: Booking): string {
    const u = booking.userId;
    return typeof u === 'object' && u !== null ? u.name : 'Walk-in';
  }

  getCustomerEmail(booking: Booking): string {
    const u = booking.userId;
    return typeof u === 'object' && u !== null ? u.email : 'N/A';
  }

  getVehicleName(booking: Booking): string {
    const v = booking.vehicleId;
    return typeof v === 'object' && v !== null ? v.name : 'Unknown';
  }

  getVehicleBrand(booking: Booking): string {
    const v = booking.vehicleId;
    return typeof v === 'object' && v !== null ? v.brand : '';
  }

  getVehicleImage(booking: Booking): string | null {
    const v = booking.vehicleId;
    if (typeof v === 'object' && v !== null && v.images?.length > 0) return v.images[0];
    return null;
  }

  bookingDays(booking: Booking): number {
    return daysBetween(booking.startDate, booking.endDate);
  }

  rentalTypeLabel(type: string): string {
    return type.charAt(0).toUpperCase() + type.slice(1);
  }

  getTimeline(booking: Booking): { label: string; time: string; color: string }[] {
    const events: { label: string; time: string; color: string }[] = [];
    const created = booking.createdAt || booking.startDate;
    events.push({ label: 'Booking Created', time: new Date(created).toLocaleDateString(), color: '#3980F4' });
    if (['confirmed', 'completed', 'cancelled'].includes(booking.status)) {
      if (booking.paymentStatus === 'paid') events.push({ label: 'Payment Completed', time: 'Completed', color: '#10B981' });
      else events.push({ label: 'Payment Pending', time: 'Awaiting', color: '#F59E0B' });
    }
    if (booking.status === 'confirmed' || booking.status === 'completed') {
      events.push({ label: 'Booking Confirmed', time: new Date(booking.startDate).toLocaleDateString(), color: '#3980F4' });
    }
    if (booking.status === 'completed') {
      events.push({ label: 'Booking Completed', time: new Date(booking.endDate).toLocaleDateString(), color: '#22C55E' });
    }
    if (booking.status === 'cancelled') {
      events.push({ label: 'Booking Cancelled', time: 'Cancelled', color: '#F87171' });
    }
    return events.length > 1 ? events : [
      { label: 'Booking Created', time: new Date(created).toLocaleDateString(), color: '#3980F4' },
      { label: 'In Progress', time: 'Awaiting updates', color: '#9CA3AF' },
    ];
  }
}
