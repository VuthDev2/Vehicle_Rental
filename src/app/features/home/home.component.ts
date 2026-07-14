import { Component, signal, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main>

      <!-- ====================== HERO ====================== -->
      <section class="relative min-h-screen flex items-center overflow-hidden">
        <!-- Parallax Background Image -->
        <div class="absolute inset-0 z-0"
             [style.transform]="'translateY(' + scrollY * 0.4 + 'px)'">
          <img
            src="/hero_vehicles.png"
            alt="Cambo Rent - Cars, Motos and Bikes in Cambodia"
            class="w-full h-full object-cover object-center"
          />
          <div class="absolute inset-0 hero-gradient"></div>
          <div class="absolute inset-0 bg-gradient-to-t from-[#0a0f1e] via-transparent to-[rgba(10,15,30,0.4)]"></div>
        </div>

        <!-- Hero Content -->
        <div class="relative z-10 section-container py-24 w-full">
          <div class="max-w-2xl animate-fade-in-up">
            <!-- Pill badge -->
            <div class="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-6 text-sm font-semibold text-on-surface-variant">
              <span class="w-2 h-2 rounded-full bg-primary animate-pulse-glow inline-block"></span>
              Trusted by thousands in Cambodia
            </div>

            <h1 class="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight text-white mb-6">
              Explore Cambodia
              <br />
              <span class="gradient-text">Your Way.</span>
            </h1>

            <p class="text-lg text-on-surface-variant leading-relaxed mb-10 max-w-xl">
              Premium rental of <strong class="text-on-surface">Cars</strong>,
              <strong class="text-on-surface">Motorcycles</strong>, and
              <strong class="text-on-surface">Bikes</strong> — wherever you want to go,
              whenever you need to go, across all of Cambodia.
            </p>

            <div class="flex flex-wrap gap-4">
              <a routerLink="/login" class="btn-primary text-base px-8 py-4 rounded-xl shadow-2xl shadow-primary/25">
                <span class="material-symbols-outlined">login</span>
                Get Started
              </a>
              <a routerLink="/register" class="btn-secondary text-base px-8 py-4 rounded-xl">
                <span class="material-symbols-outlined">person_add</span>
                Create Account
              </a>
            </div>

            <!-- Mini Stats -->
            <div class="flex flex-wrap gap-8 mt-12 pt-8 border-t border-white/10">
              @for (stat of heroStats; track stat.label) {
                <div class="group">
                  <div class="text-3xl sm:text-4xl font-black text-white group-hover:scale-105 transition-transform duration-300">{{ stat.value }}</div>
                  <div class="text-sm text-on-surface-variant mt-0.5">{{ stat.label }}</div>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Scroll indicator -->
        <div class="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-on-surface-variant text-xs animate-bounce"
             [style.opacity]="scrollY > 100 ? 0 : 1"
             [style.transition]="'opacity 0.4s'">
          <span class="text-[10px] font-bold uppercase tracking-widest">Scroll</span>
          <span class="material-symbols-outlined text-xl">keyboard_arrow_down</span>
        </div>
      </section>

      <!-- ====================== OUR SERVICES ====================== -->
      <section class="py-24 bg-surface">
        <div class="section-container">
          <div class="text-center mb-16">
            <span class="badge badge-success mb-4">Our Fleet</span>
            <h2 class="text-4xl sm:text-5xl font-black text-white mb-4">
              Three Ways to Travel
            </h2>
            <p class="text-on-surface-variant text-lg max-w-xl mx-auto">
              Choose the perfect vehicle for your journey. We maintain every vehicle to the highest standards.
            </p>
          </div>

          <!-- Vehicle Category Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">

            @for (card of fleetCards; track card.title) {
              <div class="group relative rounded-3xl overflow-hidden h-96 cursor-pointer shadow-2xl shadow-black/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10">
                <img [src]="card.img" [alt]="card.title" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent"></div>
                <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                     [style.background]="'linear-gradient(135deg, ' + card.glowColor + '15, transparent)'"></div>
                <div class="absolute bottom-0 left-0 right-0 p-8 z-10">
                  <div class="flex items-center gap-2 mb-3">
                    <span [class]="'badge ' + card.badge">{{ card.label }}</span>
                    <span class="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">From \${{ card.from }}/day</span>
                  </div>
                  <h3 class="text-2xl font-bold text-white mb-2">{{ card.title }}</h3>
                  <p class="text-on-surface-variant text-sm mb-4">{{ card.desc }}</p>
                  <div class="flex items-center gap-2 font-semibold text-sm transition-all duration-300 group-hover:gap-4"
                       [style.color]="card.accentColor">
                    <span>Sign in to Browse</span>
                    <span class="material-symbols-outlined text-lg transition-transform duration-300 group-hover:translate-x-1">arrow_forward</span>
                  </div>
                </div>
              </div>
            }

          </div>
        </div>
      </section>

      <!-- ====================== FEATURES / SERVICES ====================== -->
      <section class="py-24 bg-background">
        <div class="section-container">
          <div class="text-center mb-16">
            <span class="badge badge-info mb-4">Why Cambo Rent</span>
            <h2 class="text-4xl sm:text-5xl font-black text-white mb-4">
              Everything You Need
            </h2>
            <p class="text-on-surface-variant text-lg max-w-xl mx-auto">
              We handle all the details so you can focus on enjoying your journey.
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (feature of features; track feature.title) {
              <div class="card p-6 group">
                <div class="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300"
                     [style.background]="feature.iconBg">
                  <span class="material-symbols-outlined text-2xl" [style.color]="feature.iconColor">{{ feature.icon }}</span>
                </div>
                <h3 class="text-lg font-bold text-white mb-2">{{ feature.title }}</h3>
                <p class="text-on-surface-variant text-sm leading-relaxed">{{ feature.desc }}</p>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- ====================== HOW IT WORKS ====================== -->
      <section class="py-24 bg-surface">
        <div class="section-container">
          <div class="text-center mb-16">
            <span class="badge badge-neutral mb-4">Simple Process</span>
            <h2 class="text-4xl sm:text-5xl font-black text-white mb-4">
              Rent in 3 Easy Steps
            </h2>
            <p class="text-on-surface-variant text-lg max-w-xl mx-auto">
              Get on the road in minutes. No paperwork, no hassle.
            </p>
          </div>

          <div class="relative grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Connecting line (desktop only) -->
            <div class="absolute top-10 left-[calc(16.67%+28px)] right-[calc(16.67%+28px)] h-px bg-gradient-to-r from-primary via-secondary to-primary hidden md:block opacity-30"></div>

            @for (step of steps; track step.step) {
              <div class="flex flex-col items-center text-center group">
                <div class="relative mb-6">
                  <div class="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black border border-outline-variant/40 bg-surface-container-low transition-all duration-300 group-hover:border-primary/50 group-hover:bg-surface-container"
                       [style.color]="step.color">
                    {{ step.step }}
                  </div>
                </div>
                <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                     [style.background]="step.iconBg">
                  <span class="material-symbols-outlined text-xl" [style.color]="step.iconColor">{{ step.icon }}</span>
                </div>
                <h3 class="text-xl font-bold text-white mb-3">{{ step.title }}</h3>
                <p class="text-on-surface-variant text-sm leading-relaxed max-w-xs">{{ step.desc }}</p>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- ====================== PRICING PREVIEW ====================== -->
      <section class="py-24 bg-background">
        <div class="section-container">
          <div class="text-center mb-16">
            <span class="badge badge-success mb-4">Pricing</span>
            <h2 class="text-4xl sm:text-5xl font-black text-white mb-4">
              Transparent Pricing
            </h2>
            <p class="text-on-surface-variant text-lg max-w-xl mx-auto">
              No hidden fees. No surprises. Just great rental prices.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            @for (price of pricing; track price.category) {
              <div class="relative rounded-3xl p-8 border transition-all duration-300 hover:-translate-y-1"
                   [style.border-color]="price.borderColor"
                   [style.background]="price.bg">
                <div class="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                     [style.background]="price.iconBg">
                  <span class="material-symbols-outlined text-3xl" [style.color]="price.iconColor">{{ price.icon }}</span>
                </div>
                <h3 class="text-xl font-bold text-white mb-1">{{ price.category }}</h3>
                <p class="text-on-surface-variant text-sm mb-6">{{ price.desc }}</p>
                <div class="flex items-baseline gap-1 mb-6">
                  <span class="text-4xl font-black" [style.color]="price.iconColor">{{ price.from }}</span>
                  <span class="text-on-surface-variant text-sm">/day</span>
                </div>
                <ul class="flex flex-col gap-2">
                  @for (feat of price.features; track feat) {
                    <li class="flex items-center gap-2 text-sm text-on-surface-variant">
                      <span class="material-symbols-outlined text-base" [style.color]="price.iconColor">check_circle</span>
                      {{ feat }}
                    </li>
                  }
                </ul>
              </div>
            }
          </div>

          <div class="text-center">
            <p class="text-on-surface-variant text-sm mb-6">Sign up to see full pricing and availability</p>
            <a routerLink="/register" class="btn-primary px-10 py-4 text-base">
              <span class="material-symbols-outlined">person_add</span>
              Create Free Account
            </a>
          </div>
        </div>
      </section>

      <!-- ====================== TESTIMONIALS ====================== -->
      <section class="py-24 bg-surface">
        <div class="section-container">
          <div class="text-center mb-16">
            <span class="badge badge-warning mb-4">Testimonials</span>
            <h2 class="text-4xl sm:text-5xl font-black text-white mb-4">
              Happy Customers
            </h2>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            @for (review of testimonials; track review.name) {
              <div class="glass rounded-2xl p-6">
                <!-- Stars -->
                <div class="flex gap-1 mb-4">
                  @for (s of [1,2,3,4,5]; track s) {
                    <span class="material-symbols-outlined text-amber-400 text-base">star</span>
                  }
                </div>
                <p class="text-on-surface-variant text-sm leading-relaxed mb-6 italic">"{{ review.text }}"</p>
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                       [style.background]="review.avatarBg">
                    {{ review.name.charAt(0) }}
                  </div>
                  <div>
                    <p class="text-white font-semibold text-sm">{{ review.name }}</p>
                    <p class="text-on-surface-variant text-xs">{{ review.location }}</p>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- ====================== CTA SECTION ====================== -->
      <section class="py-24 bg-background">
        <div class="section-container">
          <div class="relative rounded-3xl overflow-hidden p-12 md:p-20 text-center"
               style="background: linear-gradient(135deg, rgba(16,185,129,0.15), rgba(59,130,246,0.15)); border: 1px solid rgba(16,185,129,0.2);">
            <!-- Background glow -->
            <div class="absolute inset-0 overflow-hidden">
              <div class="absolute top-1/2 left-1/4 w-64 h-64 rounded-full opacity-20 blur-3xl"
                   style="background: #10b981;"></div>
              <div class="absolute top-1/2 right-1/4 w-64 h-64 rounded-full opacity-20 blur-3xl"
                   style="background: #3b82f6;"></div>
            </div>
            <div class="relative z-10">
              <h2 class="text-4xl sm:text-5xl font-black text-white mb-4">Ready to Explore?</h2>
              <p class="text-on-surface-variant text-lg mb-10 max-w-lg mx-auto">
                Create your free account and start browsing our fleet of cars, motorcycles, and bikes today.
              </p>
              <div class="flex flex-wrap justify-center gap-4">
                <a routerLink="/register" class="btn-primary px-10 py-4 text-base">
                  <span class="material-symbols-outlined">rocket_launch</span>
                  Sign Up — It's Free
                </a>
                <a routerLink="/login" class="btn-secondary px-10 py-4 text-base">
                  <span class="material-symbols-outlined">login</span>
                  Already have an account?
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  `,
  styles: [`
    :host { display: block; }
    .text-on-surface-variant { color: #94a3b8; }
    .text-on-surface { color: #f1f5f9; }
    .text-primary { color: #10b981; }
    .text-secondary { color: #3b82f6; }
    .bg-surface { background: #0e1527; }
    .bg-background { background: #0a0f1e; }
    .bg-surface-container-low { background: #1a2236; }
    .bg-surface-container { background: #1e2a40; }
    .border-outline-variant\\/40 { border-color: rgba(51,65,85,0.4); }
    .text-amber-400 { color: #fbbf24; }
  `]
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
