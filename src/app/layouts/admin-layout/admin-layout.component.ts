import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent {
  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);
  private readonly router = inject(Router);
  sidebarOpen = signal(false);
  profileMenuOpen = signal(false);
  readonly pageTitle = signal('Dashboard');

  constructor() {
    this.syncTitle();
    this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) this.syncTitle();
    });
  }

  private syncTitle(): void {
    const match = this.navItems.find((n) => this.router.url.startsWith(n.path));
    this.pageTitle.set(match?.label ?? 'Admin');
  }

  get isMobile(): boolean {
    return typeof window !== 'undefined' && window.innerWidth < 768;
  }

  readonly navItems = [
    { path: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/admin/vehicles', icon: 'directions_car', label: 'Vehicles' },
    { path: '/admin/users', icon: 'group', label: 'Customers' },
    { path: '/admin/bookings', icon: 'receipt_long', label: 'Bookings' },
    { path: '/admin/payments', icon: 'payments', label: 'Payments' },
    { path: '/admin/promotions', icon: 'local_offer', label: 'Promotions' },
    { path: '/admin/reports', icon: 'bar_chart', label: 'Reports' },
    { path: '/admin/settings', icon: 'settings', label: 'Settings' },
  ];
}
