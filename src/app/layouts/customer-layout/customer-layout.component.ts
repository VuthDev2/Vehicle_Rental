import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { MobileBottomNavComponent } from '../../shared/components/mobile-bottom-nav/mobile-bottom-nav.component';

 @Component({
  selector: 'app-customer-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MobileBottomNavComponent],
  templateUrl: './customer-layout.component.html',
  styleUrl: './customer-layout.component.css'
})
export class CustomerLayoutComponent {
  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);
  private readonly router = inject(Router);

  sidebarOpen = signal(false);
  sidebarCollapsed = signal(false);

  toggleCollapse(): void {
    this.sidebarCollapsed.update((v) => !v);
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.set(!this.sidebarCollapsed());
  }

  /** Show a dismissible banner (per user) prompting unverified accounts to verify their email. */
  readonly showVerifyBanner = computed(() => {
    const user = this.auth.user();
    if (!user || user.emailVerified) return false;
    if (typeof localStorage !== 'undefined' && localStorage.getItem(`cr_verify_dismissed_${user._id}`)) {
      return false;
    }
    return true;
  });

  dismissVerifyBanner(): void {
    const user = this.auth.user();
    if (user && typeof localStorage !== 'undefined') {
      localStorage.setItem(`cr_verify_dismissed_${user._id}`, '1');
    }
  }

  get isMobile(): boolean {
    return typeof window !== 'undefined' && window.innerWidth < 768;
  }

  readonly navItems = [
    { path: '/customer/dashboard', icon: 'home', label: 'Home' },
    { path: '/customer/explore', icon: 'explore', label: 'Explore' },
    { path: '/customer/bookings', icon: 'receipt_long', label: 'My Bookings' },
    { path: '/customer/payments', icon: 'payments', label: 'Payments' },
    { path: '/customer/profile', icon: 'manage_accounts', label: 'My Profile' },
  ];

  confirmLogout(): void {
    this.auth.logout();
  }
}
