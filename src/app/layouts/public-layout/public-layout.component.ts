import { Component, HostListener, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet, RouterLink],
  template: `
    <main class="app-shell min-h-screen bg-background text-on-surface">
      <header class="fixed top-0 z-50 w-full border-b border-outline-variant/25 transition-all duration-300 backdrop-blur-md"
        [class.bg-surface-container-lowest]="scrolled"
        [style.background]="scrolled ? 'rgba(6,14,32,0.97)' : 'rgba(6,14,32,0.8)'">
        <nav class="mx-auto flex h-20 w-full max-w-container-max items-center justify-between px-margin-desktop">
          <div class="flex items-center gap-8">
            <a class="flex items-center gap-3" routerLink="/">
              <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-on-primary shadow-lg shadow-primary/30">
                <span class="material-symbols-outlined text-xl">directions_car</span>
              </span>
              <div class="flex flex-col leading-tight">
                <span class="text-base font-bold tracking-tight text-on-surface">Cambo Rent</span>
                <span class="text-[10px] font-semibold uppercase tracking-widest text-primary">Vehicle Rentals</span>
              </div>
            </a>
            <div class="hidden items-center gap-6 lg:flex">
              <a class="text-sm font-semibold text-on-surface-variant transition-colors hover:text-primary" routerLink="/vehicles">Browse Vehicles</a>
              <a class="text-sm font-semibold text-on-surface-variant transition-colors hover:text-primary" routerLink="/about">About</a>
              <a class="text-sm font-semibold text-on-surface-variant transition-colors hover:text-primary" routerLink="/contact">Contact</a>
            </div>
          </div>

          <div class="flex items-center gap-3">
            @if (auth.isAuthenticated()) {
              <span class="hidden rounded-full border border-outline-variant/50 bg-surface-container-high px-4 py-2 text-sm font-semibold text-on-surface sm:block">
                <span class="material-symbols-outlined text-sm text-primary">person</span>
                {{ auth.user()?.name }}
              </span>
              @if (auth.role() === 'admin') {
                <a class="rounded-full border border-outline-variant/60 px-5 py-2 text-sm font-semibold text-on-surface transition-all hover:border-primary hover:text-primary" routerLink="/admin/dashboard">Admin Panel</a>
              } @else {
                <a class="rounded-full border border-outline-variant/60 px-5 py-2 text-sm font-semibold text-on-surface transition-all hover:border-primary hover:text-primary" routerLink="/customer/dashboard">My Bookings</a>
              }
              <button class="rounded-full bg-surface-container-high px-5 py-2 text-sm font-semibold text-on-surface transition-all hover:bg-surface-container-highest" type="button" (click)="logout()">Logout</button>
            } @else {
              <a class="px-5 py-2 text-sm font-semibold text-on-surface transition-all hover:text-primary" routerLink="/login">Login</a>
              <a class="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-on-primary shadow-lg shadow-primary/20 transition-all hover:brightness-110" routerLink="/register">Get Started</a>
            }
          </div>
        </nav>
      </header>

      <div class="page-shell pt-20">
        <router-outlet />
      </div>

      <footer class="border-t border-outline-variant/20 bg-surface-container-lowest">
        <div class="mx-auto max-w-container-max px-margin-desktop py-12">
          <div class="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div class="md:col-span-2">
              <div class="mb-4 flex items-center gap-3">
                <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-on-primary">
                  <span class="material-symbols-outlined text-lg">directions_car</span>
                </span>
                <span class="text-base font-bold text-on-surface">Cambo Rent</span>
              </div>
              <p class="max-w-sm text-sm text-on-surface-variant">Your trusted vehicle rental partner in Cambodia. Premium fleet, transparent pricing, and 24/7 support.</p>
            </div>
            <div>
              <h4 class="mb-3 text-sm font-bold uppercase tracking-widest text-on-surface">Quick Links</h4>
              <div class="flex flex-col gap-2 text-sm text-on-surface-variant">
                <a class="hover:text-primary transition-colors" routerLink="/vehicles">Browse Vehicles</a>
                <a class="hover:text-primary transition-colors" routerLink="/about">About Us</a>
                <a class="hover:text-primary transition-colors" routerLink="/contact">Contact</a>
              </div>
            </div>
            <div>
              <h4 class="mb-3 text-sm font-bold uppercase tracking-widest text-on-surface">Support</h4>
              <div class="flex flex-col gap-2 text-sm text-on-surface-variant">
                <span>📞 +855 12 345 678</span>
                <span>📧 info&#64;camborent.com</span>
                <span>📍 Phnom Penh, Cambodia</span>
              </div>
            </div>
          </div>
          <div class="mt-8 border-t border-outline-variant/20 pt-6 text-center text-sm text-on-surface-variant">
            © 2026 Cambo Rent. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  `,
})
export class PublicLayoutComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  scrolled = false;

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled = window.scrollY > 20;
  }

  logout(): void {
    this.auth.logout();
  }
}
