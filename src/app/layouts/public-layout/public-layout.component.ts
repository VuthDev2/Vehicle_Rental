import { Component, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './public-layout.component.html',
  styleUrl: './public-layout.component.css',
})
export class PublicLayoutComponent {
  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);
  private readonly router = inject(Router);
  scrolled = false;
  mobileOpen = signal(false);

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled = window.scrollY > 20;
  }

  logout(): void {
    this.auth.logout();
  }

  readonly navLinks = [
    { path: '/', label: 'Home', icon: 'home', exact: true },
    { path: '/about', label: 'About', icon: 'info', exact: false },
    { path: '/contact', label: 'Contact', icon: 'call', exact: false },
  ];

  readonly socials = [
    { icon: 'facebook' },
    { icon: 'language' },
    { icon: 'phone' },
  ];

  readonly contacts = [
    { icon: 'call', value: '+855 12 345 678' },
    { icon: 'mail', value: 'info@camborent.com' },
    { icon: 'location_on', value: 'Phnom Penh, Cambodia' },
    { icon: 'schedule', value: 'Open 24/7' },
  ];
}
