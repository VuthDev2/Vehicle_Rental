import { Injectable, signal, inject, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export interface Notification {
  _id: string;
  userId: string | null;
  title: string;
  message: string;
  type: string;
  link: string;
  read: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService implements OnDestroy {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private apiUrl = `${environment.apiUrl}/notifications`;

  notifications = signal<Notification[]>([]);
  unreadCount = signal<number>(0);
  
  private pollingInterval: any;

  constructor() {
    // When the user logs in, start polling
    if (this.auth.user()) {
      this.fetchNotifications();
      this.startPolling();
    }
  }

  fetchNotifications() {
    if (!this.auth.user()) return;
    
    this.http.get<{ notifications: Notification[], unreadCount: number }>(this.apiUrl)
      .pipe(
        tap(res => {
          this.notifications.set(res.notifications);
          this.unreadCount.set(res.unreadCount);
        }),
        catchError(err => {
          console.error('Failed to fetch notifications', err);
          return of(null);
        })
      ).subscribe();
  }

  markAsRead(id: string) {
    return this.http.patch<{ notification: Notification }>(`${this.apiUrl}/${id}/read`, {}).pipe(
      tap(res => {
        // Optimistically update the UI
        const current = this.notifications();
        const updated = current.map(n => n._id === id ? { ...n, read: true } : n);
        this.notifications.set(updated);
        this.unreadCount.update(count => Math.max(0, count - 1));
      })
    );
  }

  markAllAsRead() {
    return this.http.patch(`${this.apiUrl}/read-all`, {}).pipe(
      tap(() => {
        const updated = this.notifications().map(n => ({ ...n, read: true }));
        this.notifications.set(updated);
        this.unreadCount.set(0);
      })
    );
  }

  private startPolling() {
    this.pollingInterval = setInterval(() => {
      this.fetchNotifications();
    }, 30000); // Poll every 30 seconds
  }

  ngOnDestroy() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }
}
