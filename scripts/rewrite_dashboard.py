import re

html_content = """<!-- ================= MAIN DASHBOARD ================= -->
<main class="main-content">

  <!-- ================= HERO SECTION ================= -->
  <section class="hero-section">
    <div class="hero-content max-w-7xl mx-auto w-full">
      <div class="hero-text-col">
        <h1 class="hero-greeting">
          Good morning,<br>
          <span class="hero-name">{{ firstName }}</span>
        </h1>
        <p class="hero-subtitle">
          Find the perfect vehicle for your journey.
        </p>
      </div>

      <!-- Hero Visual -->
      <div class="hero-visual">
        <img src="/hero_perfect_fleet.png" alt="Cambo Rent Fleet" class="hero-banner-img" />
      </div>
    </div>
    
    <!-- ================= HERO SEARCH CARD ================= -->
    <div class="hero-search-card-wrapper max-w-7xl mx-auto w-full">
      <div class="hero-search-card">
        <div class="search-card-header">
          <div class="search-icon-circle">
            <span class="material-symbols-outlined">search</span>
          </div>
          <div class="search-header-text">
            <h3>Find Your Ride</h3>
            <p>Book a car, bike or moto in just a few steps.</p>
          </div>
        </div>
        <div class="search-card-fields">
          <!-- Pick-up Location -->
          <div class="search-field">
            <span class="material-symbols-outlined icon">location_on</span>
            <div class="field-text">
              <span class="label">Pick-up Location</span>
              <div class="value-row">
                <span class="value">Phnom Penh</span>
                <span class="material-symbols-outlined chevron">expand_more</span>
              </div>
            </div>
          </div>
          <!-- Pick-up Date -->
          <div class="search-field">
            <div class="field-text">
              <span class="label">Pick-up Date</span>
              <span class="value">Aug 22, 2026</span>
            </div>
            <span class="material-symbols-outlined icon">calendar_month</span>
          </div>
          <!-- Return Date -->
          <div class="search-field">
            <div class="field-text">
              <span class="label">Return Date</span>
              <span class="value">Aug 25, 2026</span>
            </div>
            <span class="material-symbols-outlined icon">calendar_month</span>
          </div>
          <!-- Action -->
          <a routerLink="/customer/explore" class="search-action-btn">
            <span>Search Vehicles</span>
            <span class="material-symbols-outlined">chevron_right</span>
          </a>
        </div>
      </div>
    </div>
  </section>

  <!-- ================= BROWSE BY TYPE ================= -->
  <section class="section-container max-w-7xl mx-auto w-full mt-10">
    <div class="section-top-bar">
      <h2 class="section-heading">Browse by Type</h2>
      <a routerLink="/customer/explore" class="section-link">
        <span>View all</span>
        <span class="material-symbols-outlined">chevron_right</span>
      </a>
    </div>

    <div class="category-cards-grid">
      <!-- Cars -->
      <a routerLink="/customer/explore" [queryParams]="{ type: 'Sedan' }" class="type-card">
        <div class="type-card-header">
          <div class="type-icon-badge">
            <span class="material-symbols-outlined">directions_car</span>
          </div>
          <div class="type-text-group">
            <h3>Cars</h3>
            <p>{{ categoryCountLabel('Sedan') || '24 Vehicles' }}</p>
          </div>
        </div>
        <div class="type-card-img-wrap">
          <img src="/camry.jpg" alt="Cars" />
        </div>
      </a>
      
      <!-- Motos -->
      <a routerLink="/customer/explore" [queryParams]="{ type: 'Scooter' }" class="type-card">
        <div class="type-card-header">
          <div class="type-icon-badge">
            <span class="material-symbols-outlined">two_wheeler</span>
          </div>
          <div class="type-text-group">
            <h3>Motorbikes</h3>
            <p>{{ categoryCountLabel('Scooter') || '18 Vehicles' }}</p>
          </div>
        </div>
        <div class="type-card-img-wrap">
          <img src="/click.jpg" alt="Motorbikes" />
        </div>
      </a>

      <!-- Bicycles -->
      <a routerLink="/customer/explore" [queryParams]="{ type: 'Bicycle' }" class="type-card">
        <div class="type-card-header">
          <div class="type-icon-badge">
            <span class="material-symbols-outlined">pedal_bike</span>
          </div>
          <div class="type-text-group">
            <h3>Motos</h3>
            <p>{{ categoryCountLabel('Bicycle') || '15 Vehicles' }}</p>
          </div>
        </div>
        <div class="type-card-img-wrap">
          <img src="/scoopy.jpg" alt="Motos" />
        </div>
      </a>
    </div>
  </section>

  <!-- ================= FEATURED VEHICLES ================= -->
  <section class="section-container max-w-7xl mx-auto w-full mt-8">
    <div class="section-top-bar">
      <h2 class="section-heading">Featured Vehicles</h2>
      <a routerLink="/customer/explore" class="section-link">
        <span>View all</span>
        <span class="material-symbols-outlined">chevron_right</span>
      </a>
    </div>

    <div class="featured-cards-grid">
      <!-- Card 1: Toyota Camry -->
      <article class="vehicle-featured-card">
        <div class="vcard-top-badges">
          <span class="vcard-badge popular">Popular</span>
          <button type="button" class="vcard-fav-btn" aria-label="Favorite">
            <span class="material-symbols-outlined">favorite_border</span>
          </button>
        </div>
        <div class="vcard-img-box">
          <img src="/camry.jpg" alt="Toyota Camry" />
        </div>
        <div class="vcard-body">
          <h3 class="vcard-title">Toyota Camry</h3>
          <div class="vcard-specs">
            <span><span class="material-symbols-outlined">settings</span>Automatic</span>
            <span class="spec-dot">•</span>
            <span><span class="material-symbols-outlined">person</span>5 Seats</span>
            <span class="spec-dot">•</span>
            <span><span class="material-symbols-outlined">local_gas_station</span>Petrol</span>
          </div>
          <div class="vcard-footer">
            <div class="vcard-price">
              <strong>$35</strong>
              <span>/ day</span>
            </div>
            <a routerLink="/customer/explore" class="vcard-btn">
              <span>View Details</span>
              <span class="material-symbols-outlined">chevron_right</span>
            </a>
          </div>
        </div>
      </article>

      <!-- Card 2: Honda Click 125i -->
      <article class="vehicle-featured-card">
        <div class="vcard-top-badges">
          <span class="vcard-badge popular">Popular</span>
          <button type="button" class="vcard-fav-btn" aria-label="Favorite">
            <span class="material-symbols-outlined">favorite_border</span>
          </button>
        </div>
        <div class="vcard-img-box">
          <img src="/click.jpg" alt="Honda Click 125i" />
        </div>
        <div class="vcard-body">
          <h3 class="vcard-title">Honda Click 125i</h3>
          <div class="vcard-specs">
            <span><span class="material-symbols-outlined">settings</span>Automatic</span>
            <span class="spec-dot">•</span>
            <span><span class="material-symbols-outlined">person</span>2 Seats</span>
            <span class="spec-dot">•</span>
            <span><span class="material-symbols-outlined">local_gas_station</span>Petrol</span>
          </div>
          <div class="vcard-footer">
            <div class="vcard-price">
              <strong>$12</strong>
              <span>/ day</span>
            </div>
            <a routerLink="/customer/explore" class="vcard-btn">
              <span>View Details</span>
              <span class="material-symbols-outlined">chevron_right</span>
            </a>
          </div>
        </div>
      </article>

      <!-- Card 3: Honda Scoopy -->
      <article class="vehicle-featured-card">
        <div class="vcard-top-badges">
          <span class="vcard-badge new">New</span>
          <button type="button" class="vcard-fav-btn" aria-label="Favorite">
            <span class="material-symbols-outlined">favorite_border</span>
          </button>
        </div>
        <div class="vcard-img-box">
          <img src="/scoopy.jpg" alt="Honda Scoopy" />
        </div>
        <div class="vcard-body">
          <h3 class="vcard-title">Honda Scoopy</h3>
          <div class="vcard-specs">
            <span><span class="material-symbols-outlined">settings</span>Automatic</span>
            <span class="spec-dot">•</span>
            <span><span class="material-symbols-outlined">person</span>2 Seats</span>
            <span class="spec-dot">•</span>
            <span><span class="material-symbols-outlined">local_gas_station</span>Petrol</span>
          </div>
          <div class="vcard-footer">
            <div class="vcard-price">
              <strong>$8</strong>
              <span>/ day</span>
            </div>
            <a routerLink="/customer/explore" class="vcard-btn">
              <span>View Details</span>
              <span class="material-symbols-outlined">chevron_right</span>
            </a>
          </div>
        </div>
      </article>
    </div>
  </section>

  <!-- ================= STATISTICS BAR ================= -->
  <section class="section-container max-w-7xl mx-auto w-full mt-8">
    <div class="stats-strip-card">
      <!-- Item 1: Vehicles In Fleet -->
      <div class="stat-strip-item">
        <div class="stat-circle-icon green">
          <span class="material-symbols-outlined">directions_car</span>
        </div>
        <div class="stat-text-box">
          <strong>45</strong>
          <span>Vehicles<br>In Fleet</span>
        </div>
      </div>

      <!-- Divider -->
      <div class="stat-divider"></div>

      <!-- Item 2: Available Now -->
      <div class="stat-strip-item">
        <div class="stat-circle-icon green-outline">
          <span class="material-symbols-outlined">check_circle</span>
        </div>
        <div class="stat-text-box">
          <strong>32</strong>
          <span>Available<br>Now</span>
        </div>
      </div>

      <!-- Divider -->
      <div class="stat-divider"></div>

      <!-- Item 3: Currently Booked -->
      <div class="stat-strip-item">
        <div class="stat-circle-icon blue">
          <span class="material-symbols-outlined">calendar_month</span>
        </div>
        <div class="stat-text-box">
          <strong>8</strong>
          <span>Currently<br>Booked</span>
        </div>
      </div>

      <!-- Divider -->
      <div class="stat-divider"></div>

      <!-- Item 4: Your Bookings -->
      <div class="stat-strip-item">
        <div class="stat-circle-icon orange">
          <span class="material-symbols-outlined">assignment</span>
        </div>
        <div class="stat-text-box">
          <strong>3</strong>
          <span>Your<br>Bookings</span>
        </div>
      </div>
    </div>
  </section>

  <!-- ================= UPCOMING BOOKING & PROMOTION GRID ================= -->
  <section class="section-container bottom-deals-section max-w-7xl mx-auto w-full mt-8 mb-12">
    <div class="bottom-deals-grid">

      <!-- 1. Upcoming Booking Card -->
      <article class="deal-card upcoming-card">
        <div class="deal-card-header">
          <h2>Upcoming Booking</h2>
        </div>

        <div class="upcoming-booking-body">
          <div class="upcoming-thumb-wrap">
            <img src="/camry.jpg" alt="Toyota Camry" />
          </div>
          <div class="upcoming-details-wrap">
            <div class="upcoming-title-row">
              <strong>Toyota Camry</strong>
              <span class="status-pill confirmed">Confirmed</span>
            </div>
            <p class="upcoming-meta">
              <span class="material-symbols-outlined">calendar_month</span>
              Aug 22, 2026 - Aug 25, 2026
            </p>
            <p class="upcoming-meta">
              <span class="material-symbols-outlined">location_on</span>
              Phnom Penh
            </p>
          </div>
        </div>

        <div class="upcoming-card-footer">
          <span class="upcoming-total-price">Total: $105.00</span>
          <a routerLink="/customer/bookings" class="vcard-btn outline">
            <span>View Booking</span>
            <span class="material-symbols-outlined">chevron_right</span>
          </a>
        </div>
      </article>

      <!-- 2. Weekend Special Promotion Card -->
      <article class="deal-card promo-offer-card">
        <!-- Angkor watermark + Discount Tag watermark -->
        <div class="promo-bg-watermark"></div>
        <div class="promo-discount-tag">
          <span>%</span>
        </div>

        <div class="promo-content-left">
          <span class="promo-badge-tag">Weekend Special</span>
          <h2 class="promo-discount-title">10% OFF</h2>
          <p class="promo-desc">For all cars, bikes and motos<br>on weekend rentals.</p>
          <a routerLink="/customer/explore" class="promo-action-btn">
            <span>Explore Now</span>
            <span class="material-symbols-outlined">chevron_right</span>
          </a>
        </div>

        <!-- 3-Vehicles Cutout Visual on bottom right -->
        <div class="promo-vehicles-visual">
          <img class="promo-composite-image" src="/car_card_transparent.png" alt="Promo Vehicles" />
        </div>
      </article>

    </div>
  </section>
</main>
"""

with open('src/app/features/user/dashboard/dashboard.component.html', 'w') as f:
    f.write(html_content)

print("HTML rewritten.")
