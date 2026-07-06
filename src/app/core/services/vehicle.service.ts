import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Vehicle, VehicleFilter } from '../../models/vehicle.model';

const API = 'http://localhost:5001/api';

export interface VehicleListResponse {
  vehicles: Vehicle[];
  total: number;
  page: number;
  totalPages: number;
}

@Injectable({ providedIn: 'root' })
export class VehicleService {
  private readonly http = inject(HttpClient);

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

  getVehicle(id: string) {
    return this.http.get<{ vehicle: Vehicle }>(`${API}/vehicles/${id}`);
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
