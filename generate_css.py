import re

css = """/* ============================================================
   DASHBOARD — Dark premium design
   ============================================================ */

:host {
  display: block;
  width: 100%;
}

/* Shimmer skeleton loader */
.shimmer-box {
  border-radius: 10px;
  background: linear-gradient(
    90deg,
    var(--color-surface-deep-raised) 25%,
    var(--color-edge-deep) 50%,
    var(--color-surface-deep-raised) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Rental status pills */
.rental-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.rental-status-pill.pending   { background: rgba(245,158,11,0.12); color: #f59e0b; border: 1px solid rgba(245,158,11,0.25); }
.rental-status-pill.confirmed { background: rgba(59,130,246,0.12);  color: #3b82f6; border: 1px solid rgba(59,130,246,0.25); }
.rental-status-pill.completed { background: rgba(16,185,129,0.12);  color: #10b981; border: 1px solid rgba(16,185,129,0.25); }
.rental-status-pill.cancelled { background: rgba(239,68,68,0.12);   color: #ef4444; border: 1px solid rgba(239,68,68,0.25); }

.status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
  display: inline-block;
}

.status-dot.warning { background: #f59e0b; }
.status-dot.info    { background: #3b82f6; }
.status-dot.success { background: #10b981; }
.status-dot.danger  { background: #ef4444; }

/* ============================================================
   HERO SECTION
   ============================================================ */
.hero-section {
  position: relative;
  background: linear-gradient(180deg, #f8faf9 0%, #ffffff 100%);
  padding-bottom: 60px;
}
.hero-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,100 L50,60 L100,100 L150,50 L200,100 L250,70 L300,100 L350,40 L400,100 L450,80 L500,100 L1000,100 L1000,200 L0,200 Z' fill='%23eef5ee' opacity='0.5' transform='scale(3) translate(0, 50)'/%3E%3C/svg%3E");
  background-size: cover;
  background-position: bottom;
  background-repeat: no-repeat;
  z-index: 0;
}

@media (min-width: 1024px) {
  .hero-section {
    padding: 24px 32px 60px;
  }
}

.hero-content {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 20px 24px;
  gap: 40px;
}

.hero-text-col {
  width: 100%;
  max-width: 500px;
}

.hero-greeting {
  font-size: 32px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.15;
  margin: 0;
  letter-spacing: -0.02em;
}

.hero-name {
  color: #064022;
  font-size: 36px;
}

.hero-subtitle {
  font-size: 16px;
  font-weight: 500;
  color: #64748b;
  margin: 16px 0 0;
}

.hero-visual {
  display: none;
}

@media (min-width: 768px) {
  .hero-visual {
    display: block;
    width: 380px;
  }
  .hero-greeting { font-size: 40px; }
  .hero-name { font-size: 44px; }
}

@media (min-width: 1024px) {
  .hero-visual {
    width: 500px;
  }
}

.hero-banner-img {
  width: 100%;
  height: auto;
  object-fit: contain;
  mix-blend-mode: multiply;
}

/* ============================================================
   HERO SEARCH CARD
   ============================================================ */
.hero-search-card-wrapper {
  position: relative;
  z-index: 10;
  padding: 0 20px;
  margin-top: 0px;
}

.hero-search-card {
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
  padding: 24px;
  border: 1px solid #f1f5f9;
}

.search-card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.search-icon-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #eef5ee;
  color: #064022;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-icon-circle .material-symbols-outlined {
  font-size: 24px;
}

.search-header-text h3 {
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 4px;
}

.search-header-text p {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.search-card-fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (min-width: 768px) {
  .search-card-fields {
    flex-direction: row;
    align-items: center;
  }
}

.search-field {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  flex: 1;
}

.search-field .icon {
  color: #94a3b8;
  font-size: 20px;
}

.search-field .field-text {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.search-field .label {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  margin-bottom: 4px;
  text-transform: uppercase;
}

.search-field .value {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
}

.value-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.value-row .chevron {
  color: #94a3b8;
  font-size: 20px;
}

.search-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 56px;
  background: #064022;
  color: #ffffff;
  border-radius: 12px;
  font-weight: 700;
  font-size: 16px;
  padding: 0 32px;
  text-decoration: none;
  transition: background-color 0.2s;
}

.search-action-btn:hover {
  background: #10b981;
}


/* ============================================================
   SECTIONS GENERAL
   ============================================================ */
.section-container {
  padding: 0 20px;
}

.section-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-heading {
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.01em;
}

.section-link {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  text-decoration: none;
  transition: opacity 0.15s ease;
}

.section-link:hover {
  opacity: 0.8;
}

.section-link .material-symbols-outlined {
  font-size: 18px;
}

/* ============================================================
   BROWSE BY TYPE CARDS
   ============================================================ */
.category-cards-grid {
  display: flex;
  overflow-x: auto;
  gap: 16px;
  padding: 4px 0 20px;
  scroll-snap-type: x mandatory;
}
.category-cards-grid::-webkit-scrollbar {
  display: none;
}

@media (min-width: 768px) {
  .category-cards-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    overflow-x: visible;
  }
}

.type-card {
  background: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  padding: 24px;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  text-decoration: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
  transition: all 0.3s ease;
  flex: 0 0 220px;
  scroll-snap-align: center;
}

.type-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.06);
  border-color: #e2e8f0;
}

.type-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.type-icon-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #eef5ee;
  color: #064022;
}

.type-icon-badge .material-symbols-outlined {
  font-size: 24px;
}

.type-text-group h3 {
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.type-text-group p {
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  margin: 0;
}

.type-card-img-wrap {
  width: 100%;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 16px;
  transition: transform 0.3s ease;
}

.type-card:hover .type-card-img-wrap {
  transform: scale(1.05);
}

.type-card-img-wrap img {
  max-width: 90%;
  max-height: 100%;
  object-fit: contain;
  mix-blend-mode: multiply;
}

/* ============================================================
   FEATURED VEHICLES CARDS
   ============================================================ */
.featured-cards-grid {
  display: flex;
  overflow-x: auto;
  gap: 16px;
  padding: 4px 0 20px;
  scroll-snap-type: x mandatory;
}
.featured-cards-grid::-webkit-scrollbar {
  display: none;
}

@media (min-width: 768px) {
  .featured-cards-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    overflow-x: visible;
  }
}

.vehicle-featured-card {
  position: relative;
  background: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 20px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
  transition: all 0.3s ease;
  flex: 0 0 300px;
  scroll-snap-align: center;
}

.vehicle-featured-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.06);
  border-color: #e2e8f0;
}

.vcard-top-badges {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.vcard-badge {
  font-size: 11px;
  font-weight: 800;
  color: #064022;
  background: #eef5ee;
  padding: 6px 12px;
  border-radius: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.vcard-badge.new {
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.vcard-fav-btn {
  background: #f8fafc;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.vcard-fav-btn:hover {
  background: #f1f5f9;
  color: #ef4444;
}

.vcard-img-box {
  width: 100%;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20px 0;
}

.vcard-img-box img {
  max-width: 90%;
  max-height: 100%;
  object-fit: contain;
  mix-blend-mode: multiply;
  transition: transform 0.3s ease;
}

.vehicle-featured-card:hover .vcard-img-box img {
  transform: scale(1.05);
}

.vcard-title {
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 12px;
}

.vcard-specs {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  margin: 0 0 24px;
}

.vcard-specs span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.spec-dot {
  color: #cbd5e1;
  font-size: 14px;
}

.vcard-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  border-top: 1px solid #f1f5f9;
  padding-top: 20px;
}

.vcard-price {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.vcard-price strong {
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
}

.vcard-price span {
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
}

.vcard-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 10px 16px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  text-decoration: none;
  transition: all 0.2s ease;
}

.vcard-btn:hover {
  background: #f8fafc;
}

/* ============================================================
   STATISTICS STRIP BAR
   ============================================================ */
.stats-strip-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  gap: 16px;
}

.stat-strip-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-circle-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-circle-icon.green {
  background: #eef5ee;
  color: #064022;
}
.stat-circle-icon.green-outline {
  border: 2px solid #10b981;
  color: #10b981;
}
.stat-circle-icon.blue {
  background: #eef8ff;
  color: #0284c7;
}
.stat-circle-icon.orange {
  background: #fffbf0;
  color: #f59e0b;
}

.stat-text-box strong {
  display: block;
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.1;
}

.stat-text-box span {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  margin-top: 4px;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: #e2e8f0;
}

/* ============================================================
   UPCOMING BOOKING & PROMOTION GRID
   ============================================================ */
.bottom-deals-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}
@media (min-width: 768px) {
  .bottom-deals-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.deal-card {
  background: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
}

.deal-card-header h2 {
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 20px;
}

.upcoming-booking-body {
  display: flex;
  align-items: center;
  gap: 20px;
}

.upcoming-thumb-wrap {
  width: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upcoming-thumb-wrap img {
  max-width: 100%;
  max-height: 60px;
  object-fit: contain;
  mix-blend-mode: darken;
}

.upcoming-details-wrap {
  flex: 1;
}

.upcoming-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.upcoming-title-row strong {
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
}

.status-pill.confirmed {
  font-size: 10px;
  font-weight: 700;
  color: #064022;
  background: #eef5ee;
  padding: 4px 10px;
  border-radius: 999px;
}

.upcoming-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  margin: 0 0 6px;
}

.upcoming-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;
}

.upcoming-total-price {
  font-size: 16px;
  font-weight: 800;
  color: #064022;
}

.vcard-btn.outline {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  padding: 8px 16px;
  border-radius: 9999px;
  text-decoration: none;
}

/* Promo Card */
.promo-offer-card {
  position: relative;
  background: linear-gradient(135deg, #f0f7f2 0%, #e2efe6 100%);
  border: 1px solid #d7e8dc;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.promo-bg-watermark {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background: url('/angkor_skyline.png') no-repeat right bottom / cover;
  opacity: 0.15;
  mix-blend-mode: multiply;
  z-index: 0;
}

.promo-discount-tag {
  position: absolute;
  top: 0;
  right: 0;
  width: 60px;
  height: 70px;
  background: #337a4e;
  border-radius: 0 20px 0 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 28px;
  font-weight: 900;
  z-index: 1;
}

.promo-content-left {
  position: relative;
  z-index: 2;
  max-width: 60%;
}

.promo-badge-tag {
  font-size: 12px;
  font-weight: 800;
  color: #0d5f35;
  margin-bottom: 8px;
  display: block;
}

.promo-discount-title {
  font-size: 36px;
  font-weight: 900;
  color: #064022;
  line-height: 1.1;
  margin: 0 0 12px;
}

.promo-desc {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
  line-height: 1.5;
  margin: 0 0 20px;
}

.promo-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
  background: #064022;
  padding: 12px 24px;
  border-radius: 9999px;
  text-decoration: none;
}

.promo-vehicles-visual {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 55%;
  height: 100%;
  z-index: 1;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
}

.promo-composite-image {
  max-width: 140px;
  max-height: 90%;
  object-fit: contain;
}

/* ============================================================
   WHY CHOOSE CAMBO RENT
   ============================================================ */
.why-choose-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 16px;
}
@media (min-width: 640px) {
  .why-choose-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}
@media (min-width: 1024px) {
  .why-choose-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
  }
}

.why-feature {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 24px;
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
}

.why-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #eef5ee;
  color: #0B3D20;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.why-icon .material-symbols-outlined {
  font-size: 24px;
}

.why-text h4 {
  font-size: 15px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 6px;
}
.why-text p {
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}
"""

with open('src/app/features/user/dashboard/dashboard.component.css', 'w') as f:
    f.write(css)

print("CSS rewritten.")
