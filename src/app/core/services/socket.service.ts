import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { NotificationService } from './notification.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket?: Socket;
  private platformId = inject(PLATFORM_ID);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const baseUrl = environment.apiUrl.split('/api')[0];
      
      this.socket = io(baseUrl, {
        withCredentials: true
      });

      this.socket.on('booking_status_changed', (data: any) => {
        const user = this.authService.user();
        if (user && (data.userId === user._id || user.role === 'admin')) {
            this.notificationService.fetchNotifications();
            
            // Native browser notification if supported and granted
            if ('Notification' in window && window.Notification.permission === 'granted') {
                new window.Notification('Booking Status Updated', {
                    body: `Booking ${data.bookingId.substring(0, 8)} status changed to ${data.status}`
                });
            }
        }
      });

      this.socket.on('notification_created', (data: any) => {
        const user = this.authService.user();
        if (user && (data.userId === user._id || (data.userId === 'admin' && user.role === 'admin'))) {
            this.notificationService.fetchNotifications();
            
            if ('Notification' in window && window.Notification.permission === 'granted') {
                let title = 'New Notification';
                let body = 'You have a new notification';
                if (data.type === 'new_booking') {
                    title = 'New Booking';
                    body = 'A customer has placed a new booking.';
                } else if (data.type === 'cancel_booking') {
                    title = 'Booking Cancelled';
                    body = 'A booking has been cancelled.';
                }
                new window.Notification(title, { body });
            }
        }
      });
      
      // Request notification permissions
      if (isPlatformBrowser(this.platformId) && 'Notification' in window) {
        window.Notification.requestPermission();
      }
    }
  }
}
