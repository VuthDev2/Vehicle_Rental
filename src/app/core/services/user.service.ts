import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { User } from '../../models/user.model';

const API = 'http://localhost:5001/api';

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);

  getUsers(query?: string, role?: string, page = 1, limit = 20) {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (query) params = params.set('query', query);
    if (role) params = params.set('role', role);
    return this.http.get<UserListResponse>(`${API}/users`, { params });
  }

  getUser(id: string) {
    return this.http.get<{ user: User }>(`${API}/users/${id}`);
  }

  updateUser(id: string, data: Partial<User>) {
    return this.http.put<{ user: User }>(`${API}/users/${id}`, data);
  }

  deleteUser(id: string) {
    return this.http.delete<{ message: string }>(`${API}/users/${id}`);
  }
}
