import { Component, signal, HostListener, ViewChild, ElementRef, AfterViewInit, OnInit, inject, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';
import { AccordionGalleryComponent } from '../../shared/components/accordion-gallery/accordion-gallery.component';
import { ScrollVelocityComponent } from '../../shared/components/scroll-velocity/scroll-velocity.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, AccordionGalleryComponent, ScrollVelocityComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly seoService = inject(SeoService);
  private readonly platformId = inject(PLATFORM_ID);
  private observer: IntersectionObserver | null = null;
  public isMobile = signal(false);

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.checkScreenSize();
    }
    this.seoService.updateSeoTags({
      title: 'Cambo Rent - Premium Vehicle Rental in Cambodia',
      description: 'Rent premium cars, motorcycles, and bicycles in Cambodia. Explore Phnom Penh and Siem Reap with Cambo Rent. Fully insured, 24/7 support, doorstep delivery.',
    });
  }
  scrollY = 0;
  featuredProgress = 0; // 0 = off-screen below, 1 = fully revealed
  
  videos = ['/pexels_car.mp4', '/pexels_moto.mp4'];
  currentVideoIndex = signal(0);
  
  featuredImages = [
    '/luxury_suv.jpg',
    '/premium_sports_car.jpg',
    '/premium_motorcycle.jpg',
    '/premium_bicycle.jpg'
  ];
  currentFeaturedIndex = signal(0);
  private featuredInterval: any;

  onVideoEnded(videoElement: HTMLVideoElement) {
    this.currentVideoIndex.update(i => (i + 1) % this.videos.length);
    setTimeout(() => {
      videoElement.load();
      videoElement.play();
    }, 0);
  }
  
  @ViewChild('heroVideo') heroVideo?: ElementRef<HTMLVideoElement>;

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.checkScreenSize();
      
      // Auto-slide featured images - slower transition
      this.featuredInterval = setInterval(() => {
        this.currentFeaturedIndex.update(i => (i + 1) % this.featuredImages.length);
      }, 5000);
      
      if (this.heroVideo?.nativeElement?.play) {
        this.heroVideo.nativeElement.muted = true;
        this.heroVideo.nativeElement.play().catch((e: any) => console.log('Autoplay prevented:', e));
      }
      
      // Intersection Observer for scroll animations (browser only)
      if (typeof IntersectionObserver !== 'undefined') {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            this.observer?.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
        this.observer?.observe(el);
      });
      }
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.checkScreenSize();
    }
  }

  private checkScreenSize(): void {
    this.isMobile.set(window.innerWidth <= 768);
  }
  
  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.featuredInterval) {
      clearInterval(this.featuredInterval);
    }
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrollY = window.scrollY;
    this.updateFeaturedProgress();
  }

  private updateFeaturedProgress(): void {
    const section = document.querySelector('.featured-section');
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const viewH = window.innerHeight;
    // Start revealing when section enters bottom of viewport,
    // fully revealed when it reaches center.
    const raw = 1 - (rect.top / viewH);
    this.featuredProgress = Math.max(0, Math.min(1, raw));
  }

  /** Optional backup for non-js environments, removing parallax logic for Featured Section */
  getFeaturedTransform(): string {
    return 'none';
  }

  getFeaturedOpacity(): string {
    return '1';
  }

  getTextTransform(): string {
    if (this.isMobile()) return 'translateY(0)';
    // Start way down offscreen (1500px).
    // The user has to scroll significantly before the text even enters the bottom of the screen.
    const offset = Math.max(0, 1500 - this.scrollY * 0.6);
    return `translateY(${offset}px)`;
  }

  getTextOpacity(): string {
    if (this.isMobile()) return '1';
    // Wait until they've scrolled 1000px before starting to fade in
    const activeScroll = Math.max(0, this.scrollY - 1000);
    return `${Math.min(1, activeScroll / 800)}`;
  }

  getOverlayOpacity(): string {
    if (this.isMobile()) return '0.4';
    // Fade in the dark gradient slowly later in the scroll
    const activeScroll = Math.max(0, this.scrollY - 800);
    return `${Math.min(1, activeScroll / 1000)}`;
  }

  readonly fleetCards = [
    {
      image: '/car_card.png',
      custom: true,
      title: 'Sedan & SUV',
      label: 'Cars',
      desc: 'Perfect for family trips and long-distance travel. AC, comfortable seating, and spacious trunks.',
      from: '35',
      badge: 'badge-success',
      accentColor: '#10b981',
      glowColor: '#10b981',
    },
    {
      image: '/moto_card.png',
      custom: true,
      title: 'Sport & Cruiser',
      label: 'Motorcycles',
      desc: 'Navigate Cambodia\'s streets effortlessly. Fuel-efficient, easy to park, thrilling to ride.',
      from: '12',
      badge: 'badge-info',
      accentColor: '#3b82f6',
      glowColor: '#3b82f6',
    },
    {
      image: '/bike_card.png',
      custom: true,
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
      desc: 'Pay through ABA PayWay QR with encrypted checkout and tracked booking confirmation.',
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
      color: '#064022',
      iconBg: 'rgba(6, 64, 34, 0.06)',
      iconColor: '#064022',
    },
    {
      step: '02',
      icon: 'search',
      title: 'Browse & Choose',
      desc: 'Filter by vehicle type, price, location, and availability. Pick what fits you best.',
      color: '#064022',
      iconBg: 'rgba(6, 64, 34, 0.06)',
      iconColor: '#064022',
    },
    {
      step: '03',
      icon: 'key',
      title: 'Book & Ride',
      desc: 'Confirm your booking, complete payment, and enjoy your ride. It\'s that simple.',
      color: '#064022',
      iconBg: 'rgba(6, 64, 34, 0.06)',
      iconColor: '#064022',
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
