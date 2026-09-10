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
      
      // Request notification permissions
      if (isPlatformBrowser(this.platformId) && 'Notification' in window) {
        window.Notification.requestPermission();
      }
    }
  }
}
