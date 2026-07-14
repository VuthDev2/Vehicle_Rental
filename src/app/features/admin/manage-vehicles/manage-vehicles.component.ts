import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { VehicleService } from '../../../core/services/vehicle.service';
import { Vehicle } from '../../../models/vehicle.model';

const VEHICLE_TYPES = ['Car', 'SUV', 'Van', 'Truck', 'Motorcycle', 'Bike', 'E-Bike', 'Tuk-Tuk'];
const FUEL_TYPES = ['Petrol', 'Diesel', 'Hybrid', 'Electric', 'N/A'];
const LOCATIONS = ['Phnom Penh', 'Siem Reap', 'Sihanoukville', 'Battambang', 'Kampot'];

@Component({
  selector: 'app-manage-vehicles',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div style="background: #FBF9F9; min-height: 100%; padding: 24px;">

      <!-- ==================== HEADER ==================== -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <h1 style="font-size: 24px; font-weight: 700; color: #1B1C1C; margin: 0;">Vehicles</h1>
          <span style="background: #E5EEFF; color: #005DAC; padding: 1px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; line-height: 26px;">
            {{ vehicles().length }}
          </span>
        </div>
        <div class="flex items-center gap-3">
          <select style="border: 1px solid #E9E8E7; border-radius: 6px; background: #FFFFFF; padding: 8px 28px 8px 12px; font-size: 13px; color: #1B1C1C; cursor: pointer; min-width: 140px; outline: none; appearance: none;">
            <option>All Vehicles</option>
            <option>Available</option>
            <option>Rented</option>
          </select>
          <button (click)="openAddModal()"
                  style="background: #005DAC; color: #FFFFFF; border: none; border-radius: 6px; padding: 8px 18px; font-size: 13px; font-weight: 700; cursor: pointer; white-space: nowrap; display: flex; align-items: center; gap: 6px; transition: background 0.15s;"
                  onmouseover="this.style.background='#004080'" onmouseout="this.style.background='#005DAC'">
            <span class="material-symbols-outlined" style="font-size: 16px;">add</span>
            Add Vehicle
          </button>
        </div>
      </div>

      <!-- ==================== VEHICLE GRID ==================== -->
      @if (loading()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          @for (i of [1,2,3,4,5,6,7,8]; track i) {
            <div style="background: #FFFFFF; border: 1px solid #E9E8E7; border-radius: 8px; overflow: hidden;">
              <div class="skeleton" style="aspect-ratio: 1/1; width: 100%;"></div>
              <div style="padding: 10px;">
                <div class="skeleton" style="height: 14px; width: 65%; margin-bottom: 6px;"></div>
                <div class="skeleton" style="height: 10px; width: 40%;"></div>
              </div>
            </div>
          }
        </div>
      } @else if (vehicles().length === 0) {
        <div style="background: #FFFFFF; border: 1px solid #E9E8E7; border-radius: 10px; text-align: center; padding: 60px 20px;">
          <span class="material-symbols-outlined" style="font-size: 40px; color: #C1C6D4; margin-bottom: 8px;">directions_car_off</span>
          <p style="font-size: 16px; font-weight: 600; color: #717783; margin: 0 0 2px;">No vehicles found</p>
          <p style="font-size: 13px; color: #76777D; margin: 0;">Add one to get started.</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          @for (vehicle of vehicles(); track vehicle._id) {
            <div style="background: #FFFFFF; border: 1px solid #E9E8E7; border-radius: 8px; overflow: hidden; display: flex; flex-direction: column;">
              <!-- Image -->
              <div style="aspect-ratio: 1/1; overflow: hidden; position: relative; flex-shrink: 0;">
                @if (vehicle.images?.[0]) {
                  <img [src]="vehicle.images[0]"
                       style="width: 100%; height: 100%; object-fit: cover;" />
                } @else {
                  <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #E5EEFF;">
                    <span class="material-symbols-outlined" style="font-size: 32px; color: #3980F4;">directions_car</span>
                  </div>
                }
                <!-- Availability Badge -->
                @if (vehicle.available) {
                  <span style="position: absolute; top: 6px; left: 6px; background: #DCFCE7; color: #166534; font-size: 9px; font-weight: 700; letter-spacing: 0.3px; padding: 2px 8px; border-radius: 20px; z-index: 1;">
                    Available
                  </span>
                } @else {
                  <span style="position: absolute; top: 6px; left: 6px; background: #FEE2E2; color: #991B1B; font-size: 9px; font-weight: 700; letter-spacing: 0.3px; padding: 2px 8px; border-radius: 20px; z-index: 1;">
                    Rented
                  </span>
                }
              </div>

              <!-- Body -->
              <div style="padding: 10px; flex: 1; display: flex; flex-direction: column;">
                <div class="flex items-start justify-between gap-1">
                  <div style="min-width: 0; flex: 1;">
                    <h3 style="font-size: 13px; font-weight: 700; color: #1B1C1C; margin: 0; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ vehicle.name }}</h3>
                    <p style="font-size: 11px; color: #717783; margin: 1px 0 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ vehicle.brand }} · {{ vehicle.model }}</p>
                  </div>
                  <div style="text-align: right; flex-shrink: 0;">
                    <span style="font-size: 14px; font-weight: 900; color: #005DAC;">\${{ vehicle.pricing?.day }}</span>
                    <span style="font-size: 9px; color: #717783;">/day</span>
                  </div>
                </div>

                <!-- Specs row -->
                <div style="display: flex; gap: 6px; margin-top: 6px; padding: 5px 0; border-top: 1px solid #F0EFEF;">
                  <div style="display: flex; align-items: center; gap: 2px; flex: 1;">
                    <span class="material-symbols-outlined" style="font-size: 11px; color: #717783;">event_seat</span>
                    <span style="font-size: 10px; font-weight: 600; color: #414752;">{{ vehicle.seats }}</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 2px; flex: 1;">
                    <span class="material-symbols-outlined" style="font-size: 11px; color: #717783;">settings</span>
                    <span style="font-size: 10px; font-weight: 600; color: #414752;">{{ vehicle.transmission === 'Automatic' ? 'Auto' : 'Man' }}</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 2px; flex: 1;">
                    <span class="material-symbols-outlined" style="font-size: 11px; color: #717783;">local_gas_station</span>
                    <span style="font-size: 10px; font-weight: 600; color: #414752;">{{ vehicle.fuel }}</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 2px; flex: 1;">
                    <span class="material-symbols-outlined" style="font-size: 11px; color: #717783;">calendar_today</span>
                    <span style="font-size: 10px; font-weight: 600; color: #414752;">{{ vehicle.year }}</span>
                  </div>
                </div>

                <!-- Actions -->
                <div style="display: flex; gap: 4px; margin-top: 6px;">
                  <button (click)="openEditModal(vehicle)"
                          style="flex: 1; background: #005DAC; color: #FFFFFF; border: none; border-radius: 5px; padding: 5px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 3px; transition: background 0.15s;"
                          onmouseover="this.style.background='#004080'" onmouseout="this.style.background='#005DAC'">
                    <span class="material-symbols-outlined" style="font-size: 12px;">edit</span>
                    Edit
                  </button>
                  <button (click)="deleteVehicle(vehicle._id)"
                          style="flex: 0 0 auto; background: #FEF2F2; color: #B3261E; border: 1px solid #FEE2E2; border-radius: 5px; padding: 5px 8px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.15s;"
                          onmouseover="this.style.background='#FEE2E2'" onmouseout="this.style.background='#FEF2F2'">
                    <span class="material-symbols-outlined" style="font-size: 14px;">delete</span>
                  </button>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- ==================== PAGINATION ==================== -->
        <div style="border-top: 1px solid #E9E8E7; padding-top: 16px; margin-top: 20px; display: flex; align-items: center; justify-content: space-between;">
          <span style="font-size: 13px; color: #717783;">{{ vehicles().length }} vehicles</span>
          <div style="display: flex; align-items: center; gap: 2px;">
            <button disabled style="width: 32px; height: 32px; border: 1px solid #E9E8E7; border-radius: 6px; background: #FFFFFF; display: flex; align-items: center; justify-content: center; color: #C1C6D4; cursor: not-allowed;">
              <span class="material-symbols-outlined" style="font-size: 14px;">chevron_left</span>
            </button>
            <button style="width: 32px; height: 32px; border: none; border-radius: 6px; background: #005DAC; color: #FFFFFF; font-size: 13px; font-weight: 700; cursor: pointer;">1</button>
            <button style="width: 32px; height: 32px; border: none; border-radius: 6px; background: transparent; color: #414752; font-size: 13px; cursor: pointer;">2</button>
            <button style="width: 32px; height: 32px; border: none; border-radius: 6px; background: transparent; color: #414752; font-size: 13px; cursor: pointer;">3</button>
            <span style="padding: 0 2px; color: #C1C6D4; font-size: 13px;">...</span>
            <button style="width: 32px; height: 32px; border: none; border-radius: 6px; background: transparent; color: #414752; font-size: 13px; cursor: pointer;">8</button>
            <button style="width: 32px; height: 32px; border: 1px solid #E9E8E7; border-radius: 6px; background: #FFFFFF; display: flex; align-items: center; justify-content: center; color: #414752; cursor: pointer;">
              <span class="material-symbols-outlined" style="font-size: 14px;">chevron_right</span>
            </button>
          </div>
        </div>
      }

      <!-- ==================== FOOTER ==================== -->
      <div style="border-top: 1px solid #E9E8E7; margin-top: 28px; padding-top: 16px; display: flex; justify-content: space-between; font-size: 12px; color: #717783;">
        <span>&copy; 2026 CamboRent. All rights reserved.</span>
        <div class="flex items-center gap-4">
          <a href="#" style="color: #717783; text-decoration: none;">Privacy Policy</a>
          <a href="#" style="color: #717783; text-decoration: none;">Terms of Service</a>
          <a href="#" style="color: #717783; text-decoration: none;">Support</a>
        </div>
      </div>

      <!-- ==================== ADD/EDIT MODAL ==================== -->
      @if (showModal()) {
        <div style="position: fixed; inset: 0; z-index: 50; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.45); padding: 16px; backdrop-filter: blur(4px);">
          <div style="width: 100%; max-width: 640px; background: #FFFFFF; border-radius: 16px; padding: 28px; box-shadow: 0 24px 80px rgba(0,0,0,0.2); overflow-y: auto; max-height: 90vh;">
            <div class="flex items-center justify-between mb-6">
              <h2 style="font-size: 22px; font-weight: 700; color: #1B1C1C; margin: 0;">
                {{ editingVehicleId() ? 'Edit Vehicle' : 'Add New Vehicle' }}
              </h2>
              <button (click)="showModal.set(false)" style="width: 36px; height: 36px; border: none; border-radius: 8px; background: #F5F3F3; cursor: pointer; color: #717783; display: flex; align-items: center; justify-content: center; transition: background 0.15s;"
                      onmouseover="this.style.background='#E9E8E7'" onmouseout="this.style.background='#F5F3F3'">
                <span class="material-symbols-outlined" style="font-size: 20px;">close</span>
              </button>
            </div>

            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label style="display: block; font-size: 13px; font-weight: 600; color: #414752; margin-bottom: 6px;">Vehicle Name</label>
                  <input type="text" formControlName="name" placeholder="e.g. Toyota Camry" style="width: 100%; border: 1px solid #E9E8E7; border-radius: 8px; padding: 10px 14px; font-size: 14px; color: #1B1C1C; outline: none; box-sizing: border-box; transition: border-color 0.15s;"
                         onfocus="this.style.borderColor='#005DAC'" onblur="this.style.borderColor='#E9E8E7'" />
                </div>
                <div>
                  <label style="display: block; font-size: 13px; font-weight: 600; color: #414752; margin-bottom: 6px;">Brand</label>
                  <input type="text" formControlName="brand" placeholder="e.g. Toyota" style="width: 100%; border: 1px solid #E9E8E7; border-radius: 8px; padding: 10px 14px; font-size: 14px; color: #1B1C1C; outline: none; box-sizing: border-box; transition: border-color 0.15s;"
                         onfocus="this.style.borderColor='#005DAC'" onblur="this.style.borderColor='#E9E8E7'" />
                </div>
              </div>

              <div class="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label style="display: block; font-size: 13px; font-weight: 600; color: #414752; margin-bottom: 6px;">Model</label>
                  <input type="text" formControlName="model" placeholder="e.g. Camry" style="width: 100%; border: 1px solid #E9E8E7; border-radius: 8px; padding: 10px 14px; font-size: 14px; color: #1B1C1C; outline: none; box-sizing: border-box; transition: border-color 0.15s;"
                         onfocus="this.style.borderColor='#005DAC'" onblur="this.style.borderColor='#E9E8E7'" />
                </div>
                <div>
                  <label style="display: block; font-size: 13px; font-weight: 600; color: #414752; margin-bottom: 6px;">Year</label>
                  <input type="number" formControlName="year" style="width: 100%; border: 1px solid #E9E8E7; border-radius: 8px; padding: 10px 14px; font-size: 14px; color: #1B1C1C; outline: none; box-sizing: border-box; transition: border-color 0.15s;"
                         onfocus="this.style.borderColor='#005DAC'" onblur="this.style.borderColor='#E9E8E7'" />
                </div>
                <div>
                  <label style="display: block; font-size: 13px; font-weight: 600; color: #414752; margin-bottom: 6px;">Seats</label>
                  <input type="number" formControlName="seats" style="width: 100%; border: 1px solid #E9E8E7; border-radius: 8px; padding: 10px 14px; font-size: 14px; color: #1B1C1C; outline: none; box-sizing: border-box; transition: border-color 0.15s;"
                         onfocus="this.style.borderColor='#005DAC'" onblur="this.style.borderColor='#E9E8E7'" />
                </div>
              </div>

              <div class="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label style="display: block; font-size: 13px; font-weight: 600; color: #414752; margin-bottom: 6px;">Type</label>
                  <select formControlName="type" style="width: 100%; border: 1px solid #E9E8E7; border-radius: 8px; padding: 10px 14px; font-size: 14px; color: #1B1C1C; outline: none; box-sizing: border-box; background: #FFFFFF; cursor: pointer; transition: border-color 0.15s;"
                          onfocus="this.style.borderColor='#005DAC'" onblur="this.style.borderColor='#E9E8E7'">
                    @for (t of vehicleTypes; track t) {
                      <option [value]="t">{{ t }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label style="display: block; font-size: 13px; font-weight: 600; color: #414752; margin-bottom: 6px;">Fuel</label>
                  <select formControlName="fuel" style="width: 100%; border: 1px solid #E9E8E7; border-radius: 8px; padding: 10px 14px; font-size: 14px; color: #1B1C1C; outline: none; box-sizing: border-box; background: #FFFFFF; cursor: pointer; transition: border-color 0.15s;"
                          onfocus="this.style.borderColor='#005DAC'" onblur="this.style.borderColor='#E9E8E7'">
                    @for (f of fuelTypes; track f) {
                      <option [value]="f">{{ f }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label style="display: block; font-size: 13px; font-weight: 600; color: #414752; margin-bottom: 6px;">Transmission</label>
                  <select formControlName="transmission" style="width: 100%; border: 1px solid #E9E8E7; border-radius: 8px; padding: 10px 14px; font-size: 14px; color: #1B1C1C; outline: none; box-sizing: border-box; background: #FFFFFF; cursor: pointer; transition: border-color 0.15s;"
                          onfocus="this.style.borderColor='#005DAC'" onblur="this.style.borderColor='#E9E8E7'">
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label style="display: block; font-size: 13px; font-weight: 600; color: #414752; margin-bottom: 6px;">Location</label>
                  <select formControlName="location" style="width: 100%; border: 1px solid #E9E8E7; border-radius: 8px; padding: 10px 14px; font-size: 14px; color: #1B1C1C; outline: none; box-sizing: border-box; background: #FFFFFF; cursor: pointer; transition: border-color 0.15s;"
                          onfocus="this.style.borderColor='#005DAC'" onblur="this.style.borderColor='#E9E8E7'">
                    @for (loc of locations; track loc) {
                      <option [value]="loc">{{ loc }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label style="display: block; font-size: 13px; font-weight: 600; color: #414752; margin-bottom: 6px;">Main Image URL</label>
                  <input type="text" formControlName="imageUrl" placeholder="https://..." style="width: 100%; border: 1px solid #E9E8E7; border-radius: 8px; padding: 10px 14px; font-size: 14px; color: #1B1C1C; outline: none; box-sizing: border-box; transition: border-color 0.15s;"
                         onfocus="this.style.borderColor='#005DAC'" onblur="this.style.borderColor='#E9E8E7'" />
                </div>
              </div>

              <!-- Pricing -->
              <div style="border-radius: 10px; padding: 18px; margin-bottom: 16px; background: #F8F9FF; border: 1px solid #E5EEFF;">
                <p style="font-size: 13px; font-weight: 700; color: #005DAC; margin: 0 0 14px;">Pricing Packages (USD)</p>
                <div class="grid grid-cols-5 gap-3" formGroupName="pricing">
                  @for (p of [ {key:'hour',label:'Hour'}, {key:'day',label:'Day'}, {key:'week',label:'Week'}, {key:'month',label:'Month'}, {key:'year',label:'Year'} ]; track p.key) {
                    <div>
                      <label style="display: block; font-size: 10px; font-weight: 700; color: #717783; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.5px;">{{ p.label }}</label>
                      <div style="position: relative;">
                        <span style="position: absolute; left: 8px; top: 50%; transform: translateY(-50%); font-size: 12px; color: #717783;">\$</span>
                        <input type="number" [formControlName]="p.key" style="width: 100%; border: 1px solid #E9E8E7; border-radius: 6px; padding: 8px 8px 8px 22px; font-size: 13px; color: #1B1C1C; outline: none; box-sizing: border-box; background: #FFFFFF; transition: border-color 0.15s;"
                               onfocus="this.style.borderColor='#005DAC'" onblur="this.style.borderColor='#E9E8E7'" />
                      </div>
                    </div>
                  }
                </div>
              </div>

              <div style="margin-bottom: 16px;">
                <label style="display: block; font-size: 13px; font-weight: 600; color: #414752; margin-bottom: 6px;">Description</label>
                <textarea formControlName="description" rows="3" placeholder="Brief description of the vehicle..." style="width: 100%; border: 1px solid #E9E8E7; border-radius: 8px; padding: 10px 14px; font-size: 14px; color: #1B1C1C; outline: none; box-sizing: border-box; resize: vertical; font-family: inherit; transition: border-color 0.15s;"
                          onfocus="this.style.borderColor='#005DAC'" onblur="this.style.borderColor='#E9E8E7'"></textarea>
              </div>

              <div style="display: flex; justify-content: flex-end; gap: 12px; padding-top: 8px; border-top: 1px solid #F0EFEF;">
                <button type="button" (click)="showModal.set(false)"
                        style="border: 1px solid #E9E8E7; border-radius: 8px; padding: 10px 20px; font-size: 14px; font-weight: 600; color: #717783; background: #FFFFFF; cursor: pointer; transition: border-color 0.15s;"
                        onmouseover="this.style.borderColor='#C1C6D4'" onmouseout="this.style.borderColor='#E9E8E7'">
                  Cancel
                </button>
                <button type="submit" [disabled]="form.invalid"
                        style="border: none; border-radius: 8px; padding: 10px 24px; font-size: 14px; font-weight: 700; color: #FFFFFF; background: #005DAC; cursor: pointer; transition: background 0.15s; display: flex; align-items: center; gap: 6px;"
                        onmouseover="this.style.background='#004080'" onmouseout="this.style.background='#005DAC'">
                  <span class="material-symbols-outlined" style="font-size: 18px;">{{ editingVehicleId() ? 'save' : 'add_circle' }}</span>
                  {{ editingVehicleId() ? 'Update' : 'Save' }} Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      }

    </div>
  `,
})
export class ManageVehiclesComponent implements OnInit {
  private readonly vehicleService = inject(VehicleService);
  private readonly fb = inject(FormBuilder);

  readonly vehicles = signal<Vehicle[]>([]);
  readonly loading = signal(true);
  readonly showModal = signal(false);
  readonly editingVehicleId = signal<string | null>(null);

  readonly vehicleTypes = VEHICLE_TYPES;
  readonly fuelTypes = FUEL_TYPES;
  readonly locations = LOCATIONS;

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

  ngOnInit() { this.loadVehicles(); }

  loadVehicles() {
    this.loading.set(true);
    this.vehicleService.getVehicles({}, 1, 100).subscribe({
      next: (res) => { this.vehicles.set(res.vehicles); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
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

  deleteVehicle(id: string) {
    if (confirm('Delete this vehicle?')) {
      this.vehicleService.deleteVehicle(id).subscribe(() => this.loadVehicles());
    }
  }
}
