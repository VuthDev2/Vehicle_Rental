import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { SearchService } from '../../core/services/search.service';
import { NotificationService } from '../../core/services/notification.service';
import { MobileBottomNavComponent } from '../../shared/components/mobile-bottom-nav/mobile-bottom-nav.component';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '../../core/services/language.service';
import { CustomerChatWidgetComponent } from '../../shared/components/customer-chat-widget/customer-chat-widget.component';

@Component({
  selector: 'app-customer-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MobileBottomNavComponent, CustomerChatWidgetComponent, FormsModule, DatePipe, TranslatePipe],
  templateUrl: './customer-layout.component.html',
  styleUrl: './customer-layout.component.css'
})
export class CustomerLayoutComponent {
  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);
  readonly searchService = inject(SearchService);
  readonly notifications = inject(NotificationService);
  readonly lang = inject(LanguageService);
  private readonly router = inject(Router);
  sidebarOpen = signal(false);
  sidebarCollapsed = signal(true);
  profileMenuOpen = signal(false);
  notificationMenuOpen = signal(false);

  toggleCollapse(): void {
    this.sidebarCollapsed.update((v) => !v);
  }

  toggleSidebar(): void {
    this.sidebarOpen.set(!this.sidebarOpen());
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

  get userName(): string {
    const user = this.auth.user();
    if (!user?.name) return 'Henry';
    const first = user.name.split(' ')[0];
    return first.charAt(0).toUpperCase() + first.slice(1);
  }



  readonly navItems = [
    { path: '/customer/dashboard', icon: 'home', label: 'Dashboard', labelKey: 'LAYOUT.DASHBOARD' },
    { path: '/customer/explore', icon: 'explore', label: 'Explore', labelKey: 'LAYOUT.EXPLORE' },
    { path: '/customer/bookings', icon: 'receipt_long', label: 'My Bookings', labelKey: 'LAYOUT.MY_BOOKINGS' },
    { path: '/customer/payments', icon: 'payments', label: 'Payments', labelKey: 'LAYOUT.PAYMENTS' },
    { path: '/customer/profile', icon: 'manage_accounts', label: 'My Profile', labelKey: 'LAYOUT.MY_PROFILE' },
  ];

  /** Derive page label from the current route for the header breadcrumb. */
  readonly pageLabel = computed(() => {
    const url = this.router.url;
    const match = this.navItems.find((n) => url.startsWith(n.path));
    return match ? this.lang.currentLang() && this.lang['translate'] ? this.lang['translate'].instant(match.labelKey) : match.label : 'Dashboard';
  });

  readonly pageIcon = computed(() => {
    const url = this.router.url;
    const match = this.navItems.find((n) => url.startsWith(n.path));
    return match?.icon || 'dashboard';
  });

  confirmLogout(): void {
    this.auth.logout();
  }

  handleNotificationClick(notif: any) {
    if (!notif.read) {
      this.notifications.markAsRead(notif._id).subscribe();
    }
    this.notificationMenuOpen.set(false);
    if (notif.link) {
      this.router.navigate([notif.link]);
    }
  }

  onGlobalSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchService.searchTerm.set(target.value);
    if (this.router.url !== '/customer/explore') {
      this.router.navigate(['/customer/explore']);
    }
  }
}
