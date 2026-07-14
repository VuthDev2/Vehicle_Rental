import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="flex min-h-screen" style="background: #F8F9FF;">

      <!-- ============ MOBILE OVERLAY ============ -->
      @if (sidebarOpen()) {
        <div class="fixed inset-0 z-30 md:hidden" style="background: rgba(0,0,0,0.5);"
             (click)="sidebarOpen.set(false)"></div>
      }

      <!-- ============ SIDEBAR ============ -->
      <aside class="fixed left-0 top-0 z-40 flex h-full w-64 flex-col transition-transform duration-300 ease-in-out md:translate-x-0"
             [style.transform]="isMobile && !sidebarOpen() ? 'translateX(-100%)' : 'translateX(0)'"
             style="background: #131B2E;">

        <!-- Logo -->
        <div style="padding: 24px 20px 28px; border-bottom: 1px solid rgba(255,255,255,0.06); flex-shrink: 0;">
          <div class="flex items-center gap-3">
            <div style="width: 38px; height: 38px; border-radius: 10px; background: #3980F4; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <span class="material-symbols-outlined" style="font-size: 22px; color: #FFFFFF;">directions_car</span>
            </div>
            <div>
              <h1 style="font-size: 18px; font-weight: 700; color: #FFFFFF; margin: 0; line-height: 1.2;">Cambo Rent</h1>
              <p style="font-size: 11px; font-weight: 600; color: #7C839B; margin: 0; letter-spacing: 0.5px; text-transform: uppercase;">Admin Panel</p>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 flex flex-col gap-0.5 overflow-y-auto" style="padding: 12px 10px;">
          @for (item of navItems; track item.path) {
            <a [routerLink]="item.path"
               routerLinkActive="active"
               #rla="routerLinkActive"
               (click)="sidebarOpen.set(false)"
               class="flex items-center gap-3 rounded-lg text-sm font-semibold transition-all duration-150"
               [class.active]="rla.isActive"
               [style.color]="rla.isActive ? '#FFFFFF' : '#7C839B'"
               [style.background]="rla.isActive ? 'rgba(57,128,244,0.15)' : 'transparent'"
               [style.padding]="rla.isActive ? '10px 14px 10px 10px' : '10px 14px'"
               style="position: relative;"
               onmouseover="if(!this.classList.contains('active')){this.style.background='rgba(255,255,255,0.05)';}"
               onmouseout="if(!this.classList.contains('active')){this.style.background='transparent';}">
              @if (rla.isActive) {
                <span style="position: absolute; left: 0; top: 4px; bottom: 4px; width: 3px; border-radius: 0 3px 3px 0; background: #3980F4;"></span>
              }
              <span class="material-symbols-outlined flex-shrink-0"
                    [style.color]="rla.isActive ? '#3980F4' : '#7C839B'"
                    style="font-size: 20px;">{{ item.icon }}</span>
              <span style="letter-spacing: 0.2px;">{{ item.label }}</span>
            </a>
          }
        </nav>

        <!-- Bottom section -->
        <div style="border-top: 1px solid rgba(255,255,255,0.06); padding: 16px 20px; flex-shrink: 0;">
          @if (auth.user(); as user) {
            <div class="flex items-center gap-3 mb-3" style="padding: 0 4px;">
              <div style="width: 34px; height: 34px; border-radius: 50%; background: #3980F4; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #FFFFFF; flex-shrink: 0;">
                {{ user.name?.charAt(0)?.toUpperCase() || 'A' }}
              </div>
              <div style="min-width: 0; flex: 1;">
                <p style="font-size: 13px; font-weight: 600; color: #FFFFFF; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ user.name }}</p>
                <p style="font-size: 11px; color: #7C839B; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ user.email }}</p>
              </div>
            </div>
          }
          <a routerLink="/"
             class="flex items-center gap-3 rounded-lg text-sm font-semibold transition-all duration-150"
             style="color: #7C839B; padding: 10px 12px;"
             onmouseover="this.style.background='rgba(255,255,255,0.05)'"
             onmouseout="this.style.background='transparent'">
            <span class="material-symbols-outlined" style="font-size: 18px;">logout</span>
            Back to Site
          </a>
        </div>
      </aside>

      <!-- ============ MAIN CONTENT ============ -->
      <div class="flex-1 flex flex-col min-h-screen" [class.pl-64]="!isMobile" style="min-width: 0;">

        <!-- Mobile Topbar -->
        <div class="md:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-20 border-b"
             style="background: #FFFFFF; border-color: #E5E7EB;">
          <button (click)="sidebarOpen.set(!sidebarOpen())"
                  class="w-10 h-10 rounded-lg flex items-center justify-center"
                  style="background: #F3F4F6;">
            <span class="material-symbols-outlined" style="color: #374151;">menu</span>
          </button>
          <div class="flex items-center gap-2">
            <div style="width: 28px; height: 28px; border-radius: 6px; background: #3980F4; display: flex; align-items: center; justify-content: center;">
              <span class="material-symbols-outlined" style="font-size: 16px; color: #FFFFFF;">directions_car</span>
            </div>
            <span class="text-sm font-bold" style="color: #0B1C30;">Cambo Rent</span>
          </div>
          @if (auth.user(); as user) {
            <div class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white"
                 style="background: #3980F4;">
              {{ user.name?.charAt(0)?.toUpperCase() || 'A' }}
            </div>
          }
        </div>

        <!-- Page Content -->
        <main class="flex-1">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    a.active { color: #FFFFFF !important; }
    a.active .material-symbols-outlined { color: #FFFFFF !important; }
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
