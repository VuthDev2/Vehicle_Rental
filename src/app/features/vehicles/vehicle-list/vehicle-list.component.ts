import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { VehicleService } from '../../../core/services/vehicle.service';
import { Vehicle } from '../../../models/vehicle.model';

const VEHICLE_TYPES = ['Car', 'SUV', 'Van', 'Truck', 'Motorcycle', 'Bike', 'E-Bike', 'Tuk-Tuk'];
const FUEL_TYPES = ['Petrol', 'Diesel', 'Hybrid', 'Electric'];
const LOCATIONS = ['Phnom Penh', 'Siem Reap', 'Sihanoukville', 'Battambang', 'Kampot'];

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-background pb-16 pt-6">
      <div class="mx-auto max-w-container-max px-margin-desktop">
        <!-- Header -->
        <div class="mb-8">
          <p class="text-[11px] font-bold uppercase tracking-widest text-primary">Our Fleet</p>
          <h1 class="mt-1 text-3xl font-bold text-on-surface">Browse Vehicles</h1>
          <p class="mt-1 text-on-surface-variant">{{ total() }} vehicles available</p>
        </div>

        <!-- Filters -->
        <div class="mb-8 rounded-2xl border border-outline-variant/30 bg-surface-container-low p-5">
          <div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
            <!-- Search -->
            <div class="relative lg:col-span-2">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">search</span>
              <input [(ngModel)]="searchQuery" (ngModelChange)="onFilterChange()" placeholder="Search brand, model, location..."
                class="w-full rounded-xl border border-outline-variant/50 bg-surface-container-high py-2.5 pl-10 pr-4 text-on-surface placeholder:text-outline focus:border-primary focus:outline-none" />
            </div>

            <!-- Type -->
            <select [(ngModel)]="filterType" (ngModelChange)="onFilterChange()"
              class="rounded-xl border border-outline-variant/50 bg-surface-container-high px-3 py-2.5 text-on-surface focus:border-primary focus:outline-none">
              <option value="">All Types</option>
              @for (t of vehicleTypes; track t) {
                <option [value]="t">{{ t }}</option>
              }
            </select>

            <!-- Location -->
            <select [(ngModel)]="filterLocation" (ngModelChange)="onFilterChange()"
              class="rounded-xl border border-outline-variant/50 bg-surface-container-high px-3 py-2.5 text-on-surface focus:border-primary focus:outline-none">
              <option value="">All Locations</option>
              @for (loc of locations; track loc) {
                <option [value]="loc">{{ loc }}</option>
              }
            </select>

            <!-- Sort -->
            <select [(ngModel)]="sortBy" (ngModelChange)="onFilterChange()"
              class="rounded-xl border border-outline-variant/50 bg-surface-container-high px-3 py-2.5 text-on-surface focus:border-primary focus:outline-none">
              <option value="">Sort: Newest</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
              <option value="rating">Highest Rated</option>
              <option value="trips">Most Booked</option>
            </select>
          </div>

          <div class="mt-3 flex flex-wrap items-center gap-3">
            <label class="flex cursor-pointer items-center gap-2 text-sm font-semibold text-on-surface-variant">
              <input type="checkbox" [(ngModel)]="availableOnly" (ngModelChange)="onFilterChange()" class="rounded" />
              Available only
            </label>
            <button (click)="clearFilters()" class="text-sm font-semibold text-outline hover:text-on-surface transition-colors">
              <span class="material-symbols-outlined text-sm">clear</span> Clear filters
            </button>
          </div>
        </div>

        <!-- Loading skeletons -->
        @if (loading()) {
          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            @for (i of [1,2,3,4,5,6,7,8]; track i) {
              <div class="overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-low animate-pulse">
                <div class="h-52 bg-surface-container-high"></div>
                <div class="p-5">
                  <div class="mb-3 h-5 w-3/4 rounded-lg bg-surface-container-high"></div>
                  <div class="mb-4 h-4 w-1/2 rounded-lg bg-surface-container-high"></div>
                  <div class="h-10 rounded-xl bg-surface-container-high"></div>
                </div>
              </div>
            }
          </div>
        }

        <!-- Vehicle Grid -->
        @if (!loading()) {
          @if (vehicles().length === 0) {
            <div class="flex flex-col items-center justify-center py-24 text-center">
              <span class="material-symbols-outlined mb-4 text-6xl text-outline">directions_car</span>
              <h2 class="text-xl font-bold text-on-surface">No vehicles found</h2>
              <p class="mt-2 text-on-surface-variant">Try adjusting your filters.</p>
            </div>
          } @else {
            <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              @for (vehicle of vehicles(); track vehicle._id) {
                <a [routerLink]="['/vehicles', vehicle._id]"
                  class="group overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-low transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10">
                  <!-- Image -->
                  <div class="relative h-52 overflow-hidden">
                    <img [src]="vehicle.images[0] || 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=600&q=80'"
                      [alt]="vehicle.name"
                      class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div class="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-on-primary">
                      {{ vehicle.type }}
                    </div>
                    @if (vehicle.available) {
                      <div class="absolute right-3 top-3 rounded-lg border border-green-500/30 bg-green-500/20 px-2.5 py-1 text-[11px] font-bold text-green-400 backdrop-blur-md">
                        Available
                      </div>
                    } @else {
                      <div class="absolute right-3 top-3 rounded-lg border border-red-500/30 bg-red-500/20 px-2.5 py-1 text-[11px] font-bold text-red-400 backdrop-blur-md">
                        Rented
                      </div>
                    }
                  </div>

                  <div class="p-5">
                    <div class="mb-3 flex items-start justify-between gap-2">
                      <div class="min-w-0">
                        <h3 class="truncate font-bold text-on-surface">{{ vehicle.name }}</h3>
                        <p class="text-sm text-on-surface-variant">{{ vehicle.brand }} · {{ vehicle.year }}</p>
                      </div>
                      <div class="shrink-0 text-right">
                        <p class="font-bold text-secondary">\${{ vehicle.pricing?.day || 0 }}</p>
                        <p class="text-xs text-outline">/day</p>
                      </div>
                    </div>

                    <div class="mb-4 flex items-center gap-3 text-xs text-on-surface-variant">
                      <span class="flex items-center gap-1">
                        <span class="material-symbols-outlined text-sm">location_on</span>
                        {{ vehicle.location }}
                      </span>
                      <span class="flex items-center gap-1">
                        <span class="material-symbols-outlined text-sm text-amber-400">star</span>
                        {{ vehicle.rating }}
                      </span>
                      <span class="flex items-center gap-1">
                        <span class="material-symbols-outlined text-sm">luggage</span>
                        {{ vehicle.trips }} trips
                      </span>
                    </div>

                    <div class="flex gap-2">
                      <span class="rounded-lg bg-surface-container-high px-2.5 py-1 text-xs font-semibold text-on-surface-variant">{{ vehicle.transmission }}</span>
                      <span class="rounded-lg bg-surface-container-high px-2.5 py-1 text-xs font-semibold text-on-surface-variant">{{ vehicle.fuel }}</span>
                      <span class="rounded-lg bg-surface-container-high px-2.5 py-1 text-xs font-semibold text-on-surface-variant">{{ vehicle.seats }} seats</span>
                    </div>
                  </div>
                </a>
              }
            </div>

            <!-- Pagination -->
            @if (totalPages() > 1) {
              <div class="mt-10 flex items-center justify-center gap-2">
                <button (click)="prevPage()" [disabled]="currentPage() === 1"
                  class="flex h-10 w-10 items-center justify-center rounded-xl border border-outline-variant/50 text-on-surface transition-all hover:border-primary hover:text-primary disabled:opacity-40">
                  <span class="material-symbols-outlined">chevron_left</span>
                </button>
                @for (p of pageNumbers(); track p) {
                  <button (click)="goToPage(p)"
                    [class]="p === currentPage() ? 'h-10 w-10 rounded-xl bg-primary font-bold text-on-primary' : 'h-10 w-10 rounded-xl border border-outline-variant/50 text-on-surface hover:border-primary hover:text-primary transition-all'">
                    {{ p }}
                  </button>
                }
                <button (click)="nextPage()" [disabled]="currentPage() === totalPages()"
                  class="flex h-10 w-10 items-center justify-center rounded-xl border border-outline-variant/50 text-on-surface transition-all hover:border-primary hover:text-primary disabled:opacity-40">
                  <span class="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            }
          }
        }
      </div>
    </div>
  `,
})
export class VehicleListComponent implements OnInit {
  private readonly vehicleService = inject(VehicleService);

  vehicles = signal<Vehicle[]>([]);
  loading = signal(true);
  total = signal(0);
  currentPage = signal(1);
  totalPages = signal(1);

  searchQuery = '';
  filterType = '';
  filterLocation = '';
  availableOnly = false;
  sortBy = '';

  readonly vehicleTypes = VEHICLE_TYPES;
  readonly locations = LOCATIONS;

  readonly pageNumbers = computed(() => {
    const pages = [];
    const total = this.totalPages();
    const current = this.currentPage();
    for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) {
      pages.push(i);
    }
    return pages;
  });

  ngOnInit() {
    this.loadVehicles();
  }

  loadVehicles() {
    this.loading.set(true);
    this.vehicleService.getVehicles(
      { query: this.searchQuery, type: this.filterType, location: this.filterLocation, available: this.availableOnly, sort: this.sortBy },
      this.currentPage(),
      12
    ).subscribe({
      next: (res) => {
        this.vehicles.set(res.vehicles);
        this.total.set(res.total);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onFilterChange() {
    this.currentPage.set(1);
    this.loadVehicles();
  }

  clearFilters() {
    this.searchQuery = '';
    this.filterType = '';
    this.filterLocation = '';
    this.availableOnly = false;
    this.sortBy = '';
    this.onFilterChange();
  }

  prevPage() { if (this.currentPage() > 1) { this.currentPage.update(p => p - 1); this.loadVehicles(); } }
  nextPage() { if (this.currentPage() < this.totalPages()) { this.currentPage.update(p => p + 1); this.loadVehicles(); } }
  goToPage(p: number) { this.currentPage.set(p); this.loadVehicles(); }
}
