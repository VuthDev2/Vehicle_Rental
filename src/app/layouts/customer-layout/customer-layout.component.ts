import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-customer-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatButtonModule],
  template: `
    <main class="app-shell">
      <header class="modern-header">
        <a class="brand-block" routerLink="/customer/dashboard">
          <span class="brand-mark">D</span>
          <span class="brand-text">
            <strong>DrivePremium</strong>
            <small>Customer portal</small>
          </span>
        </a>

        <nav class="header-nav">
          <a routerLink="/vehicles" routerLinkActive="active">Browse</a>
          <a routerLink="/customer/bookings" routerLinkActive="active">Bookings</a>
          <a routerLink="/customer/profile" routerLinkActive="active">Profile</a>
          <a routerLink="/customer/favorites" routerLinkActive="active">Favorites</a>
          <a routerLink="/customer/payments" routerLinkActive="active">Payments</a>
        </nav>

        <div class="header-actions">
          <span class="user-pill">{{ auth.user()?.name }}</span>
          <button mat-stroked-button type="button" (click)="logout()">Logout</button>
        </div>
      </header>

      <div class="page-shell">
        <router-outlet />
      </div>
    </main>
  `,
})
export class CustomerLayoutComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/');
  }
}
