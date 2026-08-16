import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-simple-page',
  imports: [RouterLink],
  templateUrl: './simple-page.component.html',
  styleUrl: './simple-page.component.css',
})
export class SimplePageComponent {
  readonly route = inject(ActivatedRoute);
  readonly title = this.route.snapshot.data['title'] as string;
  readonly body = this.route.snapshot.data['body'] as string;
  readonly pageType = this.route.snapshot.routeConfig?.path ?? 'about';
  readonly isContact = this.pageType === 'contact';

  readonly aboutStats = [
    { value: '24/7', label: 'Customer support' },
    { value: '4+', label: 'Rental duration options' },
    { value: 'ABA', label: 'QR payment ready' },
  ];

  readonly aboutFeatures = [
    {
      icon: 'directions_car',
      title: 'Quality vehicles',
      text: 'Cars, motorcycles, and vans prepared for city trips, airport pickup, and longer journeys.',
    },
    {
      icon: 'schedule',
      title: 'Flexible rentals',
      text: 'Book by the hour, day, week, month, or year with transparent pricing before checkout.',
    },
    {
      icon: 'support_agent',
      title: 'Local assistance',
      text: 'Our Phnom Penh team helps with pickup, return, payment questions, and booking changes.',
    },
  ];

  readonly contactMethods = [
    { icon: 'call', title: 'Phone', detail: '+855 12 345 678', note: 'Daily support line' },
    { icon: 'mail', title: 'Email', detail: 'support@camborent.com', note: 'Booking and payment help' },
    { icon: 'location_on', title: 'Location', detail: 'Phnom Penh, Cambodia', note: 'Central service hub' },
    { icon: 'schedule', title: 'Hours', detail: 'Open 24/7', note: 'Pickup and support' },
  ];

  readonly contactSupport = [
    'Booking changes and extensions',
    'ABA QR payment confirmation',
    'Pickup, return, and delivery coordination',
  ];
}
