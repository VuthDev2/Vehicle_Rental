import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { VehicleService } from '../../../core/services/vehicle.service';
import { Vehicle } from '../../../models/vehicle.model';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

const VEHICLE_TYPES = ['Car', 'SUV', 'Van', 'Truck', 'Motorcycle', 'Bike', 'E-Bike', 'Tuk-Tuk'];
const FUEL_TYPES = ['Petrol', 'Diesel', 'Hybrid', 'Electric', 'N/A'];
const LOCATIONS = ['Phnom Penh', 'Siem Reap', 'Sihanoukville', 'Battambang', 'Kampot'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'price_asc', label: 'Price Low \u2192 High' },
  { value: 'price_desc', label: 'Price High \u2192 Low' },
  { value: 'name_asc', label: 'Alphabetical A\u2192Z' },
  { value: 'name_desc', label: 'Alphabetical Z\u2192A' },
];
const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'available', label: 'Available' },
  { value: 'rented', label: 'Rented' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'unavailable', label: 'Unavailable' },
];

@Component({
  selector: 'app-manage-vehicles',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  template: `
    <div style="background: #F8F9FA; min-height: 100%; padding: 28px 32px; font-family: 'Inter', system-ui, -apple-system, sans-serif;">

      <!-- ==================== HEADER ==================== -->
      <div class="flex items-start justify-between mb-8">
        <div>
          <h1 style="font-size: 26px; font-weight: 800; color: #1A1A2E; margin: 0; letter-spacing: -0.3px;">Vehicles</h1>
          <p style="font-size: 14px; color: #6B7280; margin: 4px 0 0;">Manage your rental fleet</p>
        </div>
        <button (click)="openAddModal()"
                style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 10px; background: #005DAC; color: #FFFFFF; border: none; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 2px 8px rgba(0,93,172,0.25);"
                onmouseover="this.style.background='#004d91';this.style.boxShadow='0 4px 14px rgba(0,93,172,0.35)';this.style.transform='translateY(-1px)'"
                onmouseout="this.style.background='#005DAC';this.style.boxShadow='0 2px 8px rgba(0,93,172,0.25)';this.style.transform='translateY(0)'">
          <span class="material-symbols-outlined" style="font-size: 18px;">add</span>
          Add Vehicle
        </button>
      </div>

      <!-- ==================== FILTER BAR ==================== -->
      <div class="flex items-center gap-3 mb-6 flex-wrap">
        <div style="position: relative; flex: 1; min-width: 240px; max-width: 360px;">
          <span class="material-symbols-outlined" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-size: 18px; color: #9CA3AF; pointer-events: none;">search</span>
          <input #searchInput type="text" placeholder="Search by name, brand, model..."
                 (input)="onSearch(searchInput.value)"
                 style="width: 100%; padding: 10px 14px 10px 42px; border-radius: 10px; border: 1px solid #E5E7EB; background: #FFFFFF; font-size: 14px; color: #1A1A2E; outline: none; transition: all 0.2s ease; box-sizing: border-box;"
                 onfocus="this.style.borderColor='#3980F4';this.style.boxShadow='0 0 0 3px rgba(57,128,244,0.12)'"
                 onblur="this.style.borderColor='#E5E7EB';this.style.boxShadow='none'" />
        </div>

        <div style="position: relative;">
          <select [(ngModel)]="selectedType" (change)="onFilterChange()" [ngModelOptions]="{standalone: true}"
                  style="padding: 10px 32px 10px 14px; border-radius: 10px; border: 1px solid #E5E7EB; background: #FFFFFF; font-size: 13px; font-weight: 500; color: #1A1A2E; outline: none; cursor: pointer; appearance: none; min-width: 140px; transition: border-color 0.2s, box-shadow 0.2s;"
                  onfocus="this.style.borderColor='#3980F4';this.style.boxShadow='0 0 0 3px rgba(57,128,244,0.12)'"
                  onblur="this.style.borderColor='#E5E7EB';this.style.boxShadow='none'">
            <option value="">All Types</option>
            @for (t of vehicleTypes; track t) {
              <option [value]="t">{{ t }}</option>
            }
          </select>
          <span style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; color: #9CA3AF; font-size: 10px;">&#9660;</span>
        </div>

        <div style="position: relative;">
          <select [(ngModel)]="selectedAvailability" (change)="onFilterChange()" [ngModelOptions]="{standalone: true}"
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
          <select [(ngModel)]="selectedSort" (change)="onFilterChange()" [ngModelOptions]="{standalone: true}"
                  style="padding: 10px 32px 10px 14px; border-radius: 10px; border: 1px solid #E5E7EB; background: #FFFFFF; font-size: 13px; font-weight: 500; color: #1A1A2E; outline: none; cursor: pointer; appearance: none; min-width: 170px; transition: border-color 0.2s, box-shadow 0.2s;"
                  onfocus="this.style.borderColor='#3980F4';this.style.boxShadow='0 0 0 3px rgba(57,128,244,0.12)'"
                  onblur="this.style.borderColor='#E5E7EB';this.style.boxShadow='none'">
            @for (s of sortOptions; track s.value) {
              <option [value]="s.value">{{ s.label }}</option>
            }
          </select>
          <span style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; color: #9CA3AF; font-size: 10px;">&#9660;</span>
        </div>

        @if (searchQuery() || selectedType() || selectedAvailability() || selectedSort() !== 'newest') {
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
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-7">
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
          </div>
        }
      </div>

      <!-- ==================== BULK ACTION BAR ==================== -->
      @if (selectedVehicles().size > 0) {
        <div style="background: #FFFFFF; border-radius: 12px; padding: 12px 20px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; border: 1px solid #E5E7EB; box-shadow: 0 1px 3px rgba(0,0,0,0.04); animation: fade-in 0.2s ease;">
          <span style="font-size: 14px; font-weight: 600; color: #1A1A2E;">
            {{ selectedVehicles().size }} selected
          </span>
          <div class="flex items-center gap-2">
            <button (click)="deselectAll()"
                    style="padding: 7px 14px; border-radius: 8px; border: 1px solid #E5E7EB; background: #FFFFFF; font-size: 13px; font-weight: 600; color: #6B7280; cursor: pointer; transition: all 0.15s ease;"
                    onmouseover="this.style.borderColor='#D1D5DB'"
                    onmouseout="this.style.borderColor='#E5E7EB'">
              Deselect All
            </button>
            <button (click)="deleteSelected()"
                    style="padding: 7px 14px; border-radius: 8px; border: 1px solid #FECACA; background: #FEF2F2; font-size: 13px; font-weight: 600; color: #DC2626; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: all 0.15s ease;"
                    onmouseover="this.style.background='#FEE2E2'"
                    onmouseout="this.style.background='#FEF2F2'">
              <span class="material-symbols-outlined" style="font-size: 16px;">delete</span>
              Delete Selected
            </button>
          </div>
        </div>
      }

      <!-- ==================== VEHICLE GRID ==================== -->
      @if (loading()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          @for (i of [1,2,3,4,5,6,7,8]; track i) {
            <div style="background: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #F0F0F0;">
              <div class="skeleton" style="height: 220px; width: 100%;"></div>
              <div style="padding: 16px;">
                <div class="skeleton" style="height: 18px; width: 70%; margin-bottom: 8px;"></div>
                <div class="skeleton" style="height: 12px; width: 45%; margin-bottom: 12px;"></div>
                <div style="display: flex; gap: 8px;">
                  <div class="skeleton" style="height: 28px; width: 60px; border-radius: 6px;"></div>
                  <div class="skeleton" style="height: 28px; width: 60px; border-radius: 6px;"></div>
                  <div class="skeleton" style="height: 28px; width: 60px; border-radius: 6px;"></div>
                </div>
              </div>
            </div>
          }
        </div>
      } @else if (vehicles().length === 0) {
        <div style="background: #FFFFFF; border-radius: 16px; border: 1px solid #F0F0F0; box-shadow: 0 1px 3px rgba(0,0,0,0.04); text-align: center; padding: 80px 20px;">
          <div style="width: 72px; height: 72px; border-radius: 20px; background: #F3F4F6; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
            <span class="material-symbols-outlined" style="font-size: 36px; color: #D1D5DB;">directions_car_off</span>
          </div>
          <h3 style="font-size: 18px; font-weight: 700; color: #1A1A2E; margin: 0 0 4px;">No vehicles found</h3>
          <p style="font-size: 14px; color: #6B7280; margin: 0 0 24px;">
            @if (searchQuery() || selectedType() || selectedAvailability()) {
              Try adjusting your filters.
            } @else {
              Get started by adding your first vehicle.
            }
          </p>
          @if (!searchQuery() && !selectedType() && !selectedAvailability()) {
            <button (click)="openAddModal()"
                    style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 24px; border-radius: 10px; background: #005DAC; color: #FFFFFF; border: none; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 2px 8px rgba(0,93,172,0.25);"
                    onmouseover="this.style.background='#004d91';this.style.boxShadow='0 4px 14px rgba(0,93,172,0.35)';this.style.transform='translateY(-1px)'"
                    onmouseout="this.style.background='#005DAC';this.style.boxShadow='0 2px 8px rgba(0,93,172,0.25)';this.style.transform='translateY(0)'">
              <span class="material-symbols-outlined" style="font-size: 18px;">add</span>
              Add Vehicle
            </button>
          }
        </div>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          @for (vehicle of vehicles(); track vehicle._id) {
            <div #cardRef
                 style="background: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #F0F0F0; box-shadow: 0 1px 3px rgba(0,0,0,0.04); transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); cursor: default; position: relative;"
                 onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 12px 40px rgba(0,0,0,0.1)';this.querySelector('.vehicle-image')?.style?.setProperty('transform', 'scale(1.03)');this.querySelector('.card-actions')?.style?.setProperty('opacity', '1');this.querySelector('.card-check')?.style?.setProperty('opacity', '1')"
                 onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 1px 3px rgba(0,0,0,0.04)';this.querySelector('.vehicle-image')?.style?.setProperty('transform', 'scale(1)');this.querySelector('.card-actions')?.style?.setProperty('opacity', '0');this.querySelector('.card-check')?.style?.setProperty('opacity', '0')">

              <!-- Selection Checkbox -->
              <div class="card-check"
                   style="position: absolute; top: 12px; right: 12px; z-index: 10; opacity: 0; transition: opacity 0.2s ease;">
                <label style="display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 8px; background: rgba(255,255,255,0.9); border: 2px solid #D1D5DB; cursor: pointer; transition: all 0.15s ease;"
                       [style]="selectedVehicles().has(vehicle._id) ? 'background: #005DAC; border-color: #005DAC;' : ''">
                  <input type="checkbox"
                         [checked]="selectedVehicles().has(vehicle._id)"
                         (change)="toggleSelect(vehicle._id)"
                         style="opacity: 0; position: absolute; width: 0; height: 0;"
                         [attr.aria-label]="'Select ' + vehicle.name" />
                  @if (selectedVehicles().has(vehicle._id)) {
                    <span class="material-symbols-outlined" style="font-size: 16px; color: #FFFFFF;">check</span>
                  }
                </label>
              </div>

              <!-- Quick Actions Menu -->
              <div style="position: absolute; top: 12px; left: 12px; z-index: 10;">
                <button (click)="toggleQuickMenu(vehicle._id); $event.stopPropagation()"
                        style="width: 28px; height: 28px; border-radius: 8px; border: none; background: rgba(255,255,255,0.9); cursor: pointer; display: flex; align-items: center; justify-content: center; color: #6B7280; transition: all 0.15s ease; backdrop-filter: blur(4px);"
                        onmouseover="this.style.background='rgba(255,255,255,0.95)';this.style.color='#1A1A2E'"
                        onmouseout="this.style.background='rgba(255,255,255,0.9)';this.style.color='#6B7280'"
                        aria-label="Vehicle actions">
                  <span class="material-symbols-outlined" style="font-size: 18px;">more_vert</span>
                </button>
                @if (showQuickMenu() === vehicle._id) {
                  <div style="position: absolute; top: 36px; left: 0; background: #FFFFFF; border-radius: 10px; border: 1px solid #E5E7EB; box-shadow: 0 8px 30px rgba(0,0,0,0.12); min-width: 180px; z-index: 50; padding: 6px; animation: fadeIn 0.15s ease;">
                    <button (click)="openEditModal(vehicle); showQuickMenu.set(null)"
                            style="display: flex; align-items: center; gap: 10px; width: 100%; padding: 9px 12px; border: none; border-radius: 7px; background: transparent; font-size: 13px; font-weight: 500; color: #1A1A2E; cursor: pointer; transition: background 0.1s; text-align: left;"
                            onmouseover="this.style.background='#F9FAFB'"
                            onmouseout="this.style.background='transparent'">
                      <span class="material-symbols-outlined" style="font-size: 16px; color: #6B7280;">visibility</span>
                      View Details
                    </button>
                    <button (click)="openEditModal(vehicle); showQuickMenu.set(null)"
                            style="display: flex; align-items: center; gap: 10px; width: 100%; padding: 9px 12px; border: none; border-radius: 7px; background: transparent; font-size: 13px; font-weight: 500; color: #1A1A2E; cursor: pointer; transition: background 0.1s; text-align: left;"
                            onmouseover="this.style.background='#F9FAFB'"
                            onmouseout="this.style.background='transparent'">
                      <span class="material-symbols-outlined" style="font-size: 16px; color: #6B7280;">edit</span>
                      Edit
                    </button>
                    <button (click)="toggleAvailability(vehicle); showQuickMenu.set(null)"
                            style="display: flex; align-items: center; gap: 10px; width: 100%; padding: 9px 12px; border: none; border-radius: 7px; background: transparent; font-size: 13px; font-weight: 500; color: #1A1A2E; cursor: pointer; transition: background 0.1s; text-align: left;"
                            onmouseover="this.style.background='#F9FAFB'"
                            onmouseout="this.style.background='transparent'">
                      <span class="material-symbols-outlined" style="font-size: 16px; color: #6B7280;">{{ vehicle.available ? 'block' : 'check_circle' }}</span>
                      {{ vehicle.available ? 'Mark Unavailable' : 'Mark Available' }}
                    </button>
                    <div style="height: 1px; background: #F0F0F0; margin: 4px 8px;"></div>
                    <button (click)="openDeleteConfirm(vehicle); showQuickMenu.set(null)"
                            style="display: flex; align-items: center; gap: 10px; width: 100%; padding: 9px 12px; border: none; border-radius: 7px; background: transparent; font-size: 13px; font-weight: 500; color: #DC2626; cursor: pointer; transition: background 0.1s; text-align: left;"
                            onmouseover="this.style.background='#FEF2F2'"
                            onmouseout="this.style.background='transparent'">
                      <span class="material-symbols-outlined" style="font-size: 16px;">delete</span>
                      Delete
                    </button>
                  </div>
                }
              </div>

              <!-- Image -->
              <div style="height: 220px; overflow: hidden; position: relative; background: #F3F4F6;">
                @if (vehicle.images?.[0]) {
                  <img class="vehicle-image" [src]="vehicle.images[0]"
                       style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.35s ease;"
                       [alt]="vehicle.name" />
                } @else {
                  <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #E5EEFF 0%, #F0F4FF 100%);">
                    <span class="material-symbols-outlined" style="font-size: 48px; color: #3980F4; opacity: 0.5;">directions_car</span>
                  </div>
                }
                <!-- Status Badge -->
                <div style="position: absolute; top: 12px; left: 12px; z-index: 5;">
                  @if (getStatusBadge(vehicle); as badge) {
                    <span [style]="'display: inline-flex; align-items: center; gap: 5px; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 0.3px; backdrop-filter: blur(8px); ' + badge.style">
                      <span [style]="'width: 6px; height: 6px; border-radius: 50%; ' + badge.dotStyle"></span>
                      {{ badge.label }}
                    </span>
                  }
                </div>
              </div>

              <!-- Body -->
              <div style="padding: 16px 16px 14px;">
                <!-- Name + Price -->
                <div class="flex items-start justify-between gap-2 mb-2">
                  <div style="min-width: 0; flex: 1;">
                    <h3 style="font-size: 16px; font-weight: 700; color: #1A1A2E; margin: 0; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ vehicle.name }}</h3>
                    <p style="font-size: 12px; color: #6B7280; margin: 2px 0 0;">{{ vehicle.brand }} &middot; {{ vehicle.model }}</p>
                  </div>
                  <div style="text-align: right; flex-shrink: 0;">
                    <span style="font-size: 20px; font-weight: 800; color: #005DAC;">\${{ vehicle.pricing?.day }}</span>
                    <span style="font-size: 11px; font-weight: 500; color: #9CA3AF;">/day</span>
                  </div>
                </div>

                <!-- Specs Chips -->
                <div style="display: flex; flex-wrap: wrap; gap: 6px; margin: 10px 0;">
                  <span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 8px; background: #F3F4F6; font-size: 11px; font-weight: 600; color: #4B5563;">
                    <span class="material-symbols-outlined" style="font-size: 13px; color: #6B7280;">settings</span>
                    {{ vehicle.transmission === 'Automatic' ? 'Auto' : 'Manual' }}
                  </span>
                  <span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 8px; background: #F3F4F6; font-size: 11px; font-weight: 600; color: #4B5563;">
                    <span class="material-symbols-outlined" style="font-size: 13px; color: #6B7280;">local_gas_station</span>
                    {{ vehicle.fuel }}
                  </span>
                  <span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 8px; background: #F3F4F6; font-size: 11px; font-weight: 600; color: #4B5563;">
                    <span class="material-symbols-outlined" style="font-size: 13px; color: #6B7280;">event_seat</span>
                    {{ vehicle.seats }} Seats
                  </span>
                </div>

                <!-- Location -->
                <div style="display: flex; align-items: center; gap: 4px; font-size: 12px; color: #6B7280; margin-bottom: 12px;">
                  <span class="material-symbols-outlined" style="font-size: 14px;">location_on</span>
                  {{ vehicle.location }}
                </div>

                <!-- Actions -->
                <div class="card-actions" style="display: flex; gap: 6px; opacity: 0; transition: opacity 0.2s ease;">
                  <button (click)="openEditModal(vehicle)"
                          style="flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 5px; padding: 8px 12px; border-radius: 8px; border: 1px solid #E5E7EB; background: #FFFFFF; font-size: 12px; font-weight: 600; color: #4B5563; cursor: pointer; transition: all 0.15s ease;"
                          onmouseover="this.style.borderColor='#D1D5DB';this.style.background='#F9FAFB'"
                          onmouseout="this.style.borderColor='#E5E7EB';this.style.background='#FFFFFF'">
                    <span class="material-symbols-outlined" style="font-size: 14px;">visibility</span>
                    View
                  </button>
                  <button (click)="openEditModal(vehicle)"
                          style="flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 5px; padding: 8px 12px; border-radius: 8px; border: none; background: #005DAC; color: #FFFFFF; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.15s ease;"
                          onmouseover="this.style.background='#004d91'"
                          onmouseout="this.style.background='#005DAC'">
                    <span class="material-symbols-outlined" style="font-size: 14px;">edit</span>
                    Edit
                  </button>
                  <button (click)="openDeleteConfirm(vehicle)"
                          style="flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; gap: 4px; padding: 8px 10px; border-radius: 8px; border: 1px solid #FECACA; background: #FEF2F2; font-size: 12px; font-weight: 600; color: #DC2626; cursor: pointer; transition: all 0.15s ease;"
                          onmouseover="this.style.background='#FEE2E2'"
                          onmouseout="this.style.background='#FEF2F2'">
                    <span class="material-symbols-outlined" style="font-size: 14px;">delete</span>
                  </button>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- ==================== PAGINATION ==================== -->
        @if (totalPages() > 1) {
          <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 24px; margin-top: 28px; border-top: 1px solid #F0F0F0;">
            <span style="font-size: 13px; color: #6B7280;">
              Showing {{ (currentPage() - 1) * 12 + 1 }}&ndash;{{ Math.min(currentPage() * 12, totalVehicles()) }} of {{ totalVehicles() }} vehicles
            </span>
            <div class="flex items-center gap-1.5">
              <button (click)="goToPage(currentPage() - 1)" [disabled]="currentPage() <= 1"
                      [style]="'width: 34px; height: 34px; border-radius: 8px; border: 1px solid #E5E7EB; background: #FFFFFF; display: flex; align-items: center; justify-content: center; color: ' + (currentPage() <= 1 ? '#D1D5DB' : '#4B5563') + '; cursor: ' + (currentPage() <= 1 ? 'not-allowed' : 'pointer') + '; transition: all 0.15s ease;'"
                      aria-label="Previous page">
                <span class="material-symbols-outlined" style="font-size: 16px;">chevron_left</span>
              </button>

              @for (p of paginationPages; track p) {
                @if (p === '...') {
                  <span style="padding: 0 4px; color: #D1D5DB; font-size: 13px;">...</span>
                } @else {
                  <button (click)="goToPage(p)"
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

      <!-- ==================== DELETE CONFIRMATION ==================== -->
      @if (showDeleteConfirm(); as target) {
        <div style="position: fixed; inset: 0; z-index: 100; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.4); padding: 16px; backdrop-filter: blur(6px); animation: fadeIn 0.15s ease;">
          <div style="width: 100%; max-width: 420px; background: #FFFFFF; border-radius: 16px; padding: 28px; box-shadow: 0 24px 80px rgba(0,0,0,0.2); animation: scale-in 0.2s ease;">
            <div style="width: 48px; height: 48px; border-radius: 14px; background: #FEF2F2; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
              <span class="material-symbols-outlined" style="font-size: 24px; color: #DC2626;">delete_forever</span>
            </div>
            <h3 style="font-size: 18px; font-weight: 700; color: #1A1A2E; margin: 0 0 4px;">Delete Vehicle</h3>
            <p style="font-size: 14px; color: #6B7280; margin: 0 0 16px;">
              Are you sure you want to delete <strong style="color: #1A1A2E;">{{ target.name }}</strong>? This action cannot be undone.
            </p>
            @if (target.images?.[0]) {
              <div style="border-radius: 10px; overflow: hidden; margin-bottom: 16px; height: 120px;">
                <img [src]="target.images[0]" style="width: 100%; height: 100%; object-fit: cover;" [alt]="target.name" />
              </div>
            }
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
              <button (click)="showDeleteConfirm.set(null)"
                      style="padding: 10px 20px; border-radius: 10px; border: 1px solid #E5E7EB; background: #FFFFFF; font-size: 14px; font-weight: 600; color: #6B7280; cursor: pointer; transition: all 0.15s ease;"
                      onmouseover="this.style.borderColor='#D1D5DB'"
                      onmouseout="this.style.borderColor='#E5E7EB'">
                Cancel
              </button>
              <button (click)="confirmDelete()"
                      style="padding: 10px 20px; border-radius: 10px; border: none; background: #DC2626; font-size: 14px; font-weight: 700; color: #FFFFFF; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.15s ease; box-shadow: 0 2px 8px rgba(220,38,38,0.25);"
                      onmouseover="this.style.background='#B91C1C';this.style.boxShadow='0 4px 14px rgba(220,38,38,0.35)'"
                      onmouseout="this.style.background='#DC2626';this.style.boxShadow='0 2px 8px rgba(220,38,38,0.25)'">
                <span class="material-symbols-outlined" style="font-size: 18px;">delete</span>
                Delete Vehicle
              </button>
            </div>
          </div>
        </div>
      }

      <!-- ==================== ADD/EDIT MODAL ==================== -->
      @if (showModal()) {
        <div style="position: fixed; inset: 0; z-index: 50; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.4); padding: 16px; backdrop-filter: blur(6px); animation: fadeIn 0.15s ease;">
          <div style="width: 100%; max-width: 640px; background: #FFFFFF; border-radius: 16px; padding: 28px; box-shadow: 0 24px 80px rgba(0,0,0,0.2); overflow-y: auto; max-height: 90vh; animation: scale-in 0.2s ease;">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h2 style="font-size: 20px; font-weight: 700; color: #1A1A2E; margin: 0;">
                  {{ editingVehicleId() ? 'Edit Vehicle' : 'Add Vehicle' }}
                </h2>
                <p style="font-size: 13px; color: #6B7280; margin: 2px 0 0;">
                  {{ editingVehicleId() ? 'Update the details below.' : 'Fill in the details below to add a new vehicle.' }}
                </p>
              </div>
              <button (click)="showModal.set(false)" style="width: 36px; height: 36px; border: none; border-radius: 10px; background: #F3F4F6; cursor: pointer; color: #6B7280; display: flex; align-items: center; justify-content: center; transition: background 0.15s;"
                      onmouseover="this.style.background='#E5E7EB'" onmouseout="this.style.background='#F3F4F6'">
                <span class="material-symbols-outlined" style="font-size: 20px;">close</span>
              </button>
            </div>

            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px;">Vehicle Name</label>
                  <input type="text" formControlName="name" placeholder="e.g. Toyota Camry" style="width: 100%; border: 1px solid #E5E7EB; border-radius: 10px; padding: 10px 14px; font-size: 14px; color: #1A1A2E; outline: none; box-sizing: border-box; transition: border-color 0.15s, box-shadow 0.15s;"
                         onfocus="this.style.borderColor='#3980F4';this.style.boxShadow='0 0 0 3px rgba(57,128,244,0.12)'" onblur="this.style.borderColor='#E5E7EB';this.style.boxShadow='none'" />
                </div>
                <div>
                  <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px;">Brand</label>
                  <input type="text" formControlName="brand" placeholder="e.g. Toyota" style="width: 100%; border: 1px solid #E5E7EB; border-radius: 10px; padding: 10px 14px; font-size: 14px; color: #1A1A2E; outline: none; box-sizing: border-box; transition: border-color 0.15s, box-shadow 0.15s;"
                         onfocus="this.style.borderColor='#3980F4';this.style.boxShadow='0 0 0 3px rgba(57,128,244,0.12)'" onblur="this.style.borderColor='#E5E7EB';this.style.boxShadow='none'" />
                </div>
              </div>

              <div class="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px;">Model</label>
                  <input type="text" formControlName="model" placeholder="e.g. Camry" style="width: 100%; border: 1px solid #E5E7EB; border-radius: 10px; padding: 10px 14px; font-size: 14px; color: #1A1A2E; outline: none; box-sizing: border-box; transition: border-color 0.15s, box-shadow 0.15s;"
                         onfocus="this.style.borderColor='#3980F4';this.style.boxShadow='0 0 0 3px rgba(57,128,244,0.12)'" onblur="this.style.borderColor='#E5E7EB';this.style.boxShadow='none'" />
                </div>
                <div>
                  <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px;">Year</label>
                  <input type="number" formControlName="year" style="width: 100%; border: 1px solid #E5E7EB; border-radius: 10px; padding: 10px 14px; font-size: 14px; color: #1A1A2E; outline: none; box-sizing: border-box; transition: border-color 0.15s, box-shadow 0.15s;"
                         onfocus="this.style.borderColor='#3980F4';this.style.boxShadow='0 0 0 3px rgba(57,128,244,0.12)'" onblur="this.style.borderColor='#E5E7EB';this.style.boxShadow='none'" />
                </div>
                <div>
                  <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px;">Seats</label>
                  <input type="number" formControlName="seats" style="width: 100%; border: 1px solid #E5E7EB; border-radius: 10px; padding: 10px 14px; font-size: 14px; color: #1A1A2E; outline: none; box-sizing: border-box; transition: border-color 0.15s, box-shadow 0.15s;"
                         onfocus="this.style.borderColor='#3980F4';this.style.boxShadow='0 0 0 3px rgba(57,128,244,0.12)'" onblur="this.style.borderColor='#E5E7EB';this.style.boxShadow='none'" />
                </div>
              </div>

              <div class="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px;">Type</label>
                  <select formControlName="type" style="width: 100%; border: 1px solid #E5E7EB; border-radius: 10px; padding: 10px 14px; font-size: 14px; color: #1A1A2E; outline: none; box-sizing: border-box; background: #FFFFFF; cursor: pointer; transition: border-color 0.15s, box-shadow 0.15s;"
                          onfocus="this.style.borderColor='#3980F4';this.style.boxShadow='0 0 0 3px rgba(57,128,244,0.12)'" onblur="this.style.borderColor='#E5E7EB';this.style.boxShadow='none'">
                    @for (t of vehicleTypes; track t) {
                      <option [value]="t">{{ t }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px;">Fuel</label>
                  <select formControlName="fuel" style="width: 100%; border: 1px solid #E5E7EB; border-radius: 10px; padding: 10px 14px; font-size: 14px; color: #1A1A2E; outline: none; box-sizing: border-box; background: #FFFFFF; cursor: pointer; transition: border-color 0.15s, box-shadow 0.15s;"
                          onfocus="this.style.borderColor='#3980F4';this.style.boxShadow='0 0 0 3px rgba(57,128,244,0.12)'" onblur="this.style.borderColor='#E5E7EB';this.style.boxShadow='none'">
                    @for (f of fuelTypes; track f) {
                      <option [value]="f">{{ f }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px;">Transmission</label>
                  <select formControlName="transmission" style="width: 100%; border: 1px solid #E5E7EB; border-radius: 10px; padding: 10px 14px; font-size: 14px; color: #1A1A2E; outline: none; box-sizing: border-box; background: #FFFFFF; cursor: pointer; transition: border-color 0.15s, box-shadow 0.15s;"
                          onfocus="this.style.borderColor='#3980F4';this.style.boxShadow='0 0 0 3px rgba(57,128,244,0.12)'" onblur="this.style.borderColor='#E5E7EB';this.style.boxShadow='none'">
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px;">Location</label>
                  <select formControlName="location" style="width: 100%; border: 1px solid #E5E7EB; border-radius: 10px; padding: 10px 14px; font-size: 14px; color: #1A1A2E; outline: none; box-sizing: border-box; background: #FFFFFF; cursor: pointer; transition: border-color 0.15s, box-shadow 0.15s;"
                          onfocus="this.style.borderColor='#3980F4';this.style.boxShadow='0 0 0 3px rgba(57,128,244,0.12)'" onblur="this.style.borderColor='#E5E7EB';this.style.boxShadow='none'">
                    @for (loc of locations; track loc) {
                      <option [value]="loc">{{ loc }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px;">Main Image URL</label>
                  <input type="text" formControlName="imageUrl" placeholder="https://..." style="width: 100%; border: 1px solid #E5E7EB; border-radius: 10px; padding: 10px 14px; font-size: 14px; color: #1A1A2E; outline: none; box-sizing: border-box; transition: border-color 0.15s, box-shadow 0.15s;"
                         onfocus="this.style.borderColor='#3980F4';this.style.boxShadow='0 0 0 3px rgba(57,128,244,0.12)'" onblur="this.style.borderColor='#E5E7EB';this.style.boxShadow='none'" />
                </div>
              </div>

              <!-- Pricing -->
              <div style="border-radius: 12px; padding: 18px; margin-bottom: 16px; background: #F9FAFB; border: 1px solid #E5E7EB;">
                <p style="font-size: 13px; font-weight: 700; color: #005DAC; margin: 0 0 14px;">Pricing Packages (USD)</p>
                <div class="grid grid-cols-5 gap-3" formGroupName="pricing">
                  @for (p of [{key:'hour',label:'Hour'},{key:'day',label:'Day'},{key:'week',label:'Week'},{key:'month',label:'Month'},{key:'year',label:'Year'}]; track p.key) {
                    <div>
                      <label style="display: block; font-size: 10px; font-weight: 700; color: #6B7280; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.5px;">{{ p.label }}</label>
                      <div style="position: relative;">
                        <span style="position: absolute; left: 8px; top: 50%; transform: translateY(-50%); font-size: 12px; color: #9CA3AF;">\$</span>
                        <input type="number" [formControlName]="p.key" style="width: 100%; border: 1px solid #E5E7EB; border-radius: 8px; padding: 8px 8px 8px 22px; font-size: 13px; color: #1A1A2E; outline: none; box-sizing: border-box; background: #FFFFFF; transition: border-color 0.15s, box-shadow 0.15s;"
                               onfocus="this.style.borderColor='#3980F4';this.style.boxShadow='0 0 0 3px rgba(57,128,244,0.12)'" onblur="this.style.borderColor='#E5E7EB';this.style.boxShadow='none'" />
                      </div>
                    </div>
                  }
                </div>
              </div>

              <div style="margin-bottom: 16px;">
                <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px;">Description</label>
                <textarea formControlName="description" rows="3" placeholder="Brief description of the vehicle..." style="width: 100%; border: 1px solid #E5E7EB; border-radius: 10px; padding: 10px 14px; font-size: 14px; color: #1A1A2E; outline: none; box-sizing: border-box; resize: vertical; font-family: inherit; transition: border-color 0.15s, box-shadow 0.15s;"
                          onfocus="this.style.borderColor='#3980F4';this.style.boxShadow='0 0 0 3px rgba(57,128,244,0.12)'" onblur="this.style.borderColor='#E5E7EB';this.style.boxShadow='none'"></textarea>
              </div>

              <div style="display: flex; justify-content: flex-end; gap: 12px; padding-top: 8px; border-top: 1px solid #F0F0F0;">
                <button type="button" (click)="showModal.set(false)"
                        style="border: 1px solid #E5E7EB; border-radius: 10px; padding: 10px 20px; font-size: 14px; font-weight: 600; color: #6B7280; background: #FFFFFF; cursor: pointer; transition: border-color 0.15s;"
                        onmouseover="this.style.borderColor='#D1D5DB'" onmouseout="this.style.borderColor='#E5E7EB'">
                  Cancel
                </button>
                <button type="submit" [disabled]="form.invalid"
                        style="border: none; border-radius: 10px; padding: 10px 24px; font-size: 14px; font-weight: 700; color: #FFFFFF; background: #005DAC; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 8px rgba(0,93,172,0.25);"
                        onmouseover="this.style.background='#004d91';this.style.boxShadow='0 4px 14px rgba(0,93,172,0.35)'" onmouseout="this.style.background='#005DAC';this.style.boxShadow='0 2px 8px rgba(0,93,172,0.25)'">
                  <span class="material-symbols-outlined" style="font-size: 18px;">{{ editingVehicleId() ? 'save' : 'add_circle' }}</span>
                  {{ editingVehicleId() ? 'Update' : 'Save' }} Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Backdrop for quick menu -->
      @if (showQuickMenu()) {
        <div style="position: fixed; inset: 0; z-index: 40;" (click)="showQuickMenu.set(null)"></div>
      }

    </div>
  `,
})
export class ManageVehiclesComponent implements OnInit {
  private readonly vehicleService = inject(VehicleService);
  private readonly fb = inject(FormBuilder);
  private readonly searchSubject = new Subject<string>();

