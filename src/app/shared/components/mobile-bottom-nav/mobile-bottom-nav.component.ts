import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-mobile-bottom-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './mobile-bottom-nav.component.html',
  styleUrl: './mobile-bottom-nav.component.css',
})
export class MobileBottomNavComponent {
  readonly tabs = [
    { labelKey: 'LAYOUT.DASHBOARD', icon: 'home', path: '/customer/dashboard' },
    { labelKey: 'LAYOUT.EXPLORE', icon: 'explore', path: '/customer/explore' },
    { labelKey: 'LAYOUT.BOOKINGS', icon: 'calendar_month', path: '/customer/bookings' },
    { labelKey: 'LAYOUT.PAYMENTS', icon: 'credit_card', path: '/customer/payments' },
    { labelKey: 'LAYOUT.PROFILE', icon: 'person', path: '/customer/profile' },
  ];
}