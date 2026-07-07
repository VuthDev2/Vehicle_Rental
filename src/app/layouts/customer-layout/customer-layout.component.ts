import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-customer-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="flex min-h-screen" style="background: #0a0f1e; color: #f1f5f9;">

      <!-- ============ MOBILE OVERLAY ============ -->
      @if (sidebarOpen()) {
        <div class="fixed inset-0 z-30 md:hidden" style="background: rgba(0,0,0,0.6);"
             (click)="sidebarOpen.set(false)"></div>
      }

      <!-- ============ SIDEBAR ============ -->
      <aside class="fixed left-0 top-0 z-40 flex h-full w-64 flex-col transition-transform duration-300"
             [class.translate-x-0]="sidebarOpen() || true"
             [class.-translate-x-full]="false"
             style="background: #0e1527; border-right: 1px solid rgba(255,255,255,0.06);"
             [style.transform]="sidebarOpen() ? 'translateX(0)' : (isMobile ? 'translateX(-100%)' : 'translateX(0)')">

        <!-- Logo -->
        <div class="flex h-20 items-center gap-3 px-6 flex-shrink-0"
             style="border-bottom: 1px solid rgba(255,255,255,0.06);">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
               style="background: linear-gradient(135deg, #10b981, #059669);">
            <span class="material-symbols-outlined text-white text-lg">directions_car</span>
          </div>
          <div class="flex flex-col leading-tight">
            <span class="text-sm font-black text-white">Cambo Rent</span>
            <span class="text-[10px] font-bold uppercase tracking-widest" style="color: #10b981;">Customer Portal</span>
          </div>
        </div>

        <!-- Nav Items -->
        <div class="flex flex-col flex-1 overflow-y-auto p-4 gap-1">
          <p class="text-[10px] font-bold uppercase tracking-widest px-3 mb-2" style="color: #475569;">Navigation</p>

          @for (item of navItems; track item.path) {
            <a [routerLink]="item.path" routerLinkActive="nav-active-customer" (click)="sidebarOpen.set(false)"
               class="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer"
               style="color: #94a3b8;"
               [class.text-emerald-400]="false">
              <span class="material-symbols-outlined text-xl">{{ item.icon }}</span>
              {{ item.label }}
            </a>
          }
        </div>

        <!-- User Profile Section -->
        <div class="p-4 flex-shrink-0" style="border-top: 1px solid rgba(255,255,255,0.06);">
          <div class="rounded-2xl p-3 mb-3 flex items-center gap-3"
               style="background: rgba(16,185,129,0.07); border: 1px solid rgba(16,185,129,0.12);">
            <div class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-white"
                 style="background: linear-gradient(135deg, #10b981, #059669);">
              {{ auth.user()?.name?.charAt(0)?.toUpperCase() || 'U' }}
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-bold text-white truncate">{{ auth.user()?.name }}</p>
              <p class="text-xs truncate" style="color: #94a3b8;">{{ auth.user()?.email }}</p>
            </div>
          </div>
          <div class="flex gap-2">
            <a routerLink="/" class="flex-1 rounded-xl py-2 text-center text-xs font-semibold transition-all"
               style="border: 1px solid rgba(255,255,255,0.1); color: #94a3b8;">
              <span class="material-symbols-outlined text-sm align-middle">home</span>
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
             style="background: rgba(14,21,39,0.95); border-bottom: 1px solid rgba(255,255,255,0.06); backdrop-filter: blur(10px);">
          <button (click)="sidebarOpen.set(!sidebarOpen())"
                  class="w-10 h-10 rounded-xl flex items-center justify-center"
                  style="background: rgba(255,255,255,0.06);">
            <span class="material-symbols-outlined text-white">menu</span>
          </button>
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg flex items-center justify-center"
                 style="background: linear-gradient(135deg, #10b981, #059669);">
              <span class="material-symbols-outlined text-white text-sm">directions_car</span>
            </div>
            <span class="text-sm font-bold text-white">Cambo Rent</span>
          </div>
          <div class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white"
               style="background: linear-gradient(135deg, #10b981, #059669);">
            {{ auth.user()?.name?.charAt(0)?.toUpperCase() || 'U' }}
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

    a[routerLinkActive="nav-active-customer"],
    .router-link-active {
      background: rgba(16,185,129,0.1) !important;
      color: #10b981 !important;
    }

    @media (max-width: 768px) {
      aside {
        transform: translateX(-100%);
      }
      aside.sidebar-visible {
        transform: translateX(0);
      }
    }
  `]
})
export class CustomerLayoutComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  sidebarOpen = signal(false);
  get isMobile(): boolean {
    return typeof window !== 'undefined' && window.innerWidth < 768;
  }

  readonly navItems = [
    { path: '/customer/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/customer/bookings', icon: 'receipt_long', label: 'My Bookings' },
    { path: '/customer/payments', icon: 'payments', label: 'Payments' },
    { path: '/customer/profile', icon: 'manage_accounts', label: 'My Profile' },
  ];

  logout(): void {
    this.auth.logout();
  }
}
