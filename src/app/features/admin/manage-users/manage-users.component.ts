import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../models/user.model';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];
const ROLE_OPTIONS = [
  { value: '', label: 'All Roles' },
  { value: 'customer', label: 'Customer' },
  { value: 'admin', label: 'Admin' },
];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'name_asc', label: 'Name A\u2192Z' },
  { value: 'name_desc', label: 'Name Z\u2192A' },
];

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [DatePipe, FormsModule],
  template: `
    <div style="background: #F8F9FA; min-height: 100%; padding: 28px 32px; font-family: 'Inter', system-ui, -apple-system, sans-serif;">

      <!-- ==================== HEADER ==================== -->
      <div class="flex items-start justify-between mb-8">
        <div>
          <h1 style="font-size: 26px; font-weight: 800; color: #1A1A2E; margin: 0; letter-spacing: -0.3px;">Customers</h1>
          <p style="font-size: 14px; color: #6B7280; margin: 4px 0 0;">Manage all registered customers and administrators.</p>
        </div>
        <button (click)="openAddDialog()"
                style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 10px; background: #005DAC; color: #FFFFFF; border: none; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 2px 8px rgba(0,93,172,0.25);"
                onmouseover="this.style.background='#004d91';this.style.boxShadow='0 4px 14px rgba(0,93,172,0.35)';this.style.transform='translateY(-1px)'"
                onmouseout="this.style.background='#005DAC';this.style.boxShadow='0 2px 8px rgba(0,93,172,0.25)';this.style.transform='translateY(0)'">
          <span class="material-symbols-outlined" style="font-size: 18px;">person_add</span>
          Add Customer
        </button>
      </div>

      <!-- ==================== FILTER BAR ==================== -->
      <div class="flex items-center gap-3 mb-6 flex-wrap">
        <div style="position: relative; flex: 1; min-width: 240px; max-width: 360px;">
          <span class="material-symbols-outlined" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-size: 18px; color: #9CA3AF; pointer-events: none;">search</span>
          <input #searchInput type="text" placeholder="Search by name, email, phone..."
                 (input)="onSearch(searchInput.value)"
                 style="width: 100%; padding: 10px 14px 10px 42px; border-radius: 10px; border: 1px solid #E5E7EB; background: #FFFFFF; font-size: 14px; color: #1A1A2E; outline: none; transition: all 0.2s ease; box-sizing: border-box;"
                 onfocus="this.style.borderColor='#3980F4';this.style.boxShadow='0 0 0 3px rgba(57,128,244,0.12)'"
                 onblur="this.style.borderColor='#E5E7EB';this.style.boxShadow='none'" />
        </div>

        <div style="position: relative;">
          <select [(ngModel)]="roleFilter" (change)="onFilterChange()" [ngModelOptions]="{standalone: true}"
                  style="padding: 10px 32px 10px 14px; border-radius: 10px; border: 1px solid #E5E7EB; background: #FFFFFF; font-size: 13px; font-weight: 500; color: #1A1A2E; outline: none; cursor: pointer; appearance: none; min-width: 140px; transition: border-color 0.2s, box-shadow 0.2s;"
                  onfocus="this.style.borderColor='#3980F4';this.style.boxShadow='0 0 0 3px rgba(57,128,244,0.12)'"
                  onblur="this.style.borderColor='#E5E7EB';this.style.boxShadow='none'">
            @for (r of roleOptions; track r.value) {
              <option [value]="r.value">{{ r.label }}</option>
            }
          </select>
          <span style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; color: #9CA3AF; font-size: 10px;">&#9660;</span>
        </div>

        <div style="position: relative;">
          <select [(ngModel)]="statusFilter" (change)="onFilterChange()" [ngModelOptions]="{standalone: true}"
                  style="padding: 10px 32px 10px 14px; border-radius: 10px; border: 1px solid #E5E7EB; background: #FFFFFF; font-size: 13px; font-weight: 500; color: #1A1A2E; outline: none; cursor: pointer; appearance: none; min-width: 150px; transition: border-color 0.2s, box-shadow 0.2s;"
                  onfocus="this.style.borderColor='#3980F4';this.style.boxShadow='0 0 0 3px rgba(57,128,244,0.12)'"
                  onblur="this.style.borderColor='#E5E7EB';this.style.boxShadow='none'">
            @for (s of statusOptions; track s.value) {
              <option [value]="s.value">{{ s.label }}</option>
            }
          </select>
          <span style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; color: #9CA3AF; font-size: 10px;">&#9660;</span>
        </div>

        <div style="position: relative;">
          <select [(ngModel)]="sortBy" (change)="onFilterChange()" [ngModelOptions]="{standalone: true}"
                  style="padding: 10px 32px 10px 14px; border-radius: 10px; border: 1px solid #E5E7EB; background: #FFFFFF; font-size: 13px; font-weight: 500; color: #1A1A2E; outline: none; cursor: pointer; appearance: none; min-width: 160px; transition: border-color 0.2s, box-shadow 0.2s;"
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

        @if (searchQuery() || roleFilter() || statusFilter() || sortBy() !== 'newest') {
          <button (click)="resetFilters()"
                  style="display: inline-flex; align-items: center; gap: 4px; padding: 10px 14px; border-radius: 10px; border: 1px solid #E5E7EB; background: #FFFFFF; font-size: 13px; font-weight: 600; color: #6B7280; cursor: pointer; transition: all 0.2s ease; white-space: nowrap;"
                  onmouseover="this.style.borderColor='#D1D5DB';this.style.color='#1A1A2E'"
                  onmouseout="this.style.borderColor='#E5E7EB';this.style.color='#6B7280'">
            <span class="material-symbols-outlined" style="font-size: 16px;">close</span>
            Clear
          </button>
        }
      </div>

      <!-- ==================== STATISTICS ROW ==================== -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-7">
        @for (stat of statsCards; track stat.label) {
          <div style="background: #FFFFFF; border-radius: 12px; padding: 18px 20px; border: 1px solid #F0F0F0; box-shadow: 0 1px 3px rgba(0,0,0,0.04); transition: all 0.2s ease; cursor: default;"
               onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 12px rgba(0,0,0,0.08)'"
               onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 1px 3px rgba(0,0,0,0.04)'">
            <div class="flex items-center gap-3">
              <div [style]="'width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; ' + stat.bg">
                <span class="material-symbols-outlined" [style]="'font-size: 20px; ' + stat.iconColor">{{ stat.icon }}</span>
              </div>
              <div>
                <p style="font-size: 22px; font-weight: 800; color: #1A1A2E; margin: 0; line-height: 1.1;">{{ stat.count }}</p>
                <p style="font-size: 12px; font-weight: 500; color: #6B7280; margin: 2px 0 0;">{{ stat.label }}</p>
              </div>
            </div>
            @if (stat.trend) {
              <span style="display: inline-flex; align-items: center; gap: 2px; margin-top: 8px; font-size: 11px; font-weight: 600; color: #10B981;">
                <span class="material-symbols-outlined" style="font-size: 14px;">trending_up</span>
                {{ stat.trend }}
              </span>
            }
          </div>
        }
      </div>

      <!-- ==================== BULK ACTION BAR ==================== -->
      @if (selectedUsers().size > 0) {
        <div style="background: #FFFFFF; border-radius: 12px; padding: 12px 20px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; border: 1px solid #E5E7EB; box-shadow: 0 1px 3px rgba(0,0,0,0.04); animation: fade-in 0.2s ease;">
          <span style="font-size: 14px; font-weight: 600; color: #1A1A2E;">
            {{ selectedUsers().size }} selected
          </span>
          <div class="flex items-center gap-2">
            <button (click)="deselectAll()"
                    style="padding: 7px 14px; border-radius: 8px; border: 1px solid #E5E7EB; background: #FFFFFF; font-size: 13px; font-weight: 600; color: #6B7280; cursor: pointer; transition: all 0.15s ease;"
                    onmouseover="this.style.borderColor='#D1D5DB'" onmouseout="this.style.borderColor='#E5E7EB'">
              Deselect All
            </button>
            <button (click)="deleteSelected()"
                    style="padding: 7px 14px; border-radius: 8px; border: 1px solid #FECACA; background: #FEF2F2; font-size: 13px; font-weight: 600; color: #DC2626; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: all 0.15s ease;"
                    onmouseover="this.style.background='#FEE2E2'" onmouseout="this.style.background='#FEF2F2'">
              <span class="material-symbols-outlined" style="font-size: 16px;">delete</span>
              Delete
            </button>
            <button (click)="bulkSuspend()"
                    style="padding: 7px 14px; border-radius: 8px; border: 1px solid #FED7AA; background: #FFF7ED; font-size: 13px; font-weight: 600; color: #EA580C; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: all 0.15s ease;"
                    onmouseover="this.style.background='#FFEDD5'" onmouseout="this.style.background='#FFF7ED'">
              <span class="material-symbols-outlined" style="font-size: 16px;">block</span>
              Suspend
            </button>
            <button (click)="bulkActivate()"
                    style="padding: 7px 14px; border-radius: 8px; border: 1px solid #A7F3D0; background: #ECFDF5; font-size: 13px; font-weight: 600; color: #059669; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: all 0.15s ease;"
                    onmouseover="this.style.background='#D1FAE5'" onmouseout="this.style.background='#ECFDF5'">
              <span class="material-symbols-outlined" style="font-size: 16px;">check_circle</span>
              Activate
            </button>
          </div>
        </div>
      }

      <!-- ==================== TABLE ==================== -->
      @if (loading()) {
        <div style="background: #FFFFFF; border-radius: 12px; border: 1px solid #F0F0F0; box-shadow: 0 1px 3px rgba(0,0,0,0.04); overflow: hidden;">
          <div style="padding: 14px 24px; border-bottom: 1px solid #F3F4F6; display: flex; gap: 16px; background: #F9FAFB;">
            @for (h of ['Customer','Contact','Role','Registered','Status','Actions']; track h) {
              <div class="skeleton" style="height: 12px; width: {{ h === 'Customer' ? '160px' : h === 'Contact' ? '180px' : h === 'Actions' ? '100px' : '80px' }};"></div>
            }
          </div>
          @for (i of [1,2,3,4,5]; track i) {
            <div style="padding: 16px 24px; border-bottom: 1px solid #F3F4F6; display: flex; gap: 16px; align-items: center;">
              <div class="skeleton" style="width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;"></div>
              <div style="flex: 2;"><div class="skeleton" style="height: 14px; width: 65%;"></div></div>
              <div style="flex: 2;"><div class="skeleton" style="height: 14px; width: 55%;"></div></div>
              <div style="flex: 1;"><div class="skeleton" style="height: 22px; width: 70px; border-radius: 20px;"></div></div>
              <div style="flex: 1;"><div class="skeleton" style="height: 14px; width: 50%;"></div></div>
              <div style="flex: 0.8;"><div class="skeleton" style="height: 22px; width: 60px; border-radius: 6px;"></div></div>
            </div>
          }
        </div>
      } @else if (users().length === 0) {
        <div style="background: #FFFFFF; border-radius: 16px; border: 1px solid #F0F0F0; box-shadow: 0 1px 3px rgba(0,0,0,0.04); text-align: center; padding: 80px 20px;">
          <div style="width: 72px; height: 72px; border-radius: 20px; background: #F3F4F6; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
            <span class="material-symbols-outlined" style="font-size: 36px; color: #D1D5DB;">person_off</span>
          </div>
          <h3 style="font-size: 18px; font-weight: 700; color: #1A1A2E; margin: 0 0 4px;">No customers found</h3>
          <p style="font-size: 14px; color: #6B7280; margin: 0 0 24px;">
            @if (searchQuery() || roleFilter() || statusFilter()) {
              Try adjusting your filters.
            } @else {
              Get started by inviting your first customer.
            }
          </p>
          @if (!searchQuery() && !roleFilter() && !statusFilter()) {
            <button (click)="openAddDialog()"
                    style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 24px; border-radius: 10px; background: #005DAC; color: #FFFFFF; border: none; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 2px 8px rgba(0,93,172,0.25);"
                    onmouseover="this.style.background='#004d91';this.style.boxShadow='0 4px 14px rgba(0,93,172,0.35)';this.style.transform='translateY(-1px)'"
                    onmouseout="this.style.background='#005DAC';this.style.boxShadow='0 2px 8px rgba(0,93,172,0.25)';this.style.transform='translateY(0)'">
              <span class="material-symbols-outlined" style="font-size: 18px;">person_add</span>
              Invite Customer
            </button>
          }
        </div>
      } @else {
        <div style="background: #FFFFFF; border-radius: 12px; border: 1px solid #F0F0F0; box-shadow: 0 1px 3px rgba(0,0,0,0.04); overflow: hidden;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #F9FAFB;">
                <th style="width: 36px; padding: 14px 12px 14px 20px;">
                  <input type="checkbox"
                         [checked]="allSelected()"
                         (change)="toggleSelectAll()"
                         style="width: 16px; height: 16px; border-radius: 4px; border: 1px solid #D1D5DB; cursor: pointer; accent-color: #005DAC;"
                         aria-label="Select all" />
                </th>
                <th style="padding: 14px 16px; text-align: left; font-size: 11px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.6px;">Customer</th>
                <th style="padding: 14px 16px; text-align: left; font-size: 11px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.6px;">Contact</th>
                <th style="padding: 14px 16px; text-align: left; font-size: 11px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.6px;">Role</th>
                <th style="padding: 14px 16px; text-align: left; font-size: 11px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.6px;">Registered</th>
                <th style="padding: 14px 16px; text-align: center; font-size: 11px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.6px;">Status</th>
                <th style="padding: 14px 20px 14px 16px; text-align: right; font-size: 11px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.6px; width: 100px;">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (user of users(); track user._id) {
                <tr style="border-bottom: 1px solid #F3F4F6; transition: background 0.15s ease; cursor: pointer;"
                    onmouseover="this.style.background='#FAFBFC'" onmouseout="this.style.background='transparent'"
                    (click)="openProfileDrawer(user)">
                  <td style="padding: 14px 12px 14px 20px;" (click)="$event.stopPropagation()">
                    <input type="checkbox"
                           [checked]="selectedUsers().has(user._id)"
                           (change)="toggleSelect(user._id)"
                           style="width: 16px; height: 16px; border-radius: 4px; border: 1px solid #D1D5DB; cursor: pointer; accent-color: #005DAC;"
                           [attr.aria-label]="'Select ' + user.name" />
                  </td>
                  <td style="padding: 14px 16px;">
                    <div class="flex items-center gap-3">
                      <div style="position: relative; flex-shrink: 0;">
                        @if (user.avatar) {
                          <img [src]="user.avatar" [alt]="user.name"
                               style="width: 36px; height: 36px; border-radius: 10px; object-fit: cover;" />
                        } @else {
                          <div [style]="'width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: #FFFFFF; flex-shrink: 0; ' + getAvatarColor(user.name)">
                            {{ user.name.charAt(0).toUpperCase() }}
                          </div>
                        }
                      </div>
                      <div>
                        <span style="font-size: 14px; font-weight: 600; color: #1A1A2E; display: block; line-height: 1.2;">{{ user.name }}</span>
                        <span style="font-size: 11px; color: #9CA3AF;">
                          @if (user.role === 'admin') {
                            Administrator
                          } @else {
                            Member since {{ user.createdAt | date:'MMM yyyy' }}
                          }
                        </span>
                      </div>
                    </div>
                  </td>
                  <td style="padding: 14px 16px;">
                    <span style="font-size: 13px; color: #1A1A2E; display: block; line-height: 1.3;">{{ user.email }}</span>
                    <span style="font-size: 12px; color: #9CA3AF;">{{ user.phone || 'No phone number' }}</span>
                  </td>
                  <td style="padding: 14px 16px;">
                    @if (user.role === 'admin') {
                      <span style="display: inline-flex; align-items: center; gap: 4px; padding: 3px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; background: #EFF6FF; color: #005DAC; border: 1px solid #DBEAFE;">
                        <span style="width: 5px; height: 5px; border-radius: 50%; background: #3980F4;"></span>
                        Admin
                      </span>
                    } @else {
                      <span style="display: inline-flex; align-items: center; gap: 4px; padding: 3px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; background: #F3F4F6; color: #6B7280; border: 1px solid #E5E7EB;">
                        <span style="width: 5px; height: 5px; border-radius: 50%; background: #9CA3AF;"></span>
                        Customer
                      </span>
                    }
                  </td>
                  <td style="padding: 14px 16px;">
                    <span style="font-size: 13px; color: #374151; display: block; line-height: 1.3;">{{ user.createdAt | date:'MMM d, yyyy' }}</span>
                    <span style="font-size: 11px; color: #9CA3AF;">{{ getRelativeTime(user.createdAt) }}</span>
                  </td>
                  <td style="padding: 14px 16px; text-align: center;">
                    @if (user.isActive !== false) {
                      <span style="display: inline-flex; align-items: center; gap: 5px; padding: 4px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; background: #ECFDF5; color: #059669; border: 1px solid #A7F3D0;">
                        <span style="width: 6px; height: 6px; border-radius: 50%; background: #10B981; box-shadow: 0 0 6px rgba(16,185,129,0.4);"></span>
                        Active
                      </span>
                    } @else {
                      <span style="display: inline-flex; align-items: center; gap: 5px; padding: 4px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; background: #FEF2F2; color: #DC2626; border: 1px solid #FECACA;">
                        <span style="width: 6px; height: 6px; border-radius: 50%; background: #F87171; box-shadow: 0 0 6px rgba(248,113,113,0.4);"></span>
                        Disabled
                      </span>
                    }
                  </td>
                  <td style="padding: 14px 20px 14px 16px; text-align: right;" (click)="$event.stopPropagation()">
                    <div class="flex items-center justify-end gap-1" style="position: relative;">
                      <button (click)="openProfileDrawer(user)"
                              style="width: 32px; height: 32px; border-radius: 8px; border: none; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #9CA3AF; transition: all 0.15s ease;"
                              onmouseover="this.style.background='#F3F4F6';this.style.color='#4B5563'"
                              onmouseout="this.style.background='transparent';this.style.color='#9CA3AF'"
                              aria-label="View profile">
                        <span class="material-symbols-outlined" style="font-size: 18px;">visibility</span>
                      </button>
                      <button (click)="openEditDialog(user)"
                              style="width: 32px; height: 32px; border-radius: 8px; border: none; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #9CA3AF; transition: all 0.15s ease;"
                              onmouseover="this.style.background='#F3F4F6';this.style.color='#4B5563'"
                              onmouseout="this.style.background='transparent';this.style.color='#9CA3AF'"
                              aria-label="Edit user">
                        <span class="material-symbols-outlined" style="font-size: 18px;">edit</span>
                      </button>
                      <div style="position: relative;">
                        <button (click)="toggleQuickMenu(user._id)"
                                style="width: 32px; height: 32px; border-radius: 8px; border: none; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #9CA3AF; transition: all 0.15s ease;"
                                onmouseover="this.style.background='#F3F4F6';this.style.color='#4B5563'"
                                onmouseout="this.style.background='transparent';this.style.color='#9CA3AF'"
                                aria-label="More actions">
                          <span class="material-symbols-outlined" style="font-size: 18px;">more_vert</span>
                        </button>
                        @if (showQuickMenu() === user._id) {
                          <div style="position: absolute; top: 36px; right: 0; background: #FFFFFF; border-radius: 10px; border: 1px solid #E5E7EB; box-shadow: 0 8px 30px rgba(0,0,0,0.12); min-width: 190px; z-index: 30; padding: 6px; animation: fade-in 0.15s ease;">
                            <button (click)="openProfileDrawer(user); showQuickMenu.set(null)"
                                    style="display: flex; align-items: center; gap: 10px; width: 100%; padding: 9px 12px; border: none; border-radius: 7px; background: transparent; font-size: 13px; font-weight: 500; color: #1A1A2E; cursor: pointer; transition: background 0.1s; text-align: left;"
                                    onmouseover="this.style.background='#F9FAFB'" onmouseout="this.style.background='transparent'">
                              <span class="material-symbols-outlined" style="font-size: 16px; color: #6B7280;">person</span>
                              View Profile
                            </button>
                            <button (click)="showQuickMenu.set(null)"
                                    style="display: flex; align-items: center; gap: 10px; width: 100%; padding: 9px 12px; border: none; border-radius: 7px; background: transparent; font-size: 13px; font-weight: 500; color: #1A1A2E; cursor: pointer; transition: background 0.1s; text-align: left;"
                                    onmouseover="this.style.background='#F9FAFB'" onmouseout="this.style.background='transparent'">
                              <span class="material-symbols-outlined" style="font-size: 16px; color: #6B7280;">history</span>
                              Booking History
                            </button>
                            <button (click)="openEditDialog(user); showQuickMenu.set(null)"
                                    style="display: flex; align-items: center; gap: 10px; width: 100%; padding: 9px 12px; border: none; border-radius: 7px; background: transparent; font-size: 13px; font-weight: 500; color: #1A1A2E; cursor: pointer; transition: background 0.1s; text-align: left;"
                                    onmouseover="this.style.background='#F9FAFB'" onmouseout="this.style.background='transparent'">
                              <span class="material-symbols-outlined" style="font-size: 16px; color: #6B7280;">edit</span>
                              Edit
                            </button>
                            <button (click)="showQuickMenu.set(null)"
                                    style="display: flex; align-items: center; gap: 10px; width: 100%; padding: 9px 12px; border: none; border-radius: 7px; background: transparent; font-size: 13px; font-weight: 500; color: #1A1A2E; cursor: pointer; transition: background 0.1s; text-align: left;"
                                    onmouseover="this.style.background='#F9FAFB'" onmouseout="this.style.background='transparent'">
                              <span class="material-symbols-outlined" style="font-size: 16px; color: #6B7280;">lock_reset</span>
                              Reset Password
                            </button>
                            <div style="height: 1px; background: #F0F0F0; margin: 4px 8px;"></div>
                            @if (user.isActive !== false) {
                              <button (click)="toggleActive(user, false); showQuickMenu.set(null)"
                                      style="display: flex; align-items: center; gap: 10px; width: 100%; padding: 9px 12px; border: none; border-radius: 7px; background: transparent; font-size: 13px; font-weight: 500; color: #EA580C; cursor: pointer; transition: background 0.1s; text-align: left;"
                                      onmouseover="this.style.background='#FFF7ED'" onmouseout="this.style.background='transparent'">
                                <span class="material-symbols-outlined" style="font-size: 16px;">block</span>
                                Suspend
                              </button>
                            } @else {
                              <button (click)="toggleActive(user, true); showQuickMenu.set(null)"
                                      style="display: flex; align-items: center; gap: 10px; width: 100%; padding: 9px 12px; border: none; border-radius: 7px; background: transparent; font-size: 13px; font-weight: 500; color: #059669; cursor: pointer; transition: background 0.1s; text-align: left;"
                                      onmouseover="this.style.background='#ECFDF5'" onmouseout="this.style.background='transparent'">
                                <span class="material-symbols-outlined" style="font-size: 16px;">check_circle</span>
                                Enable
                              </button>
                            }
                            <button (click)="confirmDeleteUser(user); showQuickMenu.set(null)"
                                    style="display: flex; align-items: center; gap: 10px; width: 100%; padding: 9px 12px; border: none; border-radius: 7px; background: transparent; font-size: 13px; font-weight: 500; color: #DC2626; cursor: pointer; transition: background 0.1s; text-align: left;"
                                    onmouseover="this.style.background='#FEF2F2'" onmouseout="this.style.background='transparent'">
                              <span class="material-symbols-outlined" style="font-size: 16px;">delete</span>
                              Delete
                            </button>
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
              Showing {{ (currentPage() - 1) * pageSize + 1 }}&ndash;{{ pageEnd }} of {{ total() }} customers
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

      <!-- ==================== DELETE CONFIRMATION MODAL ==================== -->
      @if (showDeleteConfirm(); as target) {
        <div style="position: fixed; inset: 0; z-index: 100; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.4); padding: 16px; backdrop-filter: blur(6px); animation: fade-in 0.15s ease;">
          <div style="width: 100%; max-width: 420px; background: #FFFFFF; border-radius: 16px; padding: 28px; box-shadow: 0 24px 80px rgba(0,0,0,0.2); animation: scale-in 0.2s ease;">
            <div style="width: 48px; height: 48px; border-radius: 14px; background: #FEF2F2; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
              <span class="material-symbols-outlined" style="font-size: 24px; color: #DC2626;">delete_forever</span>
            </div>
            <h3 style="font-size: 18px; font-weight: 700; color: #1A1A2E; margin: 0 0 4px;">Delete Customer</h3>
            <div class="flex items-center gap-3 mb-4 p-3" style="background: #F9FAFB; border-radius: 10px;">
              <div [style]="'width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: #FFFFFF; flex-shrink: 0; ' + getAvatarColor(target.name)">
                {{ target.name.charAt(0).toUpperCase() }}
              </div>
              <div>
                <span style="font-size: 14px; font-weight: 600; color: #1A1A2E; display: block;">{{ target.name }}</span>
                <span style="font-size: 12px; color: #6B7280;">{{ target.email }}</span>
              </div>
            </div>
            <p style="font-size: 14px; color: #6B7280; margin: 0 0 20px;">This action cannot be undone. All associated data will be permanently removed.</p>
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
              <button (click)="showDeleteConfirm.set(null)"
                      style="padding: 10px 20px; border-radius: 10px; border: 1px solid #E5E7EB; background: #FFFFFF; font-size: 14px; font-weight: 600; color: #6B7280; cursor: pointer; transition: all 0.15s ease;"
                      onmouseover="this.style.borderColor='#D1D5DB'" onmouseout="this.style.borderColor='#E5E7EB'">
                Cancel
              </button>
              <button (click)="executeDelete()"
                      style="padding: 10px 20px; border-radius: 10px; border: none; background: #DC2626; font-size: 14px; font-weight: 700; color: #FFFFFF; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.15s ease; box-shadow: 0 2px 8px rgba(220,38,38,0.25);"
                      onmouseover="this.style.background='#B91C1C';this.style.boxShadow='0 4px 14px rgba(220,38,38,0.35)'"
                      onmouseout="this.style.background='#DC2626';this.style.boxShadow='0 2px 8px rgba(220,38,38,0.25)'">
                <span class="material-symbols-outlined" style="font-size: 18px;">delete</span>
                Delete Customer
              </button>
            </div>
          </div>
        </div>
      }

      <!-- ==================== PROFILE DRAWER ==================== -->
      @if (showProfileDrawer(); as profileUser) {
        <div style="position: fixed; inset: 0; z-index: 90; background: rgba(0,0,0,0.3); backdrop-filter: blur(4px); animation: fade-in 0.15s ease;" (click)="showProfileDrawer.set(null)"></div>
        <div style="position: fixed; top: 0; right: 0; bottom: 0; width: 100%; max-width: 480px; background: #FFFFFF; box-shadow: -8px 0 40px rgba(0,0,0,0.12); z-index: 91; overflow-y: auto; animation: slide-in-right 0.25s ease; display: flex; flex-direction: column;">
          <!-- Drawer Header -->
          <div style="padding: 24px; border-bottom: 1px solid #F3F4F6; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;">
            <h2 style="font-size: 18px; font-weight: 700; color: #1A1A2E; margin: 0;">Customer Profile</h2>
            <button (click)="showProfileDrawer.set(null)"
                    style="width: 36px; height: 36px; border: none; border-radius: 10px; background: #F3F4F6; cursor: pointer; color: #6B7280; display: flex; align-items: center; justify-content: center; transition: background 0.15s;"
                    onmouseover="this.style.background='#E5E7EB'" onmouseout="this.style.background='#F3F4F6'">
              <span class="material-symbols-outlined" style="font-size: 20px;">close</span>
            </button>
          </div>

          <div style="padding: 24px; flex: 1;">
            <!-- Profile Photo Area -->
            <div style="text-align: center; margin-bottom: 24px;">
              @if (profileUser.avatar) {
                <img [src]="profileUser.avatar" [alt]="profileUser.name"
                     style="width: 80px; height: 80px; border-radius: 20px; object-fit: cover; margin: 0 auto; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />
              } @else {
                <div [style]="'width: 80px; height: 80px; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 700; color: #FFFFFF; margin: 0 auto; box-shadow: 0 4px 12px rgba(0,0,0,0.1); ' + getAvatarColor(profileUser.name)">
                  {{ profileUser.name.charAt(0).toUpperCase() }}
                </div>
              }
              <h3 style="font-size: 20px; font-weight: 700; color: #1A1A2E; margin: 12px 0 2px;">{{ profileUser.name }}</h3>
              <span style="display: inline-flex; align-items: center; gap: 4px; padding: 3px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; {{ profileUser.role === 'admin' ? 'background: #EFF6FF; color: #005DAC; border: 1px solid #DBEAFE;' : 'background: #F3F4F6; color: #6B7280; border: 1px solid #E5E7EB;' }}">
                {{ profileUser.role === 'admin' ? 'Administrator' : 'Customer' }}
              </span>
            </div>

            <!-- Detail Sections -->
            <div style="margin-bottom: 24px;">
              <p style="font-size: 11px; font-weight: 700; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.6px; margin: 0 0 12px;">Contact Information</p>
              <div style="background: #F9FAFB; border-radius: 12px; padding: 16px;">
                <div class="flex items-center justify-between mb-3" style="padding-bottom: 12px; border-bottom: 1px solid #F3F4F6;">
                  <span style="font-size: 13px; color: #6B7280;">Email</span>
                  <span style="font-size: 13px; font-weight: 600; color: #1A1A2E;">{{ profileUser.email }}</span>
                </div>
                <div class="flex items-center justify-between mb-3" style="padding-bottom: 12px; border-bottom: 1px solid #F3F4F6;">
                  <span style="font-size: 13px; color: #6B7280;">Phone</span>
                  <span style="font-size: 13px; font-weight: 600; color: #1A1A2E;">{{ profileUser.phone || 'Not provided' }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span style="font-size: 13px; color: #6B7280;">Status</span>
                  @if (profileUser.isActive !== false) {
                    <span style="display: inline-flex; align-items: center; gap: 5px; padding: 3px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; background: #ECFDF5; color: #059669;">
                      <span style="width: 5px; height: 5px; border-radius: 50%; background: #10B981;"></span>
                      Active
                    </span>
                  } @else {
                    <span style="display: inline-flex; align-items: center; gap: 5px; padding: 3px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; background: #FEF2F2; color: #DC2626;">
                      <span style="width: 5px; height: 5px; border-radius: 50%; background: #F87171;"></span>
                      Disabled
                    </span>
                  }
                </div>
              </div>
            </div>

            <div style="margin-bottom: 24px;">
              <p style="font-size: 11px; font-weight: 700; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.6px; margin: 0 0 12px;">Account Details</p>
              <div style="background: #F9FAFB; border-radius: 12px; padding: 16px;">
                <div class="flex items-center justify-between mb-3" style="padding-bottom: 12px; border-bottom: 1px solid #F3F4F6;">
                  <span style="font-size: 13px; color: #6B7280;">Member Since</span>
                  <span style="font-size: 13px; font-weight: 600; color: #1A1A2E;">{{ profileUser.createdAt | date:'MMM d, yyyy' }}</span>
                </div>
                <div class="flex items-center justify-between mb-3" style="padding-bottom: 12px; border-bottom: 1px solid #F3F4F6;">
                  <span style="font-size: 13px; color: #6B7280;">Last Login</span>
                  <span style="font-size: 13px; font-weight: 600; color: #1A1A2E;">{{ getLastLogin(profileUser) }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span style="font-size: 13px; color: #6B7280;">Role</span>
                  <span style="font-size: 13px; font-weight: 600; color: #1A1A2E; text-transform: capitalize;">{{ profileUser.role }}</span>
                </div>
              </div>
            </div>

            <div style="margin-bottom: 24px;">
              <p style="font-size: 11px; font-weight: 700; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.6px; margin: 0 0 12px;">Security Actions</p>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <button style="display: flex; align-items: center; gap: 10px; width: 100%; padding: 12px 16px; border-radius: 10px; border: 1px solid #E5E7EB; background: #FFFFFF; font-size: 13px; font-weight: 600; color: #1A1A2E; cursor: pointer; transition: all 0.15s ease; text-align: left;"
                        onmouseover="this.style.borderColor='#D1D5DB';this.style.background='#F9FAFB'"
                        onmouseout="this.style.borderColor='#E5E7EB';this.style.background='#FFFFFF'">
                  <span class="material-symbols-outlined" style="font-size: 18px; color: #6B7280;">lock_reset</span>
                  Reset Password
                </button>
                <button style="display: flex; align-items: center; gap: 10px; width: 100%; padding: 12px 16px; border-radius: 10px; border: 1px solid #E5E7EB; background: #FFFFFF; font-size: 13px; font-weight: 600; color: #1A1A2E; cursor: pointer; transition: all 0.15s ease; text-align: left;"
                        onmouseover="this.style.borderColor='#D1D5DB';this.style.background='#F9FAFB'"
                        onmouseout="this.style.borderColor='#E5E7EB';this.style.background='#FFFFFF'">
                  <span class="material-symbols-outlined" style="font-size: 18px; color: #6B7280;">history</span>
                  View Login History
                </button>
                @if (profileUser.isActive !== false) {
                  <button (click)="toggleActive(profileUser, false); showProfileDrawer.set(null)"
                          style="display: flex; align-items: center; gap: 10px; width: 100%; padding: 12px 16px; border-radius: 10px; border: 1px solid #FECACA; background: #FEF2F2; font-size: 13px; font-weight: 600; color: #DC2626; cursor: pointer; transition: all 0.15s ease; text-align: left;"
                          onmouseover="this.style.background='#FEE2E2'" onmouseout="this.style.background='#FEF2F2'">
                    <span class="material-symbols-outlined" style="font-size: 18px;">block</span>
                    Disable Account
                  </button>
                } @else {
                  <button (click)="toggleActive(profileUser, true); showProfileDrawer.set(null)"
                          style="display: flex; align-items: center; gap: 10px; width: 100%; padding: 12px 16px; border-radius: 10px; border: 1px solid #A7F3D0; background: #ECFDF5; font-size: 13px; font-weight: 600; color: #059669; cursor: pointer; transition: all 0.15s ease; text-align: left;"
                          onmouseover="this.style.background='#D1FAE5'" onmouseout="this.style.background='#ECFDF5'">
                    <span class="material-symbols-outlined" style="font-size: 18px;">check_circle</span>
                    Enable Account
                  </button>
                }
              </div>
            </div>
          </div>
        </div>
      }

      <!-- ==================== SUSPEND DIALOG ==================== -->
      @if (showSuspendDialog(); as target) {
        <div style="position: fixed; inset: 0; z-index: 100; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.4); padding: 16px; backdrop-filter: blur(6px); animation: fade-in 0.15s ease;">
          <div style="width: 100%; max-width: 440px; background: #FFFFFF; border-radius: 16px; padding: 28px; box-shadow: 0 24px 80px rgba(0,0,0,0.2); animation: scale-in 0.2s ease;">
            <div style="width: 48px; height: 48px; border-radius: 14px; background: #FFF7ED; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
              <span class="material-symbols-outlined" style="font-size: 24px; color: #EA580C;">block</span>
            </div>
            <h3 style="font-size: 18px; font-weight: 700; color: #1A1A2E; margin: 0 0 4px;">Suspend Customer</h3>
            <p style="font-size: 14px; color: #6B7280; margin: 0 0 20px;">Select the duration and optionally provide a reason.</p>

            <div style="margin-bottom: 16px;">
              <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px;">Reason (optional)</label>
              <textarea #reasonInput placeholder="Add a note..." rows="2"
                        style="width: 100%; border: 1px solid #E5E7EB; border-radius: 10px; padding: 10px 14px; font-size: 14px; color: #1A1A2E; outline: none; box-sizing: border-box; font-family: inherit; resize: vertical; transition: border-color 0.15s, box-shadow 0.15s;"
                        onfocus="this.style.borderColor='#3980F4';this.style.boxShadow='0 0 0 3px rgba(57,128,244,0.12)'"
                        onblur="this.style.borderColor='#E5E7EB';this.style.boxShadow='none'"></textarea>
            </div>

            <div style="margin-bottom: 24px;">
              <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 8px;">Duration</label>
              <div class="grid grid-cols-4 gap-2">
                @for (d of suspendDurations; track d.label) {
                  <button (click)="suspendDuration.set(d.value)"
                          [style]="'padding: 10px 8px; border-radius: 10px; border: 1px solid ' + (suspendDuration() === d.value ? '#005DAC' : '#E5E7EB') + '; background: ' + (suspendDuration() === d.value ? '#EFF6FF' : '#FFFFFF') + '; font-size: 12px; font-weight: ' + (suspendDuration() === d.value ? '700' : '500') + '; color: ' + (suspendDuration() === d.value ? '#005DAC' : '#4B5563') + '; cursor: pointer; transition: all 0.15s ease; text-align: center;'">
                    {{ d.label }}
                  </button>
                }
              </div>
            </div>

            <div style="display: flex; gap: 10px; justify-content: flex-end;">
              <button (click)="showSuspendDialog.set(null)"
                      style="padding: 10px 20px; border-radius: 10px; border: 1px solid #E5E7EB; background: #FFFFFF; font-size: 14px; font-weight: 600; color: #6B7280; cursor: pointer; transition: all 0.15s ease;"
                      onmouseover="this.style.borderColor='#D1D5DB'" onmouseout="this.style.borderColor='#E5E7EB'">
                Cancel
              </button>
              <button (click)="executeSuspend(target); showSuspendDialog.set(null)"
                      style="padding: 10px 20px; border-radius: 10px; border: none; background: #EA580C; font-size: 14px; font-weight: 700; color: #FFFFFF; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.15s ease; box-shadow: 0 2px 8px rgba(234,88,12,0.25);"
                      onmouseover="this.style.background='#C2410C';this.style.boxShadow='0 4px 14px rgba(234,88,12,0.35)'"
                      onmouseout="this.style.background='#EA580C';this.style.boxShadow='0 2px 8px rgba(234,88,12,0.25)'">
                <span class="material-symbols-outlined" style="font-size: 18px;">block</span>
                Suspend Customer
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Quick Menu Backdrop -->
      @if (showQuickMenu()) {
        <div style="position: fixed; inset: 0; z-index: 20;" (click)="showQuickMenu.set(null)"></div>
      }
      <!-- Export Menu Backdrop -->
      @if (showExportMenu()) {
        <div style="position: fixed; inset: 0; z-index: 35;" (click)="showExportMenu.set(false)"></div>
      }

    </div>
  `,
})
export class ManageUsersComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly searchSubject = new Subject<string>();

  readonly users = signal<User[]>([]);
  readonly loading = signal(true);
  readonly searchQuery = signal('');
  readonly roleFilter = signal('');
  readonly statusFilter = signal('');
  readonly sortBy = signal('newest');
  readonly currentPage = signal(1);
  readonly totalPages = signal(0);
  readonly total = signal(0);
  readonly pageSize = 10;

  readonly selectedUsers = signal<Set<string>>(new Set());
  readonly showDeleteConfirm = signal<User | null>(null);
  readonly showSuspendDialog = signal<User | null>(null);
  readonly showProfileDrawer = signal<User | null>(null);
  readonly showQuickMenu = signal<string | null>(null);
  readonly showExportMenu = signal(false);
  readonly suspendDuration = signal('7');

  readonly statusOptions = STATUS_OPTIONS;
  readonly roleOptions = ROLE_OPTIONS;
  readonly sortOptions = SORT_OPTIONS;
  readonly suspendDurations = [
    { label: '1 Day', value: '1' },
    { label: '7 Days', value: '7' },
    { label: '30 Days', value: '30' },
    { label: 'Permanent', value: 'permanent' },
  ];

  private deleteTarget: User | null = null;

  constructor() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
    ).subscribe(query => {
      this.searchQuery.set(query);
      this.currentPage.set(1);
      this.loadUsers();
    });
  }

  ngOnInit() { this.loadUsers(); }

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

  get pageEnd() {
    return Math.min(this.currentPage() * this.pageSize, this.total());
  }

  allSelected(): boolean {
    return this.users().length > 0 && this.selectedUsers().size === this.users().length;
  }

  get statsCards() {
    const all = this.users();
    const active = all.filter(u => u.isActive !== false).length;
    const inactive = all.filter(u => u.isActive === false).length;
    const admins = all.filter(u => u.role === 'admin').length;
    const newThisMonth = all.filter(u => {
      const d = new Date(u.createdAt);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    return [
      { icon: 'people', label: 'Total Users', count: this.total(),
        bg: 'background: #EFF6FF;', iconColor: 'color: #3980F4;', trend: null },
      { icon: 'check_circle', label: 'Active', count: active + admins,
        bg: 'background: #ECFDF5;', iconColor: 'color: #10B981;', trend: null },
      { icon: 'cancel', label: 'Inactive', count: inactive,
        bg: 'background: #FEF2F2;', iconColor: 'color: #F87171;', trend: null },
      { icon: 'shield', label: 'Admins', count: admins,
        bg: 'background: #EFF6FF;', iconColor: 'color: #3980F4;', trend: null },
      { icon: 'person_add', label: 'New This Month', count: newThisMonth,
        bg: 'background: #F5F3FF;', iconColor: 'color: #8B5CF6;', trend: newThisMonth > 0 ? `+${newThisMonth} this month` : null },
    ];
  }

  get avatarColors(): string[] {
    return ['#005DAC', '#7C3AED', '#059669', '#DC2626', '#D97706', '#DB2777', '#0D9488', '#4F46E5'];
  }

  getAvatarColor(name: string): string {
    const colors = this.avatarColors;
    const index = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length;
    return `background: ${colors[index]};`;
  }

  getRelativeTime(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths === 1) return '1 month ago';
    if (diffMonths < 12) return `${diffMonths} months ago`;
    const diffYears = Math.floor(diffMonths / 12);
    return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
  }

  getLastLogin(user: User): string {
    return user.createdAt ? `${this.getRelativeTime(user.createdAt)}` : 'Never';
  }

  onSearch(query: string) {
    this.searchSubject.next(query);
  }

  onFilterChange() {
    this.currentPage.set(1);
    this.loadUsers();
  }

  resetFilters() {
    this.searchQuery.set('');
    this.roleFilter.set('');
    this.statusFilter.set('');
    this.sortBy.set('newest');
    this.currentPage.set(1);
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    const query = this.searchQuery() || undefined;
    const role = this.roleFilter() || undefined;
    this.userService.getUsers(query, role, this.currentPage(), this.pageSize).subscribe({
      next: (res) => {
        this.users.set(res.users);
        this.totalPages.set(res.totalPages);
        this.total.set(res.total);
        this.loading.set(false);
        this.selectedUsers.set(new Set());
      },
      error: () => this.loading.set(false),
    });
  }

  goToPage(page: string | number) {
    page = typeof page === 'string' ? parseInt(page, 10) : page;
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadUsers();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleSelect(id: string) {
    const set = new Set(this.selectedUsers());
    if (set.has(id)) set.delete(id);
    else set.add(id);
    this.selectedUsers.set(set);
  }

  toggleSelectAll() {
    if (this.allSelected()) {
      this.selectedUsers.set(new Set());
    } else {
      this.selectedUsers.set(new Set(this.users().map(u => u._id)));
    }
  }

  deselectAll() {
    this.selectedUsers.set(new Set());
  }

  toggleQuickMenu(id: string) {
    this.showQuickMenu.set(this.showQuickMenu() === id ? null : id);
  }

  toggleActive(user: User, active: boolean) {
    this.userService.updateUser(user._id, { isActive: active } as Partial<User>).subscribe(() => this.loadUsers());
  }

  confirmDeleteUser(user: User) {
    this.showDeleteConfirm.set(user);
  }

  executeDelete() {
    const target = this.showDeleteConfirm();
    if (!target) return;
    this.userService.deleteUser(target._id).subscribe(() => {
      this.showDeleteConfirm.set(null);
      this.loadUsers();
    });
  }

  deleteSelected() {
    const ids = Array.from(this.selectedUsers());
    if (ids.length === 0) return;
    let completed = 0;
    ids.forEach(id => {
      this.userService.deleteUser(id).subscribe(() => {
        completed++;
        if (completed === ids.length) this.loadUsers();
      });
    });
    this.deselectAll();
  }

  bulkSuspend() {
    const ids = Array.from(this.selectedUsers());
    if (ids.length === 0) return;
    let completed = 0;
    ids.forEach(id => {
      this.userService.updateUser(id, { isActive: false } as Partial<User>).subscribe(() => {
        completed++;
        if (completed === ids.length) this.loadUsers();
      });
    });
    this.deselectAll();
  }

  bulkActivate() {
    const ids = Array.from(this.selectedUsers());
    if (ids.length === 0) return;
    let completed = 0;
    ids.forEach(id => {
      this.userService.updateUser(id, { isActive: true } as Partial<User>).subscribe(() => {
        completed++;
        if (completed === ids.length) this.loadUsers();
      });
    });
    this.deselectAll();
  }

  executeSuspend(user: User) {
    this.userService.updateUser(user._id, { isActive: false } as Partial<User>).subscribe(() => this.loadUsers());
  }

  openProfileDrawer(user: User) {
    this.showProfileDrawer.set(user);
  }

  openAddDialog() {
    alert('Add customer functionality coming soon.');
  }

  openEditDialog(user: User) {
    alert('Edit customer functionality coming soon.');
  }
}
