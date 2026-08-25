html_content = """<div class="flex min-h-screen bg-slate-50/50">
  <!-- ============ MOBILE OVERLAY ============ -->
  @if (sidebarOpen()) {
  <div class="fixed inset-0 z-30 lg:hidden" style="background: rgba(0, 0, 0, 0.5)" (click)="sidebarOpen.set(false)">
  </div>
  }

  <aside class="customer-sidebar fixed left-0 top-0 z-40 flex h-full flex-col transition-all duration-300 ease-in-out"
    [class.-translate-x-full]="!sidebarOpen()" [class.lg:translate-x-0]="true">
    <!-- Logo -->
    <div class="sidebar-logo"
      style="padding: 24px 20px 28px; border-bottom: 1px solid rgba(255, 255, 255, 0.14); flex-shrink: 0">
      <div class="sb-row flex items-center gap-3">
        <div class="logo-icon-wrapper flex-shrink-0">
          <img src="/logo.jpg" alt="Cambo Rent" class="logo-img" onerror="
              this.style.display = 'none';
              this.nextElementSibling.style.display = 'flex';
            " />
          <div class="logo-fallback" style="display: none">
            <span class="material-symbols-outlined" style="font-size: 24px; color: #ffffff">directions_car</span>
          </div>
        </div>
        <div class="sb-label overflow-hidden whitespace-nowrap transition-all duration-300">
          <h1 style="font-size: 18px; font-weight: 700; color: #ffffff; margin: 0; line-height: 1.2">
            Cambo Rent
          </h1>
          <p
            style="font-size: 11px; font-weight: 600; color: rgba(255, 255, 255, 0.6); margin: 0; letter-spacing: 0.5px; text-transform: uppercase">
            Customer
          </p>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 flex flex-col gap-0.5 overflow-y-auto overflow-x-hidden" style="padding: 12px 10px">
      @for (item of navItems; track item.path) {
      <a [routerLink]="item.path" routerLinkActive="active" #rla="routerLinkActive" (click)="sidebarOpen.set(false)"
        class="sb-row sb-nav-item flex items-center gap-3 rounded-lg text-sm font-semibold transition-all duration-150"
        [class.active]="rla.isActive" [title]="item.label"
        [style.color]="rla.isActive ? '#FFFFFF' : '#FFFFFF'"
        [style.background]="rla.isActive ? 'rgba(255,255,255,0.16)' : 'transparent'"
        style="position: relative; padding: 10px 14px"
        onmouseover="
          if (!this.classList.contains('active')) {
            this.style.background = 'rgba(255,255,255,0.09)';
          }
        "
        onmouseout="
          if (!this.classList.contains('active')) {
            this.style.background = 'transparent';
          }
        ">
        @if (rla.isActive) {
        <span style="position: absolute; left: 0; top: 4px; bottom: 4px; width: 3px; border-radius: 0 3px 3px 0; background: #e2f3af;"></span>
        }
        <span class="material-symbols-outlined flex-shrink-0" style="font-size: 20px; color: #ffffff">{{ item.icon
          }}</span>
        <span class="sb-label overflow-hidden whitespace-nowrap transition-all duration-300"
          style="letter-spacing: 0.2px">{{ item.label }}</span>
      </a>
      }
    </nav>

    <!-- Logout -->
    <div style="border-top: 1px solid rgba(255, 255, 255, 0.14); padding: 12px 10px; flex-shrink: 0">
      <button type="button" (click)="confirmLogout()"
        class="sb-row sb-nav-item w-full flex items-center gap-3 rounded-lg text-sm font-semibold transition-all duration-150"
        title="Sign out" style="color: #ffffff; padding: 10px 14px"
        onmouseover="this.style.background = 'rgba(255,255,255,0.09)'"
        onmouseout="this.style.background = 'transparent'">
        <span class="material-symbols-outlined flex-shrink-0" style="font-size: 20px">logout</span>
        <span class="sb-label overflow-hidden whitespace-nowrap transition-all duration-300">Logout</span>
      </button>
    </div>
  </aside>

  <!-- ============ MAIN CONTENT ============ -->
  <div class="customer-main flex-1 flex flex-col min-h-screen transition-all duration-300" style="min-width: 0">
    <!-- Email verification banner -->
    @if (showVerifyBanner()) {
    <div class="flex items-center gap-3 px-4 md:px-8 py-3 text-sm" style="
          background: rgba(245, 158, 11, 0.1);
          border-bottom: 1px solid rgba(245, 158, 11, 0.25);
          color: #fbbf24;
        ">
      <span class="material-symbols-outlined text-xl" style="color: #fbbf24">mark_email_unread</span>
      <p class="flex-1 leading-snug">
        Please verify your email address to unlock the full Cambo Rent experience.
      </p>
      <a routerLink="/verify-email" [queryParams]="{ email: auth.user()?.email }"
        class="font-bold whitespace-nowrap underline underline-offset-2 transition-opacity hover:opacity-80"
        style="color: #fbbf24">
        Verify now
      </a>
      <button type="button" (click)="dismissVerifyBanner()" aria-label="Dismiss email verification reminder"
        class="rounded-lg p-1 opacity-70 transition-opacity hover:opacity-100">
        <span class="material-symbols-outlined text-lg">close</span>
      </button>
    </div>
    }

    <!-- ============ TOP HEADER ============ -->
    <header
      class="flex items-center justify-between px-4 sm:px-6 md:px-12 lg:px-8 h-[64px] sm:h-[72px] sticky top-0 z-30 transition-all duration-300 bg-[#064022] lg:bg-white lg:border-b lg:border-gray-100">

      <!-- Left: Logo (Mobile Only) -->
      <div class="flex items-center gap-3 sm:gap-4 lg:hidden">
        <button type="button" (click)="toggleSidebar()" class="hidden text-white hover:opacity-80 p-1">
          <span class="material-symbols-outlined text-[24px]">menu</span>
        </button>
        <div class="w-9 h-9 bg-white rounded-[10px] flex items-center justify-center p-1">
          <img src="/logo.jpg" alt="Cambo Rent" class="w-full h-full object-contain" />
        </div>
        <span class="font-medium text-white text-[16px] tracking-tight">Cambo Rent</span>
      </div>


      <!-- Center: Search Bar (Desktop Only) -->
      <div class="hidden lg:flex flex-1 max-w-2xl items-center mr-auto ml-4">
        <div class="relative w-full">
          <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" style="font-size: 20px;">search</span>
          <input type="text" (input)="onGlobalSearch($event)" placeholder="Search vehicles, locations, or bookings..." class="w-full bg-gray-50 border border-gray-200 text-gray-800 text-[0.95rem] font-medium rounded-full focus:ring-2 focus:ring-[#10b981] focus:border-transparent block pl-12 pr-20 py-2.5 transition-all outline-none shadow-sm">
          <div class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-[10px] text-gray-400 font-bold">
            <span class="px-1.5 py-0.5 rounded border border-gray-200 bg-white shadow-sm">⌘</span>
            <span class="px-1.5 py-0.5 rounded border border-gray-200 bg-white shadow-sm">K</span>
          </div>
        </div>
      </div>

      <!-- Right: Actions -->
      <div class="flex items-center justify-end gap-3 sm:gap-5 text-white lg:text-gray-600">
        <!-- Search Icon (Mobile Only) -->
        <button type="button" class="lg:hidden text-white hover:opacity-80 transition-opacity flex items-center justify-center w-8 h-8">
          <span class="material-symbols-outlined text-[22px]">search</span>
        </button>

        <!-- Vertical Divider (Desktop Only) -->
        <div class="w-px h-6 bg-gray-200 hidden lg:block"></div>

        <!-- Dark Mode Toggle (Mobile Only) -->
        <button type="button" class="lg:hidden text-white hover:opacity-80 transition-opacity flex items-center justify-center w-8 h-8 border border-white/20 rounded-full">
          <span class="material-symbols-outlined text-[18px]">dark_mode</span>
        </button>

        <!-- Notifications -->
        <button type="button" class="text-white lg:text-gray-500 hover:opacity-80 transition-opacity flex items-center justify-center relative w-8 h-8 sm:w-10 sm:h-10">
          <span class="material-symbols-outlined text-[22px] sm:text-[24px]">notifications</span>
          <span class="absolute top-0 right-0 sm:top-1 sm:right-1 w-[14px] h-[14px] sm:w-[16px] sm:h-[16px] bg-[#f97316] rounded-full text-[9px] sm:text-[10px] font-bold flex items-center justify-center text-white border border-white lg:border-transparent">2</span>
        </button>

        <!-- Profile -->
        @if (auth.user(); as user) {
        <button type="button" (click)="profileMenuOpen.set(!profileMenuOpen())" class="flex items-center gap-2 sm:gap-2.5 hover:opacity-85 transition-opacity pl-1 sm:pl-2">
          <span class="w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-[11px] sm:text-[14px] font-medium text-white border border-white/30 lg:border-transparent bg-[#064022] flex-shrink-0 shadow-sm">
            {{ user.name?.charAt(0)?.toUpperCase() || 'H' }}
          </span>
          <span class="hidden lg:block font-medium text-[14.5px] text-gray-700">{{ userName }}</span>
          <span class="hidden lg:block material-symbols-outlined text-gray-400" style="font-size: 18px;">expand_more</span>
        </button>
        }
      </div>
    </header>

    <!-- Page Content -->
    <main class="flex-1 overflow-auto w-full flex flex-col">
      <router-outlet />
      <!-- Spacer for mobile bottom nav -->
      <div class="h-28 lg:hidden flex-shrink-0 w-full"></div>
    </main>
  </div>

  <!-- ============ PROFILE DROPDOWN ============ -->
  @if (profileMenuOpen()) {
  <div class="fixed inset-0 z-40" (click)="profileMenuOpen.set(false)"></div>
  <div
    class="fixed top-16 right-4 md:right-8 z-50 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden">
    @if (auth.user(); as user) {
    <div class="flex items-center gap-3 px-4 py-4 border-b border-slate-100">
      <span class="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
        style="background: #0B3D20">
        {{ user.name?.charAt(0)?.toUpperCase() || 'U' }}
      </span>
      <div class="min-w-0">
        <p class="text-sm font-semibold text-slate-800 truncate">{{ user.name }}</p>
        <p class="text-xs text-slate-500 truncate">{{ user.email }}</p>
      </div>
    </div>
    }
    <div class="px-2 pb-2 mt-2">
      <a routerLink="/customer/profile"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors"
        (click)="profileMenuOpen.set(false)">
        <span class="material-symbols-outlined" style="font-size: 18px">manage_accounts</span>
        My Profile
      </a>
      <a routerLink="/customer/bookings"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors"
        (click)="profileMenuOpen.set(false)">
        <span class="material-symbols-outlined" style="font-size: 18px">receipt_long</span>
        My Bookings
      </a>
      <button type="button" (click)="profileMenuOpen.set(false); confirmLogout()"
        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors mt-1">
        <span class="material-symbols-outlined" style="font-size: 18px">logout</span>
        Log out
      </button>
    </div>
  </div>
  }
</div>
"""

