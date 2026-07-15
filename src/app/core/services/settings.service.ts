import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const API = 'http://localhost:5001/api';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly http = inject(HttpClient);

  getSettings() {
    return this.http.get<any>(`${API}/settings`);
  }

  updateSettings(data: any) {
    return this.http.put<any>(`${API}/settings`, data);
  }
}