  readonly Math = Math;

  readonly vehicles = signal<Vehicle[]>([]);
  readonly loading = signal(true);
  readonly showModal = signal(false);
  readonly editingVehicleId = signal<string | null>(null);
  readonly searchQuery = signal('');
  readonly selectedType = signal('');
  readonly selectedAvailability = signal('');
  readonly selectedSort = signal('newest');
  readonly currentPage = signal(1);
  readonly totalPages = signal(0);
  readonly totalVehicles = signal(0);
  readonly selectedVehicles = signal<Set<string>>(new Set());
  readonly showDeleteConfirm = signal<Vehicle | null>(null);
  readonly showQuickMenu = signal<string | null>(null);

  readonly vehicleTypes = VEHICLE_TYPES;
  readonly fuelTypes = FUEL_TYPES;
  readonly locations = LOCATIONS;
  readonly sortOptions = SORT_OPTIONS;
  readonly statusOptions = STATUS_OPTIONS;

  readonly form = this.fb.group({
    name: ['', Validators.required],
    brand: ['', Validators.required],
    model: ['', Validators.required],
    year: [new Date().getFullYear(), [Validators.required, Validators.min(1900)]],
    seats: [5, [Validators.required, Validators.min(1)]],
    type: ['Car', Validators.required],
    fuel: ['Petrol', Validators.required],
    transmission: ['Automatic', Validators.required],
    location: ['Phnom Penh', Validators.required],
    imageUrl: [''],
    description: [''],
    pricing: this.fb.group({
      hour: [5],
      day: [45],
      week: [250],
      month: [800],
      year: [8000],
    }),
  });

