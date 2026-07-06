import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="flex min-h-screen bg-background">
      <!-- Sidebar -->
      <aside class="fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r border-outline-variant/20 bg-surface-container-lowest">
        <div class="flex h-20 items-center gap-3 border-b border-outline-variant/20 px-6">
          <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-on-secondary shadow-lg shadow-secondary/30">
            <span class="material-symbols-outlined text-lg">admin_panel_settings</span>
          </span>
          <div class="flex flex-col leading-tight">
            <span class="text-sm font-bold text-on-surface">Cambo Rent</span>
            <span class="text-[10px] font-semibold uppercase tracking-widest text-secondary">Admin Panel</span>
          </div>
        </div>

        <div class="flex flex-col gap-1 p-4 flex-1 overflow-y-auto">
          <p class="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-outline">Management</p>
          @for (item of navItems; track item.path) {
            <a [routerLink]="item.path" routerLinkActive="bg-secondary/15 text-secondary"
               class="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-on-surface-variant transition-all hover:bg-surface-container-high hover:text-on-surface">
              <span class="material-symbols-outlined text-xl">{{ item.icon }}</span>
              {{ item.label }}
            </a>
          }
        </div>

        <div class="border-t border-outline-variant/20 p-4">
          <div class="mb-3 flex items-center gap-3 rounded-xl bg-surface-container-high p-3">
            <div class="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold text-sm">
              A
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-semibold text-on-surface">{{ auth.user()?.name }}</p>
              <p class="truncate text-xs text-secondary">Admin</p>
            </div>
          </div>
          <div class="flex gap-2">
            <a routerLink="/" class="flex-1 rounded-xl border border-outline-variant/40 py-2 text-center text-xs font-semibold text-on-surface-variant transition-all hover:border-primary hover:text-primary">
              Public Site
            </a>
            <button (click)="logout()" class="flex-1 rounded-xl bg-surface-container-high py-2 text-xs font-semibold text-on-surface transition-all hover:bg-red-500/20 hover:text-red-400">
              Logout
            </button>
          </div>
        </div>
      </aside>

      <!-- Main content -->
      <div class="flex-1 pl-64">
        <router-outlet />
      </div>
    </div>
  `,
})
export class AdminLayoutComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

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

  logout(): void {
    this.auth.logout();
  }
}
