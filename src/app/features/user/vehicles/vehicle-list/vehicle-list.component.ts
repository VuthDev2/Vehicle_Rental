import { Component, inject, signal, computed, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VehicleService } from '../../../../core/services/vehicle.service';
import { Vehicle, VehicleFilter } from '../../../../models/vehicle.model';
import { SearchService } from '../../../../core/services/search.service';
import { SeoService } from '../../../../core/services/seo.service';

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './vehicle-list.component.html',
  styleUrl: './vehicle-list.component.css',
})
export class VehicleListComponent implements OnInit {
  private readonly vehicleService = inject(VehicleService);
  private readonly searchService = inject(SearchService);
  private readonly seoService = inject(SeoService);

  ngOnInit() {
    this.seoService.updateSeoTags({
      title: 'Browse Vehicles - Cambo Rent',
      description: 'Explore our fleet of premium cars, motorcycles, and bicycles available for rent across Cambodia. Find the perfect ride for your next journey.',
    });
  }

  readonly loading = signal(true);
  readonly vehicles = signal<Vehicle[]>([]);
  readonly totalPages = signal(1);
  readonly totalItems = signal(0);
  
  // Filter Signals
  readonly searchTerm = this.searchService.searchTerm;
  readonly selectedType = signal('');
  readonly selectedTransmission = signal('');
  readonly sortBy = signal('featured');
  readonly onlyAvailable = signal(false);
  readonly page = signal(1);
  readonly maxPrice = signal(200);
  readonly minSeats = signal(0);
  readonly selectedFuel = signal('');
  readonly pageSize = 9;

  /** Open accordion sections in the sidebar filter */
  readonly openSections = signal<Set<string>>(new Set(['type', 'price', 'avail']));

  /** Type filter tabs shown in the horizontal scrollable row */
  readonly displayTypes: { label: string; value: string; icon: string }[] = [
    { label: 'Bicycles', value: 'Bike,E-Bike', icon: 'pedal_bike' },
    { label: 'Motos',    value: 'Motorcycle,Scooter', icon: 'two_wheeler' },
    { label: 'Cars',     value: 'Car,Sedan', icon: 'directions_car' },
    { label: 'SUVs',     value: 'SUV', icon: 'airport_shuttle' },
    { label: 'Vans',     value: 'Van,Truck', icon: 'airport_shuttle' },
  ];

  constructor() {
    // Re-fetch whenever filters or pagination change
    effect(() => {
      this.fetchVehicles(
        this.searchTerm(),
        this.selectedType(),
        this.selectedTransmission(),
        this.sortBy(),
        this.onlyAvailable(),
        this.maxPrice(),
        this.page(),
        this.selectedFuel()
      );
    });
  }

  fetchVehicles(query: string, type: string, trans: string, sort: string, avail: boolean, maxP: number, pageNum: number, fuel: string) {
    this.loading.set(true);
    
    // Map internal sort strings to backend sort strings
    let backendSort = 'featured';
    if (sort === 'price-asc') backendSort = 'price_asc';
    if (sort === 'price-desc') backendSort = 'price_desc';
    if (sort === 'rating') backendSort = 'rating';

    const filter: Partial<VehicleFilter & { fuel?: string }> = {};
    if (query) filter.query = query;
    if (type) filter.type = type;
    if (trans) filter.transmission = trans;
    if (fuel) filter.fuel = fuel;
    if (avail) filter.available = true;
    if (maxP < 200) filter.maxPrice = maxP; // 200 is default max
    if (backendSort !== 'featured') filter.sort = backendSort;

    this.vehicleService.getVehicles(filter, pageNum, this.pageSize).subscribe({
      next: (res) => {
        if (pageNum === 1) {
          this.vehicles.set(res.vehicles || []);
        } else {
          this.vehicles.update(prev => [...prev, ...(res.vehicles || [])]);
        }
        this.totalPages.set(res.totalPages || 1);
        this.totalItems.set(res.total || 0);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  setSearchTerm(val: string)       { this.searchService.searchTerm.set(val);         this.page.set(1); }
  setSelectedType(val: string)     { this.selectedType.set(val);       this.page.set(1); }
  setSelectedTransmission(val: string) { this.selectedTransmission.set(val); this.page.set(1); }
  setSelectedFuel(val: string)     { this.selectedFuel.set(val);       this.page.set(1); }
  setSortBy(val: string)           { this.sortBy.set(val);             this.page.set(1); }
  setMaxPrice(val: number)         { this.maxPrice.set(val);           this.page.set(1); }
  setMinSeats(val: number)         { this.minSeats.set(val);           this.page.set(1); }
  toggleOnlyAvailable()            { this.onlyAvailable.update((v) => !v); this.page.set(1); }

  toggleSection(key: string) {
    const s = new Set(this.openSections());
    if (s.has(key)) s.delete(key); else s.add(key);
    this.openSections.set(s);
  }

  loadMore() {
    if (this.page() < this.totalPages()) {
      this.page.update(p => p + 1);
    }
  }

  resetFilters() {
    this.searchService.searchTerm.set('');
    this.selectedType.set('');
    this.selectedTransmission.set('');
    this.selectedFuel.set('');
    this.onlyAvailable.set(false);
    this.sortBy.set('featured');
    this.maxPrice.set(200);
    this.minSeats.set(0);
    this.page.set(1);
  }

  getFuelIcon(fuel?: string): string {
    const map: Record<string, string> = {
      Petrol: 'local_gas_station', Diesel: 'local_gas_station',
      Hybrid: 'eco', Electric: 'bolt', 'N/A': 'help',
    };
    return (fuel && map[fuel]) || 'local_gas_station';
  }
}
