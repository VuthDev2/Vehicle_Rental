import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-mobile-bottom-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './mobile-bottom-nav.component.html',
  styleUrl: './mobile-bottom-nav.component.css',
})
export class MobileBottomNavComponent {
  readonly tabs = [
    { label: 'Dashboard', icon: 'dashboard', path: '/customer/dashboard' },
    { label: 'Explore', icon: 'explore', path: '/customer/explore' },
    { label: 'Bookings', icon: 'receipt_long', path: '/customer/bookings' },
    { label: 'Payments', icon: 'payments', path: '/customer/payments' },
    { label: 'Profile', icon: 'manage_accounts', path: '/customer/profile' },
  ];
}