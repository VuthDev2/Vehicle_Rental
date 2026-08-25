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
    { label: 'Home', icon: 'home', path: '/customer/dashboard' },
    { label: 'Explore', icon: 'explore', path: '/customer/explore' },
    { label: 'Bookings', icon: 'calendar_month', path: '/customer/bookings' },
    { label: 'Payments', icon: 'credit_card', path: '/customer/payments' },
    { label: 'Profile', icon: 'person', path: '/customer/profile' },
  ];
}