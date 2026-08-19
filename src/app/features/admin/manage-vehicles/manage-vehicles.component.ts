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
  templateUrl: './manage-vehicles.component.html',
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
  readonly uploadingImage = signal(false);

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

  /** Reads the chosen photo, compresses it to a data URL, and stores it on the form. */
  async onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please choose an image file.');
      input.value = '';
      return;
    }
    this.uploadingImage.set(true);
    try {
      const dataUrl = await this.compressImage(file);
      this.form.patchValue({ imageUrl: dataUrl });
    } catch {
      alert('Sorry, that image could not be processed. Please try another file.');
    } finally {
      this.uploadingImage.set(false);
      input.value = ''; // allow re-picking the same file
    }
  }

  removeImage() {
    this.form.patchValue({ imageUrl: '' });
  }

  /** Downscales to max 1200px and re-encodes as JPEG so the stored image stays small. */
  private compressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      if (typeof document === 'undefined') {
        reject();
        return;
      }
      const reader = new FileReader();
      reader.onerror = () => reject();
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject();
        img.onload = () => {
          const MAX = 1200;
          let { width, height } = img;
          if (width > MAX || height > MAX) {
            const scale = MAX / Math.max(width, height);
            width = Math.round(width * scale);
            height = Math.round(height * scale);
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(reader.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  }
}
