import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Promotion } from '../../models/promotion.model';

const API = 'http://localhost:5001/api';

@Injectable({ providedIn: 'root' })
export class PromotionService {
  private readonly http = inject(HttpClient);

  getPromotions() {
    return this.http.get<{ promotions: Promotion[] }>(`${API}/promotions`);
  }

  createPromotion(data: Partial<Promotion>) {
    return this.http.post<{ promotion: Promotion }>(`${API}/promotions`, data);
  }

  updatePromotion(id: string, data: Partial<Promotion>) {
    return this.http.put<{ promotion: Promotion }>(`${API}/promotions/${id}`, data);
  }

  deletePromotion(id: string) {
    return this.http.delete<{ message: string }>(`${API}/promotions/${id}`);
  }

  validatePromotion(code: string, amount: number) {
    return this.http.post<{ valid: boolean; discount?: number; message?: string; promo?: Promotion }>(
      `${API}/promotions/validate`,
      { code, amount }
    );
  }
}
