import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VehicleService } from '../../../../core/services/vehicle.service';
import { Vehicle } from '../../../../models/vehicle.model';

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './vehicle-list.component.html',
})
export class VehicleListComponent implements OnInit {
  private readonly vehicleService = inject(VehicleService);

  readonly loading = signal(true);
  readonly vehicles = signal<Vehicle[]>([]);
  readonly searchTerm = signal('');
  readonly selectedType = signal('');
  readonly sortBy = signal('featured');
  readonly onlyAvailable = signal(false);
  readonly page = signal(1);
  readonly pageSize = 6;

  readonly types = ['SUV', 'Sedan', 'Truck', 'Coupe', 'Convertible', 'Hatchback', 'Van', 'Sports Car'];

  ngOnInit() {
    this.vehicleService.getVehicles().subscribe({
      next: (res) => {
        this.vehicles.set(res.vehicles || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  setSearchTerm(val: string) {
    this.searchTerm.set(val);
    this.page.set(1);
  }

  setSelectedType(val: string) {
    this.selectedType.set(val);
    this.page.set(1);
  }

  setSortBy(val: string) {
    this.sortBy.set(val);
    this.page.set(1);
  }

  toggleOnlyAvailable() {
    this.onlyAvailable.set(!this.onlyAvailable());
    this.page.set(1);
  }

  get filtered(): Vehicle[] {
    const term = this.searchTerm().toLowerCase().trim();
    const type = this.selectedType();
    const onlyAvail = this.onlyAvailable();
    return this.vehicles().filter((v) => {
      const matchName = !term || v.name.toLowerCase().includes(term) || (v.brand && v.brand.toLowerCase().includes(term));
      const matchType = !type || v.type === type;
      const matchAvail = !onlyAvail || v.available;
      return matchName && matchType && matchAvail;
    });
  }

  get sorted(): Vehicle[] {
    const list = [...this.filtered];
    switch (this.sortBy()) {
      case 'price-asc':
        return list.sort((a, b) => (a.pricing?.day ?? 0) - (b.pricing?.day ?? 0));
      case 'price-desc':
        return list.sort((a, b) => (b.pricing?.day ?? 0) - (a.pricing?.day ?? 0));
      case 'rating':
        return list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      case 'name':
        return list.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return list;
    }
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filtered.length / this.pageSize));
  }

  get paginated(): Vehicle[] {
    const p = this.page();
    const s = this.pageSize;
    return this.sorted.slice((p - 1) * s, p * s);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  resetFilters() {
    this.searchTerm.set('');
    this.selectedType.set('');
    this.onlyAvailable.set(false);
    this.sortBy.set('featured');
    this.page.set(1);
  }

  getTypeBadge(type: string): string {
    const map: Record<string, string> = {
      SUV: 'badge-success',
      Sedan: 'badge-info',
      Truck: 'badge-neutral',
      Coupe: 'badge-warning',
      Convertible: 'badge-danger',
      Hatchback: 'badge-info',
      Van: 'badge-neutral',
      'Sports Car': 'badge-admin',
    };
    return map[type] || 'badge-neutral';
  }

  getFuelIcon(fuel?: string): string {
    const map: Record<string, string> = {
      Petrol: 'local_gas_station',
      Diesel: 'local_gas_station',
      Hybrid: 'eco',
      Electric: 'bolt',
      'N/A': 'help',
    };
    return (fuel && map[fuel]) || 'local_gas_station';
  }
}
