import { Component, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen flex flex-col" style="background: #0a0f1e; color: #f1f5f9;">

      <!-- ======================== NAVBAR ======================== -->
      <header
        class="fixed top-0 z-50 w-full transition-all duration-300"
        [style.background]="scrolled ? 'rgba(10,15,30,0.97)' : 'transparent'"
        [style.border-bottom]="scrolled ? '1px solid rgba(255,255,255,0.07)' : 'none'"
        [style.box-shadow]="scrolled ? '0 4px 30px rgba(0,0,0,0.3)' : 'none'"
        [style.backdrop-filter]="scrolled ? 'blur(20px)' : 'none'">

        <nav class="max-w-[1280px] mx-auto px-[clamp(20px,5vw,72px)] h-20 flex items-center justify-between">

          <!-- Logo -->
          <a routerLink="/" class="flex items-center gap-3 flex-shrink-0">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                 style="background: linear-gradient(135deg, #10b981, #059669);">
              <span class="material-symbols-outlined text-white text-xl">directions_car</span>
            </div>
            <div class="flex flex-col leading-tight">
              <span class="text-base font-black text-white">Cambo Rent</span>
              <span class="text-[10px] font-bold uppercase tracking-widest" style="color: #10b981;">Vehicle Rentals</span>
            </div>
          </a>

          <!-- Desktop Nav Links -->
          <div class="hidden md:flex items-center gap-1">
            @for (link of navLinks; track link.path) {
              <a [routerLink]="link.path"
                 routerLinkActive="text-emerald-400 bg-emerald-500/10"
                 [routerLinkActiveOptions]="{exact: link.exact}"
                 class="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:bg-white/5"
                 style="color: #94a3b8;">{{ link.label }}</a>
            }
          </div>

          <!-- Auth Actions (Desktop) -->
          <div class="hidden md:flex items-center gap-2">
            @if (auth.isAuthenticated()) {
              <div class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                   style="background: rgba(255,255,255,0.05); color: #f1f5f9;">
                <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                     style="background: linear-gradient(135deg, #10b981, #059669);">
                  {{ auth.user()?.name?.charAt(0)?.toUpperCase() || 'U' }}
                </div>
                {{ auth.user()?.name }}
              </div>
              @if (auth.role() === 'admin') {
                <a routerLink="/admin/dashboard"
                   class="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:brightness-110"
                   style="background: rgba(139,92,246,0.15); color: #a78bfa; border: 1px solid rgba(139,92,246,0.25);">
                  <span class="material-symbols-outlined text-lg">shield</span> Admin Panel
                </a>
              } @else {
                <a routerLink="/customer/dashboard"
                   class="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:brightness-110"
                   style="background: rgba(16,185,129,0.12); color: #10b981; border: 1px solid rgba(16,185,129,0.2);">
                  <span class="material-symbols-outlined text-lg">dashboard</span> My Account
                </a>
              }
              <button (click)="logout()"
                      class="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:brightness-110"
                      style="background: rgba(239,68,68,0.1); color: #f87171; border: 1px solid rgba(239,68,68,0.15);">
                <span class="material-symbols-outlined text-lg">logout</span>
              </button>
            } @else {
              <a routerLink="/login"
                 class="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-white/5"
                 style="color: #94a3b8; border: 1px solid rgba(255,255,255,0.1);">
                Sign In
              </a>
              <a routerLink="/register" class="btn-primary py-2.5 px-6 text-sm">
                Get Started
              </a>
            }
          </div>

          <!-- Mobile Menu Toggle -->
          <button (click)="mobileOpen.set(!mobileOpen())"
                  class="md:hidden w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                  [style.background]="mobileOpen() ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)'">
            <span class="material-symbols-outlined text-white">{{ mobileOpen() ? 'close' : 'menu' }}</span>
          </button>
        </nav>

        <!-- Mobile Menu -->
        @if (mobileOpen()) {
          <div class="md:hidden border-t animate-fade-in"
               style="background: rgba(10,15,30,0.98); border-color: rgba(255,255,255,0.07);">
            <div class="px-6 py-4 flex flex-col gap-1">
              <a routerLink="/" (click)="mobileOpen.set(false)"
                 class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all hover:bg-white/5"
                 style="color: #94a3b8;">
                <span class="material-symbols-outlined text-lg">home</span> Home
              </a>
              <a routerLink="/about" (click)="mobileOpen.set(false)"
                 class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all hover:bg-white/5"
                 style="color: #94a3b8;">
                <span class="material-symbols-outlined text-lg">info</span> About
              </a>
              <a routerLink="/contact" (click)="mobileOpen.set(false)"
                 class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all hover:bg-white/5"
                 style="color: #94a3b8;">
                <span class="material-symbols-outlined text-lg">call</span> Contact
              </a>
              <div class="border-t my-2" style="border-color: rgba(255,255,255,0.07);"></div>
              @if (auth.isAuthenticated()) {
                @if (auth.role() === 'admin') {
                  <a routerLink="/admin/dashboard" (click)="mobileOpen.set(false)"
                     class="btn-admin py-3 rounded-xl text-sm justify-center">Admin Panel</a>
                } @else {
                  <a routerLink="/customer/dashboard" (click)="mobileOpen.set(false)"
                     class="btn-primary py-3 rounded-xl text-sm justify-center">My Account</a>
                }
                <button (click)="logout(); mobileOpen.set(false)"
                        class="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-center w-full transition-all"
                        style="background: rgba(239,68,68,0.1); color: #f87171;">
                  <span class="material-symbols-outlined text-lg">logout</span> Logout
                </button>
              } @else {
                <a routerLink="/login" (click)="mobileOpen.set(false)"
                   class="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-center w-full transition-all hover:bg-white/5"
                   style="background: rgba(255,255,255,0.06); color: #f1f5f9;">
                  <span class="material-symbols-outlined text-lg">login</span> Sign In
                </a>
                <a routerLink="/register" (click)="mobileOpen.set(false)"
                   class="btn-primary py-3 rounded-xl text-sm justify-center">Create Account</a>
              }
            </div>
          </div>
        }
      </header>

      <!-- Page Content -->
      <div class="flex-1 pt-20">
        <router-outlet />
      </div>

      <!-- ======================== FOOTER ======================== -->
      <footer style="background: #0e1527; border-top: 1px solid rgba(255,255,255,0.06);">
        <div class="max-w-[1280px] mx-auto px-[clamp(20px,5vw,72px)] py-16">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

            <!-- Brand -->
            <div class="md:col-span-2">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                     style="background: linear-gradient(135deg, #10b981, #059669);">
                  <span class="material-symbols-outlined text-white text-xl">directions_car</span>
                </div>
                <span class="text-lg font-black text-white">Cambo Rent</span>
              </div>
              <p class="text-sm leading-relaxed max-w-xs" style="color: #94a3b8;">
                Your trusted vehicle rental partner in Cambodia. Cars, motorcycles, and bikes —
                premium fleet with transparent pricing and 24/7 support.
              </p>
              <div class="flex gap-3 mt-6">
                @for (social of socials; track social.icon) {
                  <div class="w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all hover:-translate-y-0.5"
                       style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08);">
                    <span class="material-symbols-outlined text-base" style="color: #94a3b8;">{{ social.icon }}</span>
                  </div>
                }
              </div>
            </div>

            <!-- Links -->
            <div>
              <h4 class="text-xs font-bold uppercase tracking-widest text-white mb-4">Quick Links</h4>
              <div class="flex flex-col gap-3">
                <a routerLink="/" class="text-sm transition-colors hover:text-emerald-400" style="color: #94a3b8;">Home</a>
                <a routerLink="/about" class="text-sm transition-colors hover:text-emerald-400" style="color: #94a3b8;">About Us</a>
                <a routerLink="/contact" class="text-sm transition-colors hover:text-emerald-400" style="color: #94a3b8;">Contact</a>
                <a routerLink="/login" class="text-sm transition-colors hover:text-emerald-400" style="color: #94a3b8;">Sign In</a>
                <a routerLink="/register" class="text-sm transition-colors hover:text-emerald-400" style="color: #94a3b8;">Register</a>
              </div>
            </div>

            <!-- Contact -->
            <div>
              <h4 class="text-xs font-bold uppercase tracking-widest text-white mb-4">Contact Us</h4>
              <div class="flex flex-col gap-3">
                @for (contact of contacts; track contact.value) {
                  <div class="flex items-center gap-2 text-sm" style="color: #94a3b8;">
                    <span class="material-symbols-outlined text-base" style="color: #10b981;">{{ contact.icon }}</span>
                    {{ contact.value }}
                  </div>
                }
              </div>
            </div>

          </div>

          <!-- Bottom bar -->
          <div class="pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4"
               style="border-color: rgba(255,255,255,0.06);">
            <p class="text-sm" style="color: #475569;">© 2026 Cambo Rent. All rights reserved.</p>
            <div class="flex gap-6">
              <span class="text-sm cursor-pointer hover:text-emerald-400 transition-colors" style="color: #475569;">Privacy Policy</span>
              <span class="text-sm cursor-pointer hover:text-emerald-400 transition-colors" style="color: #475569;">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  `,
})
export class PublicLayoutComponent {
  readonly auth = inject(AuthService);
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
    { path: '/', label: 'Home', exact: true },
    { path: '/about', label: 'About', exact: false },
    { path: '/contact', label: 'Contact', exact: false },
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
