import { environment } from '../../../environments/environment';

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, shareReplay, of, tap } from 'rxjs';
import { Vehicle, VehicleFilter } from '../../models/vehicle.model';

const API = environment.apiUrl;

export interface VehicleListResponse {
  vehicles: Vehicle[];
  total: number;
  page: number;
  totalPages: number;
}

@Injectable({ providedIn: 'root' })
export class VehicleService {
  private readonly http = inject(HttpClient);

  // Cache for stats
  private statsCache$?: Observable<{ totalVehicles: number, availableVehicles: number, typeCounts: Record<string, number> }>;

  // Cache for individual vehicles
  private vehicleCache = new Map<string, Observable<{ vehicle: Vehicle }>>();

  getVehicles(filter?: Partial<VehicleFilter>, page = 1, limit = 12) {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (filter?.query) params = params.set('query', filter.query);
    if (filter?.type) params = params.set('type', filter.type);
    if (filter?.fuel) params = params.set('fuel', filter.fuel);
    if (filter?.transmission) params = params.set('transmission', filter.transmission);
    if (filter?.location) params = params.set('location', filter.location);
    if (filter?.minPrice) params = params.set('minPrice', filter.minPrice);
    if (filter?.maxPrice) params = params.set('maxPrice', filter.maxPrice);
    if (filter?.available) params = params.set('available', 'true');
    if (filter?.sort) params = params.set('sort', filter.sort);
    return this.http.get<VehicleListResponse>(`${API}/vehicles`, { params });
  }

  getVehicleStats() {
    if (!this.statsCache$) {
      this.statsCache$ = this.http.get<{ totalVehicles: number, availableVehicles: number, typeCounts: Record<string, number> }>(`${API}/vehicles/stats`).pipe(
        shareReplay({ bufferSize: 1, refCount: true })
      );
    }
    return this.statsCache$;
  }

  getVehicle(id: string) {
    if (!this.vehicleCache.has(id)) {
      const request$ = this.http.get<{ vehicle: Vehicle }>(`${API}/vehicles/${id}`).pipe(
        shareReplay({ bufferSize: 1, refCount: true })
      );
      this.vehicleCache.set(id, request$);
    }
    return this.vehicleCache.get(id)!;
  }

  createVehicle(data: Partial<Vehicle>) {
    return this.http.post<{ vehicle: Vehicle }>(`${API}/vehicles`, data);
  }

  updateVehicle(id: string, data: Partial<Vehicle>) {
    return this.http.put<{ vehicle: Vehicle }>(`${API}/vehicles/${id}`, data);
  }

  deleteVehicle(id: string) {
    return this.http.delete<{ message: string }>(`${API}/vehicles/${id}`);
  }

  uploadImages(vehicleId: string, files: File[]) {
    const formData = new FormData();
    files.forEach((f) => formData.append('images', f));
    return this.http.post<{ vehicle: Vehicle; imageUrls: string[] }>(
      `${API}/vehicles/${vehicleId}/images`,
      formData
    );
  }
}
