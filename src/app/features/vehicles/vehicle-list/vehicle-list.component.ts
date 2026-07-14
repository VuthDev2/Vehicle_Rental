import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VehicleService } from '../../../core/services/vehicle.service';
import { Vehicle } from '../../../models/vehicle.model';

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <p class="eyebrow">Browse</p>
        <h1>Our Fleet</h1>
        <p>{{ vehicles().length }} vehicles available for rent</p>
      </div>

      <div class="mb-6 rounded-2xl border border-outline-variant/20 bg-surface-container-low p-4 sm:p-5">
        <div class="flex flex-wrap items-center gap-3">
          <div class="relative flex-1 min-w-[200px]">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-lg text-outline">search</span>
            <input type="text" [(ngModel)]="searchTerm" placeholder="Search by name..."
              class="w-full rounded-xl border border-outline-variant/50 bg-surface-container-high py-2.5 pl-11 pr-4 text-on-surface placeholder:text-outline/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
          </div>
          <div class="relative min-w-[140px]">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-lg text-outline">category</span>
            <select [(ngModel)]="selectedType"
              class="w-full appearance-none rounded-xl border border-outline-variant/50 bg-surface-container-high py-2.5 pl-11 pr-10 text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all">
              <option value="">All Types</option>
              @for (t of types; track t) {
                <option [value]="t">{{ t }}</option>
              }
            </select>
            <span class="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-lg text-outline pointer-events-none">expand_more</span>
          </div>
          <button (click)="searchTerm.set(''); selectedType.set('')"
            class="btn-secondary text-sm px-5 py-2.5">
            <span class="material-symbols-outlined">close</span>
            Clear
          </button>
          @if (filtered.length < vehicles().length) {
            <span class="text-xs font-semibold text-primary px-3 py-1.5 rounded-full" style="background: rgba(16,185,129,0.1);">
              {{ filtered.length }} results
            </span>
          }
        </div>
      </div>

      @if (loading()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          @for (i of [1,2,3,4,5,6]; track i) {
            <div class="rounded-2xl border border-outline-variant/20 bg-surface-container-low overflow-hidden">
              <div class="aspect-[16/10] skeleton"></div>
              <div class="p-5 space-y-3">
                <div class="h-5 w-2/3 skeleton"></div>
                <div class="h-4 w-1/3 skeleton"></div>
              </div>
            </div>
          }
        </div>
      } @else if (filtered.length === 0) {
        <div class="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-16 text-center">
          <div class="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5"
               style="background: rgba(255,255,255,0.04);">
            <span class="material-symbols-outlined text-4xl text-outline">search_off</span>
          </div>
          <h2 class="text-xl font-bold text-on-surface mb-2">No vehicles found</h2>
          <p class="text-on-surface-variant text-sm mb-8">Try adjusting your filters.</p>
          <button (click)="searchTerm.set(''); selectedType.set('')"
                  class="btn-primary text-sm">
            <span class="material-symbols-outlined">tune</span>
            Clear Filters
          </button>
        </div>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          @for (vehicle of paginated; track vehicle._id) {
            <a [routerLink]="['/vehicles', vehicle._id]"
               class="group rounded-2xl border border-outline-variant/20 bg-surface-container-low overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30">
              <div class="aspect-[16/10] overflow-hidden">
                @if (vehicle.images?.[0]) {
                  <img [src]="vehicle.images[0]" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                } @else {
                  <div class="w-full h-full flex items-center justify-center bg-surface-container-high">
                    <span class="material-symbols-outlined text-4xl text-outline">directions_car</span>
                  </div>
                }
              </div>
              <div class="p-5">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <h3 class="font-bold text-on-surface group-hover:text-primary transition-colors truncate">{{ vehicle.name }}</h3>
                    <p class="text-xs text-on-surface-variant mt-0.5 truncate">{{ vehicle.type }}</p>
                  </div>
                  <span class="text-lg font-black text-secondary whitespace-nowrap">\${{ vehicle.pricing.day }}</span>
                </div>
                <div class="flex items-center gap-4 mt-3 text-xs text-on-surface-variant">
                  <span class="flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm">groups</span>
                    {{ vehicle.seats }} seats
                  </span>
                  <span class="flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm">local_gas_station</span>
                    {{ vehicle.fuel }}
                  </span>
                  <span class="flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm">settings</span>
                    {{ vehicle.transmission }}
                  </span>
                </div>
              </div>
            </a>
          }
        </div>

        @if (totalPages > 1) {
          <div class="flex items-center justify-center gap-2 mt-8">
            <button (click)="page.set(page() - 1)" [disabled]="page() === 1"
              class="btn-secondary text-sm px-4 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed">
              <span class="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            @for (p of pages; track p) {
              <button (click)="page.set(p)"
                [class]="p === page()
                  ? 'w-10 h-10 rounded-xl bg-primary text-white text-sm font-bold'
                  : 'w-10 h-10 rounded-xl bg-surface-container-high text-on-surface-variant text-sm font-bold hover:bg-surface-container-high/80 transition-all'">
                {{ p }}
              </button>
            }
            <button (click)="page.set(page() + 1)" [disabled]="page() === totalPages"
              class="btn-secondary text-sm px-4 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed">
              <span class="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        }
      }
    </div>
  `,
})
export class VehicleListComponent implements OnInit {
  private readonly vehicleService = inject(VehicleService);

  readonly loading = signal(true);
  readonly vehicles = signal<Vehicle[]>([]);
  readonly searchTerm = signal('');
  readonly selectedType = signal('');
  readonly page = signal(1);
  readonly pageSize = 6;

  readonly types = ['SUV', 'Sedan', 'Truck', 'Coupe', 'Convertible', 'Hatchback', 'Van', 'Sports Car'];

  ngOnInit() {
    this.vehicleService.getVehicles().subscribe({
      next: (res) => {
        this.vehicles.set(res.vehicles);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  get filtered() {
    const term = this.searchTerm().toLowerCase();
    const type = this.selectedType();
    return this.vehicles().filter(v => {
      const matchName = !term || v.name.toLowerCase().includes(term);
      const matchType = !type || v.type === type;
      return matchName && matchType;
    });
  }

  get totalPages() {
    return Math.max(1, Math.ceil(this.filtered.length / this.pageSize));
  }

  get paginated() {
    const p = this.page();
    const s = this.pageSize;
    return this.filtered.slice((p - 1) * s, p * s);
  }

  get pages() {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}
