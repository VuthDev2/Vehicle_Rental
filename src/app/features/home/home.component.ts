import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="pt-20">
      <section class="relative flex h-[800px] items-center justify-center overflow-hidden">
        <div class="absolute inset-0 z-0">
          <div
            class="h-full w-full bg-cover bg-center"
            data-alt="A cinematic, high-end photograph of a sleek luxury car and a modern sport motorcycle side by side on a clean, modern city street at dusk. Blue and amber city reflections glinting off the polished surfaces."
            style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuAoTnopjT3cVECNLAuxEZCMTiNI0O_lywByrblVWajZ9Y6eYMVmDNpK1dFh58KlBdnvn83tJswewkNfDgsQfZoe_0_s0zRkXWzMz__Xz0lfNaAqXerBo2aYzRossKsX6tO_CMLnj32f8eb7IlASLXT3x6Q_bWOhHXSHnH2rt4f_Y4yO_29le1T2Oo-TgZ1BL1mL8xuZoRH36qRPTgxLG6OATQVlfS-CIKy5qU-Nj08wy2e78sA17PGZcyzgfQcAId6ja84AMQpCPsI')"
          ></div>
          <div class="absolute inset-0 hero-gradient"></div>
        </div>

        <div class="relative z-10 w-full max-w-container-max px-margin-desktop">
          <div class="mb-8 max-w-3xl">
            <div class="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur-md">
              <span class="material-symbols-outlined text-primary">verified</span>
              Luxury fleet • concierge delivery • flexible pickup
            </div>
            <h1 class="mb-6 font-display-lg text-display-lg-mobile leading-tight text-white md:text-display-lg">
              Premium mobility, <span class="text-primary">made effortless.</span>
            </h1>
            <p class="max-w-2xl text-lg leading-8 text-on-surface-variant opacity-90">
              Reserve executive cars, high-performance motorcycles, and premium e-bikes in minutes with a refined booking experience built for modern travel.
            </p>
          </div>

          <div class="w-full max-w-5xl rounded-[1.75rem] border border-white/10 bg-surface-container-lowest/85 p-3 shadow-[0_25px_70px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div class="flex flex-col items-stretch gap-2 md:flex-row">
              <div class="flex shrink-0 rounded-2xl bg-surface-container-high p-1">
                <button class="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-label-sm text-on-primary shadow-sm transition-all">
                  <span class="material-symbols-outlined text-lg">directions_car</span> Car
                </button>
                <button class="flex items-center gap-2 rounded-xl px-4 py-2 text-label-sm text-on-surface-variant transition-all hover:bg-surface-container-highest hover:text-on-surface">
                  <span class="material-symbols-outlined text-lg">motorcycle</span> Moto
                </button>
                <button class="flex items-center gap-2 rounded-xl px-4 py-2 text-label-sm text-on-surface-variant transition-all hover:bg-surface-container-highest hover:text-on-surface">
                  <span class="material-symbols-outlined text-lg">pedal_bike</span> Bike
                </button>
              </div>

              <div class="flex-1 grid grid-cols-1 divide-y divide-outline-variant/30 md:grid-cols-3 md:divide-x md:divide-y-0">
                <div class="group flex items-center gap-3 p-3">
                  <span class="material-symbols-outlined text-primary">location_on</span>
                  <div class="flex flex-1 flex-col">
                    <span class="text-[10px] font-bold uppercase tracking-widest text-outline">Location</span>
                    <input class="border-none bg-transparent p-0 text-on-surface placeholder:text-outline focus:ring-0" placeholder="City or Airport" type="text" />
                  </div>
                </div>
                <div class="flex items-center gap-3 p-3">
                  <span class="material-symbols-outlined text-primary">calendar_today</span>
                  <div class="flex flex-1 flex-col">
                    <span class="text-[10px] font-bold uppercase tracking-widest text-outline">Pickup</span>
                    <input class="border-none bg-transparent p-0 font-semibold text-on-surface focus:ring-0 [color-scheme:dark]" type="date" />
                  </div>
                </div>
                <div class="flex items-center gap-3 p-3">
                  <span class="material-symbols-outlined text-primary">event_repeat</span>
                  <div class="flex flex-1 flex-col">
                    <span class="text-[10px] font-bold uppercase tracking-widest text-outline">Return</span>
                    <input class="border-none bg-transparent p-0 font-semibold text-on-surface focus:ring-0 [color-scheme:dark]" type="date" />
                  </div>
                </div>
              </div>

              <a class="flex w-full items-center justify-center gap-2 rounded-2xl bg-secondary px-10 py-4 font-bold text-on-secondary shadow-lg shadow-secondary/20 transition-all hover:-translate-y-0.5 hover:brightness-110 md:w-auto" routerLink="/vehicles">
                <span class="material-symbols-outlined transition-transform group-hover:scale-110">search</span>
                Search
              </a>
            </div>
          </div>
        </div>
      </section>

      <section class="mx-auto max-w-container-max px-margin-desktop py-24">
        <div class="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h2 class="mb-2 text-headline-md font-headline-md text-on-surface">Featured Fleet</h2>
            <p class="text-on-surface-variant">Exceptional performance across all categories.</p>
          </div>
          <div class="flex gap-2">
            <a class="flex items-center gap-2 rounded-full border border-outline-variant px-6 py-3 font-bold text-on-surface transition-all hover:border-primary hover:text-primary" routerLink="/vehicles">
              View All <span class="material-symbols-outlined text-sm">arrow_forward</span>
            </a>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-3">
          <div class="group overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-low transition-all duration-300 hover:border-primary/50 vehicle-card-shadow">
            <div class="relative h-64 overflow-hidden">
              <div class="h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuBfz9GkOzxHyRACp7gF16czyQ1lXC6buYVcghFKXT6DVzb3zD0O3HGN5piglqVY7uig-8oxcBAo3RtBulteofYSiisInYSkS-2qq3xdOrgPNwNU8YSYgW0vu-hC40S-XwjqqPI8CRTRhEh9rkQRprl3Kdv_qbyD9SntadoRydH9GGw3_FyNkCY7LZaOz79B9DnnwYsTJFn0249WEBx3wDOFhDoOws9-rSnELMycqROjzyFl3WHLSAtk6CEAzEg-gFUOi4mEr88lXkM')"></div>
              <div class="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-on-primary">Car</div>
              <div class="absolute right-4 top-4 rounded-lg border border-green-500/30 bg-green-500/20 px-3 py-1 text-[12px] font-bold text-green-400 backdrop-blur-md">Available</div>
            </div>
            <div class="p-6">
              <div class="mb-4 flex items-start justify-between">
                <div>
                  <h3 class="font-headline-md text-body-lg font-bold text-white">Executive SUV S-Class</h3>
                  <p class="text-label-sm text-on-surface-variant">Premium All-Wheel Drive</p>
                </div>
                <div class="text-right">
                  <span class="text-headline-md font-bold text-secondary">$185</span>
                  <span class="block text-[12px] text-outline">/day</span>
                </div>
              </div>
              <div class="flex items-center gap-4 border-t border-outline-variant/30 py-4">
                <div class="flex items-center gap-1 text-on-surface-variant">
                  <span class="material-symbols-outlined text-[18px]">airline_seat_recline_extra</span>
                  <span class="text-label-sm">7 Seats</span>
                </div>
                <div class="flex items-center gap-1 text-on-surface-variant">
                  <span class="material-symbols-outlined text-[18px]">settings_input_component</span>
                  <span class="text-label-sm">Auto</span>
                </div>
              </div>
              <a class="block w-full rounded-xl bg-surface-container-high py-4 text-center font-bold text-on-surface transition-all group-hover:bg-primary group-hover:text-on-primary" routerLink="/vehicles">Reserve Now</a>
            </div>
          </div>

          <div class="group overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-low transition-all duration-300 hover:border-primary/50 vehicle-card-shadow">
            <div class="relative h-64 overflow-hidden">
              <div class="h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuA1vJ76zegQrDwhwKw8E7d0xx8rpMVY3GkkhShB8XiquZ3eCLJfPhCBQNpdWTYGib7-j-nd39Ptx_mf39rpg6qh7ilEEzmelPxeQxl4OKctwGPCfhuunOgMxMpYmQDaM6358GXgQyaHeNQkIu4GfpvzEA_aOAAdVjEJcKdLMzypDhtUtMVgJXh7YOCVdUxftvfVDRwAkMyOXVN8plYhXZ_i_G5CVNjlbVfx0JDqzkLZ2X-3QWy1SBVsWOB4PTK8AZv8ZuHvUgA4GrE')"></div>
              <div class="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-on-primary">Motorcycle</div>
              <div class="absolute right-4 top-4 rounded-lg border border-green-500/30 bg-green-500/20 px-3 py-1 text-[12px] font-bold text-green-400 backdrop-blur-md">Available</div>
            </div>
            <div class="p-6">
              <div class="mb-4 flex items-start justify-between">
                <div>
                  <h3 class="font-headline-md text-body-lg font-bold text-white">RR-1000 Carbon Sport</h3>
                  <p class="text-label-sm text-on-surface-variant">Track Performance Edition</p>
                </div>
                <div class="text-right">
                  <span class="text-headline-md font-bold text-secondary">$120</span>
                  <span class="block text-[12px] text-outline">/day</span>
                </div>
              </div>
              <div class="flex items-center gap-4 border-t border-outline-variant/30 py-4">
                <div class="flex items-center gap-1 text-on-surface-variant">
                  <span class="material-symbols-outlined text-[18px]">speed</span>
                  <span class="text-label-sm">1000cc</span>
                </div>
                <div class="flex items-center gap-1 text-on-surface-variant">
                  <span class="material-symbols-outlined text-[18px]">moped</span>
                  <span class="text-label-sm">Sport</span>
                </div>
              </div>
              <a class="block w-full rounded-xl bg-surface-container-high py-4 text-center font-bold text-on-surface transition-all group-hover:bg-primary group-hover:text-on-primary" routerLink="/vehicles">Reserve Now</a>
            </div>
          </div>

          <div class="group overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-low transition-all duration-300 hover:border-primary/50 vehicle-card-shadow">
            <div class="relative h-64 overflow-hidden">
              <div class="h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuAEhDhLk2Zu-GekIV-BaHPHuyqYfR2OM-pvRZF8NHDAMo3bqWOfgn9nP-wramTY3g2x-4vvNg_P1iSSzymbSz3QK70pSmEmclAhOOaHnsAky9xv8NLtxYTDc152lxRqMB9gJV-eWRiNsC5ldjf93zSWVBuzU5QkH80Hhb8DP70gLIDpDm-Qj3bL2UIszCRC6TIXMS4mcVhWh3I7Ccsk6YscwRRnbEiG1cfvJPzPxGogeDtEZRoCTCJik_4BPrA_dAheuU4je45RwpI')"></div>
              <div class="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-on-primary">E-Bike</div>
              <div class="absolute right-4 top-4 rounded-lg border border-amber-500/30 bg-amber-500/20 px-3 py-1 text-[12px] font-bold text-amber-400 backdrop-blur-md">Limited</div>
            </div>
            <div class="p-6">
              <div class="mb-4 flex items-start justify-between">
                <div>
                  <h3 class="font-headline-md text-body-lg font-bold text-white">Peak Hunter V3 E-MTB</h3>
                  <p class="text-label-sm text-on-surface-variant">Long Range Premium Assist</p>
                </div>
                <div class="text-right">
                  <span class="text-headline-md font-bold text-secondary">$65</span>
                  <span class="block text-[12px] text-outline">/day</span>
                </div>
              </div>
              <div class="flex items-center gap-4 border-t border-outline-variant/30 py-4">
                <div class="flex items-center gap-1 text-on-surface-variant">
                  <span class="material-symbols-outlined text-[18px]">bolt</span>
                  <span class="text-label-sm">900Wh</span>
                </div>
                <div class="flex items-center gap-1 text-on-surface-variant">
                  <span class="material-symbols-outlined text-[18px]">terrain</span>
                  <span class="text-label-sm">Off-road</span>
                </div>
              </div>
              <a class="block w-full rounded-xl bg-surface-container-high py-4 text-center font-bold text-on-surface transition-all group-hover:bg-primary group-hover:text-on-primary" routerLink="/vehicles">Reserve Now</a>
            </div>
          </div>
        </div>
      </section>

      <section class="border-y border-outline-variant/30 bg-surface-container-lowest py-24">
        <div class="mx-auto max-w-container-max px-margin-desktop">
          <div class="mb-20 text-center">
            <h2 class="mb-4 font-display-lg text-display-lg-mobile text-white md:text-headline-md">How it Works</h2>
            <p class="mx-auto max-w-xl text-on-surface-variant">Seamless premium mobility in three simple steps.</p>
          </div>
          <div class="relative grid grid-cols-1 gap-12 md:grid-cols-3">
            <div class="group flex flex-col items-center text-center">
              <div class="mb-8 flex h-24 w-24 items-center justify-center rounded-2xl border border-outline-variant/30 bg-surface-container-high text-primary shadow-xl transition-all duration-300 group-hover:bg-primary group-hover:text-on-primary">
                <span class="material-symbols-outlined text-4xl">travel_explore</span>
              </div>
              <h3 class="mb-4 text-xl font-bold text-white">Choose Category</h3>
              <p class="px-4 text-on-surface-variant">Select from our elite fleet of luxury cars, sport motorcycles, or premium e-bikes.</p>
            </div>
            <div class="group flex flex-col items-center text-center">
              <div class="mb-8 flex h-24 w-24 items-center justify-center rounded-2xl border border-outline-variant/30 bg-surface-container-high text-primary shadow-xl transition-all duration-300 group-hover:bg-primary group-hover:text-on-primary">
                <span class="material-symbols-outlined text-4xl">touch_app</span>
              </div>
              <h3 class="mb-4 text-xl font-bold text-white">One-Tap Booking</h3>
              <p class="px-4 text-on-surface-variant">Secure your ride instantly with our verified booking and payment system.</p>
            </div>
            <div class="group flex flex-col items-center text-center">
              <div class="mb-8 flex h-24 w-24 items-center justify-center rounded-2xl border border-outline-variant/30 bg-surface-container-high text-primary shadow-xl transition-all duration-300 group-hover:bg-primary group-hover:text-on-primary">
                <span class="material-symbols-outlined text-4xl">key</span>
              </div>
              <h3 class="mb-4 text-xl font-bold text-white">Collect &amp; Drive</h3>
              <p class="px-4 text-on-surface-variant">Pickup at our premium hubs or have your vehicle delivered to your doorstep.</p>
            </div>
          </div>
        </div>
      </section>

      <section class="mx-auto max-w-container-max px-margin-desktop py-24">
        <div class="grid h-auto grid-cols-1 gap-6 md:h-[600px] md:grid-cols-6 md:grid-rows-2">
          <div class="group relative flex flex-col justify-end overflow-hidden rounded-[2rem] border border-outline-variant/30 bg-surface-container-low p-12 md:col-span-3 md:row-span-2">
            <div class="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuAl_U8IVZ-FHSviWE7xj7Xu2Dk2wz40lywtpfH09i6yTPai-RR0xMcfWlobw8Jedkj94FgKcoXsyNSzVIQ2wQ7fQdq3mpfOjVLmiSjCIvVP5c0m9QLVYl2w3O5edbm_VntuurGa6FbdyiznyR300_o_HjSBqQqZUC3W_gA95J2f0hBJcsl040jXK_slqvN8xcKgG63r-YDHN8EFQdACmKAaDmMxJiEIJOJB6Jrxn56F4hNK0gSsA-LbLFYlZfF6S6WsrDvdt1Whig0')"></div>
            <div class="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent"></div>
            <div class="relative z-10">
              <h3 class="mb-4 font-headline-md text-white">Unmatched Standards</h3>
              <p class="max-w-sm text-on-surface-variant">Every vehicle in our multi-category fleet is meticulously maintained to the highest safety and performance specs.</p>
            </div>
          </div>
          <div class="relative flex flex-col justify-center overflow-hidden rounded-[2rem] bg-primary p-10 text-on-primary md:col-span-3">
            <div class="relative z-10">
              <span class="material-symbols-outlined mb-6 text-5xl">verified</span>
              <h3 class="mb-2 font-headline-md">Verified Performance</h3>
              <p class="opacity-80">120-point diagnostic check for every car, motorcycle, and e-bike before departure. Safety is our heritage.</p>
            </div>
            <div class="absolute -bottom-10 -right-10 scale-150 opacity-10">
              <span class="material-symbols-outlined text-[200px]">shield</span>
            </div>
          </div>
          <div class="flex flex-col items-center justify-center rounded-[2rem] border border-outline-variant/30 bg-surface-container-high p-8 text-center md:col-span-1.5">
            <span class="mb-1 text-4xl font-bold text-primary">24/7</span>
            <p class="text-label-sm font-bold uppercase tracking-widest text-on-surface">Concierge</p>
          </div>
          <div class="flex flex-col items-center justify-center rounded-[2rem] border border-outline-variant/30 bg-surface-container-high p-8 text-center md:col-span-1.5">
            <span class="mb-1 text-4xl font-bold text-secondary">100+</span>
            <p class="text-label-sm font-bold uppercase tracking-widest text-on-surface">Hub Locations</p>
          </div>
        </div>
      </section>

      <footer class="mx-auto mb-16 flex max-w-container-max flex-col gap-6 rounded-[2rem] border border-outline-variant/30 bg-surface-container-low px-8 py-8 text-on-surface-variant md:flex-row md:items-center md:justify-between">
        <div>
          <h3 class="text-lg font-semibold text-white">Ready for a premium trip?</h3>
          <p>Browse the fleet, reserve in minutes, and enjoy concierge-level service from pickup to return.</p>
        </div>
        <a class="rounded-full bg-primary px-6 py-3 font-semibold text-on-primary" routerLink="/vehicles">Explore vehicles</a>
      </footer>
    </main>
  `,
})
export class HomeComponent {}
