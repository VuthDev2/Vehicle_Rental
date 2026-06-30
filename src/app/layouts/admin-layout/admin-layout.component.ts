import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatButtonModule],
  template: `
    <main class="app-shell">
      <header class="modern-header admin-header">
        <a class="brand-block" routerLink="/admin/dashboard">
          <span class="brand-mark">D</span>
          <span class="brand-text">
            <strong>DrivePremium</strong>
            <small>Operations center</small>
          </span>
        </a>

        <nav class="header-nav">
          <a routerLink="/admin/dashboard" routerLinkActive="active">Dashboard</a>
          <a routerLink="/admin/vehicles" routerLinkActive="active">Vehicles</a>
          <a routerLink="/admin/users" routerLinkActive="active">Users</a>
          <a routerLink="/admin/bookings" routerLinkActive="active">Bookings</a>
          <a routerLink="/admin/reports" routerLinkActive="active">Reports</a>
          <a routerLink="/admin/settings" routerLinkActive="active">Settings</a>
        </nav>

        <div class="header-actions">
          <span class="user-pill">Admin</span>
          <button mat-stroked-button type="button" (click)="logout()">Logout</button>
        </div>
      </header>

      <div class="page-shell">
        <router-outlet />
      </div>
    </main>
  `,
})
export class AdminLayoutComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/');
  }
}
