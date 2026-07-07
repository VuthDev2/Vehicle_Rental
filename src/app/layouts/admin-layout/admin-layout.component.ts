import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="flex min-h-screen" style="background: #0c0d1a; color: #f1f5f9;">

      <!-- ============ MOBILE OVERLAY ============ -->
      @if (sidebarOpen()) {
        <div class="fixed inset-0 z-30 md:hidden" style="background: rgba(0,0,0,0.7);"
             (click)="sidebarOpen.set(false)"></div>
      }

      <!-- ============ ADMIN SIDEBAR ============ -->
      <aside class="fixed left-0 top-0 z-40 flex h-full w-64 flex-col transition-transform duration-300 md:translate-x-0"
             [style.transform]="isMobile && !sidebarOpen() ? 'translateX(-100%)' : 'translateX(0)'"
             style="background: linear-gradient(180deg, #13152b 0%, #0f1122 100%); border-right: 1px solid rgba(139,92,246,0.12);">

        <!-- Logo -->
        <div class="flex h-20 items-center gap-3 px-6 flex-shrink-0"
             style="border-bottom: 1px solid rgba(139,92,246,0.1);">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
               style="background: linear-gradient(135deg, #8b5cf6, #7c3aed);">
            <span class="material-symbols-outlined text-white text-lg">admin_panel_settings</span>
          </div>
          <div class="flex flex-col leading-tight">
            <span class="text-sm font-black text-white">Cambo Rent</span>
            <span class="text-[10px] font-bold uppercase tracking-widest" style="color: #a78bfa;">Admin Panel</span>
          </div>
        </div>

        <!-- Nav Items -->
        <div class="flex flex-col flex-1 overflow-y-auto p-4 gap-0.5">
          <p class="text-[10px] font-bold uppercase tracking-widest px-3 mb-3" style="color: #4c4f70;">Management</p>

          @for (item of navItems; track item.path) {
            <a [routerLink]="item.path" routerLinkActive="admin-nav-active" (click)="sidebarOpen.set(false)"
               class="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all group"
               style="color: #64748b;">
              <span class="material-symbols-outlined text-xl transition-colors">{{ item.icon }}</span>
              <span class="flex-1">{{ item.label }}</span>
              @if (item.badge) {
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style="background: rgba(139,92,246,0.2); color: #a78bfa;">{{ item.badge }}</span>
              }
            </a>
          }

          <!-- Divider -->
          <div class="my-3 h-px" style="background: rgba(255,255,255,0.05);"></div>
          <p class="text-[10px] font-bold uppercase tracking-widest px-3 mb-3" style="color: #4c4f70;">System</p>

          @for (item of systemItems; track item.path) {
            <a [routerLink]="item.path" routerLinkActive="admin-nav-active" (click)="sidebarOpen.set(false)"
               class="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all"
               style="color: #64748b;">
              <span class="material-symbols-outlined text-xl">{{ item.icon }}</span>
              {{ item.label }}
            </a>
          }
        </div>

        <!-- Admin User Info -->
        <div class="p-4 flex-shrink-0" style="border-top: 1px solid rgba(139,92,246,0.1);">
          <div class="rounded-2xl p-3 mb-3 flex items-center gap-3"
               style="background: rgba(139,92,246,0.08); border: 1px solid rgba(139,92,246,0.15);">
            <div class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-white"
                 style="background: linear-gradient(135deg, #8b5cf6, #7c3aed);">
              {{ auth.user()?.name?.charAt(0)?.toUpperCase() || 'A' }}
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-bold text-white truncate">{{ auth.user()?.name }}</p>
              <span class="text-[10px] font-bold uppercase tracking-wide" style="color: #a78bfa;">Administrator</span>
            </div>
          </div>
          <div class="flex gap-2">
            <a routerLink="/" class="flex-1 rounded-xl py-2 text-center text-xs font-semibold transition-all"
               style="border: 1px solid rgba(255,255,255,0.08); color: #64748b;">
              Public Site
            </a>
            <button (click)="logout()"
                    class="flex-1 rounded-xl py-2 text-xs font-semibold transition-all"
                    style="background: rgba(239,68,68,0.1); color: #f87171; border: 1px solid rgba(239,68,68,0.15);">
              Logout
            </button>
          </div>
        </div>
      </aside>

      <!-- ============ MAIN CONTENT ============ -->
      <div class="flex-1 flex flex-col" [class.pl-64]="!isMobile" style="min-width: 0;">

        <!-- Mobile Topbar -->
        <div class="md:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-20"
             style="background: rgba(12,13,26,0.95); border-bottom: 1px solid rgba(139,92,246,0.12); backdrop-filter: blur(10px);">
          <button (click)="sidebarOpen.set(!sidebarOpen())"
                  class="w-10 h-10 rounded-xl flex items-center justify-center"
                  style="background: rgba(139,92,246,0.1); border: 1px solid rgba(139,92,246,0.2);">
            <span class="material-symbols-outlined" style="color: #a78bfa;">menu</span>
          </button>
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg flex items-center justify-center"
                 style="background: linear-gradient(135deg, #8b5cf6, #7c3aed);">
              <span class="material-symbols-outlined text-white text-sm">admin_panel_settings</span>
            </div>
            <span class="text-sm font-bold text-white">Admin Panel</span>
          </div>
          <div class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white"
               style="background: linear-gradient(135deg, #8b5cf6, #7c3aed);">
            A
          </div>
        </div>

        <!-- Page Content -->
        <main class="flex-1 overflow-auto">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    :host ::ng-deep .admin-nav-active {
      background: rgba(139,92,246,0.12) !important;
      color: #a78bfa !important;
    }

    a[routerLinkActive="admin-nav-active"] {
      background: rgba(139,92,246,0.12) !important;
      color: #a78bfa !important;
    }

    a[routerLinkActive="admin-nav-active"] .material-symbols-outlined {
      color: #a78bfa !important;
    }
  `]
})
export class AdminLayoutComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  sidebarOpen = signal(false);

  get isMobile(): boolean {
    return typeof window !== 'undefined' && window.innerWidth < 768;
  }

  readonly navItems = [
    { path: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard', badge: null },
    { path: '/admin/vehicles', icon: 'directions_car', label: 'Vehicles', badge: null },
    { path: '/admin/users', icon: 'group', label: 'Customers', badge: null },
    { path: '/admin/bookings', icon: 'receipt_long', label: 'Bookings', badge: null },
    { path: '/admin/payments', icon: 'payments', label: 'Payments', badge: null },
    { path: '/admin/promotions', icon: 'local_offer', label: 'Promotions', badge: null },
  ];

  readonly systemItems = [
    { path: '/admin/reports', icon: 'bar_chart', label: 'Reports' },
    { path: '/admin/settings', icon: 'settings', label: 'Settings' },
  ];

  logout(): void {
    this.auth.logout();
  }
}