css_content = """:host {
  display: block;
  min-height: 100vh;
  background: var(--color-bg-deep);
  color: var(--color-on-surface);
}

/* ===== Matcha sidebar ===== */
.customer-sidebar {
  background: #0B3D20;
  width: 256px;
}

/* ===== Logo styling ===== */
.logo-icon-wrapper {
  position: relative;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  flex-shrink: 0;
  overflow: hidden;
}

.logo-img {
  width: 100%;
  height: 100%;
  border-radius: 10px;
  object-fit: cover;
}

.logo-fallback {
  width: 100%;
  height: 100%;
  border-radius: 10px;
  align-items: center;
  justify-content: center;
  background: #7ba05b;
}

/* Larger icons and text as requested */
.customer-sidebar .material-symbols-outlined {
  font-size: 26px !important;
}
.customer-sidebar .sb-label {
  font-size: 16px !important;
  font-weight: 600;
  letter-spacing: 0.3px;
}

/* Desktop: a slim icon rail that expands to full width on hover. */
@media (min-width: 1024px) {
  .customer-sidebar {
    width: 80px;
    overflow-x: hidden;
    transition: width 0.25s ease;
  }
  .customer-sidebar:hover {
    width: 256px;
  }
  /* Labels collapse to zero width while collapsed (so they don't overflow the
     rail or push icons off-centre) and expand back in on hover. */
  .customer-sidebar .sb-label {
    opacity: 0;
    max-width: 0;
    overflow: hidden;
    transition: opacity 0.18s ease, max-width 0.25s ease;
    white-space: nowrap;
    pointer-events: none;
  }
  .customer-sidebar:hover .sb-label {
    opacity: 1;
    max-width: 200px;
    pointer-events: auto;
  }
  /* Centre icons in the collapsed rail; left-align them when expanded. */
  .customer-sidebar .sb-row {
    justify-content: center;
  }
  .customer-sidebar:hover .sb-row {
    justify-content: flex-start;
  }
}

/* Active nav item — keep the icon/text readable on the matcha background. */
a.active,
a.active .material-symbols-outlined {
  color: #ffffff !important;
}

/* When the sidebar expands on hover, push the page content to the right instead
   of letting the (fixed) sidebar overlay it. The base offset is `pl-20` (80px);
   on hover it grows to the full 256px rail width. */
.customer-main {
  transition: padding-left 0.25s ease;
  background: #fdfdfc;
}
.customer-main > header {
  min-height: 64px;
  height: 64px;
}
@media (min-width: 1024px) {
  .customer-sidebar:hover ~ .customer-main {
    padding-left: 256px;
  }
  .customer-main {
    padding-left: 80px;
  }
}

/* ============================================================
   MOBILE OVERRIDES
   ============================================================ */
@media (max-width: 1023px) {
  .customer-main {
    padding-left: 0 !important;
  }

  .customer-sidebar {
    width: min(100%, 18rem);
    height: 100vh;
    height: 100dvh;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
  }
}
"""

with open('src/app/layouts/customer-layout/customer-layout.component.html', 'w') as f:
    f.write(html_content)

with open('src/app/layouts/customer-layout/customer-layout.component.css', 'w') as f:
    f.write(css_content)

print("Restored layout!")
