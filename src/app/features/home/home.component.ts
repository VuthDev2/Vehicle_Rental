import { Component, signal, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  scrollY = 0;

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrollY = window.scrollY;
  }

  readonly fleetCards = [
    {
      img: '/car_card.png',
      title: 'Sedan & SUV',
      label: 'Cars',
      desc: 'Perfect for family trips and long-distance travel. AC, comfortable seating, and spacious trunks.',
      from: '35',
      badge: 'badge-success',
      accentColor: '#10b981',
      glowColor: '#10b981',
    },
    {
      img: '/moto_card.png',
      title: 'Sport & Cruiser',
      label: 'Motorcycles',
      desc: 'Navigate Cambodia\'s streets effortlessly. Fuel-efficient, easy to park, thrilling to ride.',
      from: '12',
      badge: 'badge-info',
      accentColor: '#3b82f6',
      glowColor: '#3b82f6',
    },
    {
      img: '/bike_card.png',
      title: 'City & Eco Bikes',
      label: 'Bicycles',
      desc: 'Eco-friendly and fun. Explore Phnom Penh\'s streets, parks, and riverside at your own pace.',
      from: '5',
      badge: 'badge-warning',
      accentColor: '#f59e0b',
      glowColor: '#f59e0b',
    },
  ];

  readonly heroStats = [
    { value: '500+', label: 'Vehicles Available' },
    { value: '10K+', label: 'Happy Customers' },
    { value: '24/7', label: 'Support' },
  ];

  readonly trustPoints = [
    { icon: 'verified_user', label: 'Fully insured fleet' },
    { icon: 'payments', label: 'Secure payments' },
    { icon: 'support_agent', label: '24/7 support' },
  ];

  readonly features = [
    {
      icon: 'directions_car',
      title: 'Cars for Every Trip',
      desc: 'From compact sedans to spacious SUVs, our cars come with AC, GPS, and full insurance coverage.',
      iconBg: 'rgba(16,185,129,0.12)',
      iconColor: '#10b981',
    },
    {
      icon: 'two_wheeler',
      title: 'Motorcycles & Motos',
      desc: 'Fuel-efficient and nimble motorcycles perfect for navigating city streets and countryside roads.',
      iconBg: 'rgba(59,130,246,0.12)',
      iconColor: '#3b82f6',
    },
    {
      icon: 'pedal_bike',
      title: 'Bicycles & E-Bikes',
      desc: 'Eco-friendly city bikes and electric bikes — ideal for short trips, tourism, and riverside rides.',
      iconBg: 'rgba(245,158,11,0.12)',
      iconColor: '#f59e0b',
    },
    {
      icon: 'local_shipping',
      title: 'Doorstep Delivery',
      desc: 'Have your vehicle delivered directly to your hotel, home, or any location in Phnom Penh.',
      iconBg: 'rgba(139,92,246,0.12)',
      iconColor: '#8b5cf6',
    },
    {
      icon: 'calendar_month',
      title: 'Flexible Rental Plans',
      desc: 'Rent by the hour, day, week, or month. Our flexible plans adapt to your travel schedule.',
      iconBg: 'rgba(236,72,153,0.12)',
      iconColor: '#ec4899',
    },
    {
      icon: 'verified_user',
      title: 'Fully Insured Fleet',
      desc: 'Every vehicle passes a 50-point safety inspection. Full insurance included on all bookings.',
      iconBg: 'rgba(16,185,129,0.12)',
      iconColor: '#10b981',
    },
    {
      icon: 'support_agent',
      title: '24/7 Customer Support',
      desc: 'Our team is always available to assist with bookings, roadside emergencies, or any issues.',
      iconBg: 'rgba(59,130,246,0.12)',
      iconColor: '#3b82f6',
    },
    {
      icon: 'payments',
      title: 'Secure Payments',
      desc: 'Multiple payment methods supported. All transactions are encrypted and fully secure.',
      iconBg: 'rgba(245,158,11,0.12)',
      iconColor: '#f59e0b',
    },
    {
      icon: 'location_on',
      title: 'Multiple Pickup Hubs',
      desc: 'Conveniently located pickup points across Phnom Penh, Siem Reap, and other major cities.',
      iconBg: 'rgba(239,68,68,0.12)',
      iconColor: '#ef4444',
    },
  ];

  readonly steps = [
    {
      step: '01',
      icon: 'person_add',
      title: 'Create an Account',
      desc: 'Sign up in 60 seconds. All we need is your name, email, and a password.',
      color: '#10b981',
      iconBg: 'rgba(16,185,129,0.12)',
      iconColor: '#10b981',
    },
    {
      step: '02',
      icon: 'search',
      title: 'Browse & Choose',
      desc: 'Filter by vehicle type, price, location, and availability. Pick what fits you best.',
      color: '#3b82f6',
      iconBg: 'rgba(59,130,246,0.12)',
      iconColor: '#3b82f6',
    },
    {
      step: '03',
      icon: 'key',
      title: 'Book & Ride',
      desc: 'Confirm your booking, complete payment, and enjoy your ride. It\'s that simple.',
      color: '#8b5cf6',
      iconBg: 'rgba(139,92,246,0.12)',
      iconColor: '#8b5cf6',
    },
  ];

  readonly pricing = [
    {
      category: 'Bicycle',
      desc: 'Perfect for short trips and sightseeing',
      from: '$5',
      icon: 'pedal_bike',
      iconBg: 'rgba(245,158,11,0.12)',
      iconColor: '#f59e0b',
      borderColor: 'rgba(245,158,11,0.15)',
      bg: 'rgba(245,158,11,0.04)',
      features: ['Daily & weekly rates', 'City bikes & e-bikes', 'Free helmet included', 'GPS optional'],
    },
    {
      category: 'Motorcycle',
      desc: 'For city commuting and adventuring',
      from: '$12',
      icon: 'two_wheeler',
      iconBg: 'rgba(59,130,246,0.12)',
      iconColor: '#3b82f6',
      borderColor: 'rgba(59,130,246,0.2)',
      bg: 'rgba(59,130,246,0.04)',
      features: ['125cc to 500cc engines', 'Helmet & gear included', 'Insurance coverage', 'Unlimited mileage'],
    },
    {
      category: 'Car / SUV',
      desc: 'Comfort and style for every road',
      from: '$35',
      icon: 'directions_car',
      iconBg: 'rgba(16,185,129,0.12)',
      iconColor: '#10b981',
      borderColor: 'rgba(16,185,129,0.2)',
      bg: 'rgba(16,185,129,0.04)',
      features: ['AC & GPS navigation', 'Full insurance', 'Airport pickup available', 'Child seat on request'],
    },
  ];

  readonly testimonials = [
    {
      name: 'Sokha Lim',
      location: 'Phnom Penh, Cambodia',
      text: 'I rented a motorcycle for a week to explore Phnom Penh. The process was super easy, the bike was in perfect condition, and the price was unbeatable!',
      avatarBg: 'linear-gradient(135deg, #10b981, #059669)',
    },
    {
      name: 'Marie Dupont',
      location: 'Paris, France (Tourist)',
      text: 'We rented an SUV for our family trip to Siem Reap. The car was clean, delivery was on time, and customer support was always reachable. Highly recommend!',
      avatarBg: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    },
    {
      name: 'James Wong',
      location: 'Singapore',
      text: 'Rented bikes every morning during my trip to explore the riverside. Such a fun and affordable way to get around. Will definitely use Cambo Rent again!',
      avatarBg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    },
  ];
}
