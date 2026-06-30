import { Component, HostListener, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet, RouterLink],
  template: `
    <main class="app-shell min-h-screen bg-background text-on-surface">
      <header class="fixed top-0 z-50 w-full border-b border-outline-variant/25 transition-all duration-300" [class.backdrop-blur-md]="true" [class.bg-surface-container-lowest/80]="!scrolled" [class.bg-surface-container-lowest/95]="scrolled" [class.py-1]="scrolled">
        <nav class="mx-auto flex h-20 w-full max-w-container-max items-center justify-between px-margin-desktop">
          <div class="flex items-center gap-8">
            <a class="flex items-center gap-3" routerLink="/">
              <span class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
                <span class="material-symbols-outlined">directions_car</span>
              </span>
              <span class="text-lg font-semibold tracking-tight text-on-surface">DrivePremium</span>
            </a>
            <div class="hidden items-center gap-7 lg:flex">
              <div class="group relative">
                <button class="flex items-center gap-1 pb-1 text-sm font-semibold text-primary">
                  Vehicles <span class="material-symbols-outlined text-sm">expand_more</span>
                </button>
                <div class="invisible absolute left-0 top-full mt-3 w-48 rounded-2xl border border-outline-variant/40 bg-surface-container-high p-2 opacity-0 shadow-2xl shadow-black/30 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                  <a class="flex items-center gap-2 rounded-xl p-3 transition-colors hover:bg-surface-container-highest" routerLink="/vehicles">
                    <span class="material-symbols-outlined text-primary">directions_car</span> Cars
                  </a>
                  <a class="flex items-center gap-2 rounded-xl p-3 transition-colors hover:bg-surface-container-highest" routerLink="/vehicles">
                    <span class="material-symbols-outlined text-primary">motorcycle</span> Motorcycles
                  </a>
                  <a class="flex items-center gap-2 rounded-xl p-3 transition-colors hover:bg-surface-container-highest" routerLink="/vehicles">
                    <span class="material-symbols-outlined text-primary">pedal_bike</span> E-Bikes
                  </a>
                </div>
              </div>
              <a class="text-sm font-semibold text-on-surface-variant transition-colors hover:text-primary" routerLink="/about">About</a>
              <a class="text-sm font-semibold text-on-surface-variant transition-colors hover:text-primary" routerLink="/contact">Contact</a>
            </div>
          </div>

          <div class="flex items-center gap-3">
            @if (auth.isAuthenticated()) {
              <span class="hidden rounded-full border border-outline-variant/50 bg-surface-container-high px-4 py-2 text-sm font-semibold text-on-surface sm:block">Hello, {{ auth.user()?.name }}</span>
              <a class="rounded-full border border-outline-variant/60 px-5 py-2 text-sm font-semibold text-on-surface transition-all hover:border-primary hover:text-primary" routerLink="/customer/dashboard">My Trips</a>
              <button class="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-on-primary shadow-lg shadow-primary/20 transition-all hover:brightness-110" type="button" (click)="logout()">Logout</button>
            } @else {
              <a class="px-5 py-2 text-sm font-semibold text-on-surface transition-all hover:text-primary" routerLink="/login">Login</a>
              <a class="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-on-primary shadow-lg shadow-primary/20 transition-all hover:brightness-110" routerLink="/register">Register</a>
            }
          </div>
        </nav>
      </header>

      <div class="page-shell pt-20">
        <router-outlet />
      </div>

      <footer class="mx-auto mb-8 mt-12 flex max-w-container-max flex-col gap-4 rounded-[1.5rem] border border-outline-variant/30 bg-surface-container-low px-8 py-8 text-on-surface-variant md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-lg font-semibold text-white">DrivePremium © 2026</p>
          <p>Premium rentals, concierge support, and effortless booking.</p>
        </div>
        <div class="flex items-center gap-4 text-sm">
          <span class="rounded-full border border-outline-variant/40 px-3 py-1">24/7 concierge</span>
          <span class="rounded-full border border-outline-variant/40 px-3 py-1">Secure payment</span>
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
    this.router.navigateByUrl('/');
  }
}