  constructor() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
    ).subscribe(query => {
      this.searchQuery.set(query);
      this.currentPage.set(1);
      this.loadVehicles();
    });
  }

  ngOnInit() { this.loadVehicles(); }

  get statsCards() {
    const all = this.vehicles();
    const available = all.filter(v => v.available).length;
    const rented = all.filter(v => !v.available).length;
    return [
      { icon: 'directions_car', label: 'Total Vehicles', count: all.length,
        bg: 'background: #EFF6FF;', iconColor: 'color: #3980F4;' },
      { icon: 'check_circle', label: 'Available', count: available,
        bg: 'background: #ECFDF5;', iconColor: 'color: #10B981;' },
      { icon: 'key', label: 'Rented', count: rented,
        bg: 'background: #EFF6FF;', iconColor: 'color: #3980F4;' },
      { icon: 'build', label: 'Maintenance', count: 0,
        bg: 'background: #FFF7ED;', iconColor: 'color: #F97316;' },
    ];
  }

  get paginationPages(): (number | string)[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: (number | string)[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
      return pages;
    }

    pages.push(1);
    if (current > 3) pages.push('...');

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (current < total - 2) pages.push('...');
    pages.push(total);

    return pages;
  }

  getStatusBadge(vehicle: Vehicle) {
    if (vehicle.available) {
      return {
        label: 'Available',
        style: 'background: rgba(16,185,129,0.12); color: #059669; border: 1px solid rgba(16,185,129,0.2);',
        dotStyle: 'background: #10B981; box-shadow: 0 0 6px rgba(16,185,129,0.5);',
      };
    }
    return {
      label: 'Rented',
      style: 'background: rgba(57,128,244,0.12); color: #005DAC; border: 1px solid rgba(57,128,244,0.2);',
      dotStyle: 'background: #3980F4; box-shadow: 0 0 6px rgba(57,128,244,0.5);',
    };
  }

  onSearch(query: string) {
    this.searchSubject.next(query);
  }

  onFilterChange() {
    this.currentPage.set(1);
    this.loadVehicles();
  }

  resetFilters() {
    this.searchQuery.set('');
    this.selectedType.set('');
    this.selectedAvailability.set('');
    this.selectedSort.set('newest');
    this.currentPage.set(1);
    this.loadVehicles();
  }

  loadVehicles() {
    this.loading.set(true);
    const filter: any = { sort: this.selectedSort() };
    const q = this.searchQuery();
    if (q) filter.query = q;
    const type = this.selectedType();
    if (type) filter.type = type;
    const avail = this.selectedAvailability();
    if (avail === 'available') filter.available = true;
    else if (avail === 'rented') filter.available = false;

    this.vehicleService.getVehicles(filter, this.currentPage(), 12).subscribe({
      next: (res) => {
        this.vehicles.set(res.vehicles);
        this.totalPages.set(res.totalPages);
        this.totalVehicles.set(res.total);
        this.loading.set(false);
        this.selectedVehicles.set(new Set());
      },
      error: () => this.loading.set(false),
    });
  }

  toggleSelect(id: string) {
    const set = new Set(this.selectedVehicles());
    if (set.has(id)) set.delete(id);
    else set.add(id);
    this.selectedVehicles.set(set);
  }

  deselectAll() {
    this.selectedVehicles.set(new Set());
  }

  toggleAvailability(vehicle: Vehicle) {
    this.vehicleService.updateVehicle(vehicle._id, { available: !vehicle.available } as any)
      .subscribe(() => this.loadVehicles());
  }

  openDeleteConfirm(vehicle: Vehicle) {
    this.showDeleteConfirm.set(vehicle);
  }

  confirmDelete() {
    const target = this.showDeleteConfirm();
    if (!target) return;
    this.vehicleService.deleteVehicle(target._id).subscribe(() => {
      this.showDeleteConfirm.set(null);
      this.loadVehicles();
    });
  }

  deleteSelected() {
    const ids = Array.from(this.selectedVehicles());
    if (ids.length === 0) return;
    if (!confirm(`Delete ${ids.length} selected vehicles?`)) return;
    let completed = 0;
    ids.forEach(id => {
      this.vehicleService.deleteVehicle(id).subscribe(() => {
        completed++;
        if (completed === ids.length) this.loadVehicles();
      });
    });
  }

  toggleQuickMenu(id: string) {
    this.showQuickMenu.set(this.showQuickMenu() === id ? null : id);
  }

  goToPage(page: string | number) {
    page = typeof page === 'string' ? parseInt(page, 10) : page;
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadVehicles();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openAddModal() {
    this.editingVehicleId.set(null);
    this.form.reset({
      name: '', brand: '', model: '', year: new Date().getFullYear(), seats: 5,
      type: 'Car', fuel: 'Petrol', transmission: 'Automatic', location: 'Phnom Penh',
      imageUrl: '', description: '', pricing: { hour: 5, day: 45, week: 250, month: 800, year: 8000 },
    });
    this.showModal.set(true);
  }

  openEditModal(vehicle: Vehicle) {
    this.editingVehicleId.set(vehicle._id);
    this.form.patchValue({
      name: vehicle.name, brand: vehicle.brand, model: vehicle.model,
      year: vehicle.year, seats: vehicle.seats, type: vehicle.type,
      fuel: vehicle.fuel, transmission: vehicle.transmission, location: vehicle.location,
      imageUrl: vehicle.images[0] || '', description: vehicle.description, pricing: vehicle.pricing,
    });
    this.showModal.set(true);
  }

  onSubmit() {
    if (this.form.invalid) return;
    const val = this.form.value;
    const vehicleData: Partial<Vehicle> = {
      name: val.name!, brand: val.brand!, model: val.model!, year: val.year!,
      seats: val.seats!, type: val.type!, fuel: val.fuel as any,
      transmission: val.transmission as any, location: val.location!,
      images: val.imageUrl ? [val.imageUrl] : [], description: val.description || '',
      pricing: val.pricing as any, available: true,
    };

    const id = this.editingVehicleId();
    (id
      ? this.vehicleService.updateVehicle(id, vehicleData)
      : this.vehicleService.createVehicle(vehicleData)
    ).subscribe(() => { this.showModal.set(false); this.loadVehicles(); });
  }
}
