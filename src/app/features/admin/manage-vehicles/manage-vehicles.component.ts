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
    <div class="p-6 bg-background min-h-screen pb-16">
      <div class="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p class="text-xs font-bold uppercase tracking-widest text-outline">Fleet</p>
          <h1 class="text-2xl font-bold text-on-surface">Manage Vehicles</h1>
        </div>
        <button (click)="openAddModal()" class="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 hover:brightness-110">
          Add Vehicle
        </button>
      </div>

      <div class="overflow-x-auto rounded-2xl border border-outline-variant/30 bg-surface-container-low">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-outline-variant/30 bg-surface-container-high text-xs font-bold uppercase tracking-wider text-outline">
              <th class="p-4">Vehicle</th>
              <th class="p-4">Type / Specs</th>
              <th class="p-4">Location</th>
              <th class="p-4">Pricing (/day)</th>
              <th class="p-4">Status</th>
              <th class="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-outline-variant/20">
            @if (loading()) {
              <tr>
                <td colspan="6" class="p-8 text-center text-on-surface-variant animate-pulse">Loading fleet...</td>
              </tr>
            } @else if (vehicles().length === 0) {
              <tr>
                <td colspan="6" class="p-8 text-center text-on-surface-variant">No vehicles found. Add one to get started!</td>
              </tr>
            } @else {
              @for (vehicle of vehicles(); track vehicle._id) {
                <tr class="text-sm hover:bg-surface-container-high/50 transition-colors">
                  <td class="p-4">
                    <div class="flex items-center gap-3">
                      <img [src]="vehicle.images[0] || 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=100&q=80'"
                        class="h-10 w-14 rounded-lg object-cover" [alt]="vehicle.name" />
                      <div>
                        <p class="font-bold text-on-surface">{{ vehicle.name }}</p>
                        <p class="text-xs text-on-surface-variant">{{ vehicle.brand }} · {{ vehicle.year }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="p-4">
                    <p class="font-semibold text-on-surface">{{ vehicle.type }}</p>
                    <p class="text-xs text-on-surface-variant">{{ vehicle.transmission }} · {{ vehicle.fuel }}</p>
                  </td>
                  <td class="p-4 font-semibold text-on-surface">{{ vehicle.location }}</td>
                  <td class="p-4 font-bold text-secondary">\${{ vehicle.pricing?.day || 0 }}</td>
                  <td class="p-4">
                    <span [class]="vehicle.available ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'"
                      class="rounded-lg px-2.5 py-1 text-xs font-bold uppercase tracking-wider">
                      {{ vehicle.available ? 'Available' : 'Rented' }}
                    </span>
                  </td>
                  <td class="p-4 text-right">
                    <div class="flex justify-end gap-2">
                      <button (click)="openEditModal(vehicle)" class="rounded-lg bg-surface-container-high px-3 py-1.5 text-xs font-bold text-on-surface hover:bg-surface-container-highest">
                        Edit
                      </button>
                      <button (click)="deleteVehicle(vehicle._id)" class="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/30">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>

      <!-- Add/Edit Modal (Simulated overlay for CSS reliability and minimalism) -->
      @if (showModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div class="w-full max-w-2xl rounded-2xl border border-outline-variant/30 bg-surface-container-low p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <h2 class="mb-4 text-xl font-bold text-on-surface">
              {{ editingVehicleId() ? 'Edit Vehicle' : 'Add New Vehicle' }}
            </h2>
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="mb-1 block text-sm font-semibold text-on-surface">Vehicle Name</label>
                  <input type="text" formControlName="name" class="w-full rounded-xl border border-outline-variant/50 bg-surface-container-high px-3 py-2.5 text-on-surface focus:outline-none" />
                </div>
                <div>
                  <label class="mb-1 block text-sm font-semibold text-on-surface">Brand</label>
                  <input type="text" formControlName="brand" class="w-full rounded-xl border border-outline-variant/50 bg-surface-container-high px-3 py-2.5 text-on-surface focus:outline-none" />
                </div>
              </div>

              <div class="grid grid-cols-3 gap-4">
                <div>
                  <label class="mb-1 block text-sm font-semibold text-on-surface">Model</label>
                  <input type="text" formControlName="model" class="w-full rounded-xl border border-outline-variant/50 bg-surface-container-high px-3 py-2.5 text-on-surface focus:outline-none" />
                </div>
                <div>
                  <label class="mb-1 block text-sm font-semibold text-on-surface">Year</label>
                  <input type="number" formControlName="year" class="w-full rounded-xl border border-outline-variant/50 bg-surface-container-high px-3 py-2.5 text-on-surface focus:outline-none" />
                </div>
                <div>
                  <label class="mb-1 block text-sm font-semibold text-on-surface">Seats</label>
                  <input type="number" formControlName="seats" class="w-full rounded-xl border border-outline-variant/50 bg-surface-container-high px-3 py-2.5 text-on-surface focus:outline-none" />
                </div>
              </div>

              <div class="grid grid-cols-3 gap-4">
                <div>
                  <label class="mb-1 block text-sm font-semibold text-on-surface">Type</label>
                  <select formControlName="type" class="w-full rounded-xl border border-outline-variant/50 bg-surface-container-high px-3 py-2.5 text-on-surface focus:outline-none">
                    @for (t of vehicleTypes; track t) {
                      <option [value]="t">{{ t }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="mb-1 block text-sm font-semibold text-on-surface">Fuel</label>
                  <select formControlName="fuel" class="w-full rounded-xl border border-outline-variant/50 bg-surface-container-high px-3 py-2.5 text-on-surface focus:outline-none">
                    @for (f of fuelTypes; track f) {
                      <option [value]="f">{{ f }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="mb-1 block text-sm font-semibold text-on-surface">Transmission</label>
                  <select formControlName="transmission" class="w-full rounded-xl border border-outline-variant/50 bg-surface-container-high px-3 py-2.5 text-on-surface focus:outline-none">
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="mb-1 block text-sm font-semibold text-on-surface">Location</label>
                  <select formControlName="location" class="w-full rounded-xl border border-outline-variant/50 bg-surface-container-high px-3 py-2.5 text-on-surface focus:outline-none">
                    @for (loc of locations; track loc) {
                      <option [value]="loc">{{ loc }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="mb-1 block text-sm font-semibold text-on-surface">Main Image URL</label>
                  <input type="text" formControlName="imageUrl" class="w-full rounded-xl border border-outline-variant/50 bg-surface-container-high px-3 py-2.5 text-on-surface focus:outline-none" placeholder="https://..." />
                </div>
              </div>

              <div class="rounded-xl bg-surface-container-high p-4">
                <p class="mb-3 text-sm font-bold text-on-surface">Pricing Packages (USD)</p>
                <div class="grid grid-cols-5 gap-2" formGroupName="pricing">
                  <div>
                    <label class="mb-1 block text-[10px] font-bold text-outline uppercase">Hour</label>
                    <input type="number" formControlName="hour" class="w-full rounded-lg border border-outline-variant/50 bg-surface-container-low px-2 py-1.5 text-sm text-on-surface focus:outline-none" />
                  </div>
                  <div>
                    <label class="mb-1 block text-[10px] font-bold text-outline uppercase">Day</label>
                    <input type="number" formControlName="day" class="w-full rounded-lg border border-outline-variant/50 bg-surface-container-low px-2 py-1.5 text-sm text-on-surface focus:outline-none" />
                  </div>
                  <div>
                    <label class="mb-1 block text-[10px] font-bold text-outline uppercase">Week</label>
                    <input type="number" formControlName="week" class="w-full rounded-lg border border-outline-variant/50 bg-surface-container-low px-2 py-1.5 text-sm text-on-surface focus:outline-none" />
                  </div>
                  <div>
                    <label class="mb-1 block text-[10px] font-bold text-outline uppercase">Month</label>
                    <input type="number" formControlName="month" class="w-full rounded-lg border border-outline-variant/50 bg-surface-container-low px-2 py-1.5 text-sm text-on-surface focus:outline-none" />
                  </div>
                  <div>
                    <label class="mb-1 block text-[10px] font-bold text-outline uppercase">Year</label>
                    <input type="number" formControlName="year" class="w-full rounded-lg border border-outline-variant/50 bg-surface-container-low px-2 py-1.5 text-sm text-on-surface focus:outline-none" />
                  </div>
                </div>
              </div>

              <div>
                <label class="mb-1 block text-sm font-semibold text-on-surface">Description</label>
                <textarea formControlName="description" rows="3" class="w-full rounded-xl border border-outline-variant/50 bg-surface-container-high p-3 text-on-surface focus:outline-none"></textarea>
              </div>

              <div class="mt-4 flex justify-end gap-3">
                <button type="button" (click)="showModal.set(false)" class="rounded-xl border border-outline-variant/50 px-5 py-2.5 text-sm font-bold text-on-surface hover:bg-surface-container-high">
                  Cancel
                </button>
                <button type="submit" [disabled]="form.invalid" class="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-on-primary hover:brightness-110">
                  Save Vehicle
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

  ngOnInit() {
    this.loadVehicles();
  }

  loadVehicles() {
    this.loading.set(true);
    this.vehicleService.getVehicles({}, 1, 100).subscribe({
      next: (res) => {
        this.vehicles.set(res.vehicles);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openAddModal() {
    this.editingVehicleId.set(null);
    this.form.reset({
      name: '',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      seats: 5,
      type: 'Car',
      fuel: 'Petrol',
      transmission: 'Automatic',
      location: 'Phnom Penh',
      imageUrl: '',
      description: '',
      pricing: { hour: 5, day: 45, week: 250, month: 800, year: 8000 }
    });
    this.showModal.set(true);
  }

  openEditModal(vehicle: Vehicle) {
    this.editingVehicleId.set(vehicle._id);
    this.form.patchValue({
      name: vehicle.name,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      seats: vehicle.seats,
      type: vehicle.type,
      fuel: vehicle.fuel,
      transmission: vehicle.transmission,
      location: vehicle.location,
      imageUrl: vehicle.images[0] || '',
      description: vehicle.description,
      pricing: vehicle.pricing,
    });
    this.showModal.set(true);
  }

  onSubmit() {
    if (this.form.invalid) return;

    const val = this.form.value;
    const vehicleData: Partial<Vehicle> = {
      name: val.name!,
      brand: val.brand!,
      model: val.model!,
      year: val.year!,
      seats: val.seats!,
      type: val.type!,
      fuel: val.fuel as any,
      transmission: val.transmission as any,
      location: val.location!,
      images: val.imageUrl ? [val.imageUrl] : [],
      description: val.description || '',
      pricing: val.pricing as any,
      available: true,
    };

    const id = this.editingVehicleId();
    if (id) {
      this.vehicleService.updateVehicle(id, vehicleData).subscribe(() => {
        this.showModal.set(false);
        this.loadVehicles();
      });
    } else {
      this.vehicleService.createVehicle(vehicleData).subscribe(() => {
        this.showModal.set(false);
        this.loadVehicles();
      });
    }
  }

  deleteVehicle(id: string) {
    if (confirm('Are you sure you want to delete this vehicle?')) {
      this.vehicleService.deleteVehicle(id).subscribe(() => this.loadVehicles());
    }
  }
}
