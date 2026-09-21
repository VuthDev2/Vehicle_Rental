import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { NotificationService } from '../../core/services/notification.service';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, DatePipe, TranslatePipe],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent {
  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);
  readonly notifications = inject(NotificationService);
  readonly lang = inject(LanguageService);
  private readonly router = inject(Router);
  sidebarOpen = signal(false);
  profileMenuOpen = signal(false);
  notificationMenuOpen = signal(false);
  readonly pageTitle = signal('Dashboard');

  constructor() {
    this.syncTitle();
    this.router.events.pipe(takeUntilDestroyed()).subscribe((e) => {
      if (e instanceof NavigationEnd) this.syncTitle();
    });
  }

  private syncTitle(): void {
    const match = this.navItems.find((n) => this.router.url.startsWith(n.path));
    const title = match ? (this.lang as any)['translate']?.instant(match.labelKey) ?? match.label : 'Admin';
    this.pageTitle.set(title);
  }

  get isMobile(): boolean {
    return typeof window !== 'undefined' && window.innerWidth < 768;
  }

  readonly navItems = [
    { path: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard', labelKey: 'LAYOUT.DASHBOARD' },
    { path: '/admin/vehicles', icon: 'directions_car', label: 'Vehicles', labelKey: 'LAYOUT.VEHICLES' },
    { path: '/admin/users', icon: 'group', label: 'Customers', labelKey: 'LAYOUT.CUSTOMERS' },
    { path: '/admin/bookings', icon: 'receipt_long', label: 'Bookings', labelKey: 'LAYOUT.BOOKINGS' },
    { path: '/admin/payments', icon: 'payments', label: 'Payments', labelKey: 'LAYOUT.PAYMENTS' },
    { path: '/admin/promotions', icon: 'local_offer', label: 'Promotions', labelKey: 'LAYOUT.PROMOTIONS' },
    { path: '/admin/reports', icon: 'bar_chart', label: 'Reports', labelKey: 'LAYOUT.REPORTS' },
    { path: '/admin/settings', icon: 'settings', label: 'Settings', labelKey: 'LAYOUT.SETTINGS' },
  ];

  handleNotificationClick(notif: any) {
    if (!notif.read) {
      this.notifications.markAsRead(notif._id).subscribe();
    }
    this.notificationMenuOpen.set(false);
    if (notif.link) {
      this.router.navigate([notif.link]);
    }
  }
}
