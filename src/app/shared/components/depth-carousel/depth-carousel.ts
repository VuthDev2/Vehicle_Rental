import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  ViewChildren,
  QueryList,
  AfterViewInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  PLATFORM_ID,
  Inject,
  NgZone
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import gsap from 'gsap';

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

export interface CarouselItem {
  image: string;
  alt?: string;
  custom?: boolean;
  label?: string;
  title?: string;
  desc?: string;
  from?: string;
  accentColor?: string;
}

@Component({
  selector: 'app-depth-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './depth-carousel.html',
  styleUrl: './depth-carousel.css'
})
export class DepthCarouselComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input() items: (CarouselItem | string)[] = [];
  @Input() cardWidth = 300;
  @Input() cardHeight = 380;
  @Input() radius = 18;
  @Input() tint = '#05060a';
  @Input() depth = 220;
  @Input() spread = 90;
  @Input() tilt = 22;
  @Input() tiltDirection: 'left' | 'right' = 'right';
  @Input() perspective = 1400;
  @Input() visibleCards = 4;
  @Input() falloff = 0.2;
  @Input() blur = 6;
  @Input() duration = 700;
  @Input() ease = 'power3.out';
  @Input() autoplay = false;
  @Input() autoplayDelay = 3200;
  @Input() loop = true;
  @Input() showControls = true;
  @Input() showIndicators = true;
  @Input() className = '';

  @Output() indexChange = new EventEmitter<{ index: number; item: CarouselItem }>();

  data: CarouselItem[] = [];
  active = 0;

  @ViewChild('root') rootRef!: ElementRef<HTMLElement>;
  @ViewChild('stage') stageRef!: ElementRef<HTMLElement>;
  @ViewChildren('card') cardRefs!: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('overlay') overlayRefs!: QueryList<ElementRef<HTMLElement>>;

  private pos = 0;
  private focus = 0;
  private tween: gsap.core.Tween | null = null;
  private scale = 1;

  private drag: any = null;
  private wheelTimer: any = null;
  private autoTimer: any = null;
  private reduced = false;
  private ro: ResizeObserver | null = null;
  private hovered = false;
  private focused = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items']) {
      this.data = (this.items || []).map(it => 
        typeof it === 'string' ? { image: it, alt: '' } : it
      );
      if (this.rootRef) {
        this.layout(this.pos);
      }
    }
    if (changes['autoplay'] || changes['autoplayDelay']) {
      if (this.rootRef) this.setupAutoplay();
    }
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.ro = new ResizeObserver(entries => {
      const w = entries[0].contentRect.width;
      const needed = this.cardWidth + Math.abs(this.spread) * 2 + 120;
      this.scale = clamp(w / needed, 0.4, 1);
      this.layout(this.pos);
    });
    this.ro.observe(this.rootRef.nativeElement);

    const el = this.rootRef.nativeElement;
    el.addEventListener('wheel', this.onWheel.bind(this), { passive: false });

    el.addEventListener('mouseenter', () => (this.hovered = true));
    el.addEventListener('mouseleave', () => (this.hovered = false));
    el.addEventListener('focusin', () => (this.focused = true));
    el.addEventListener('focusout', () => (this.focused = false));

    this.setupAutoplay();
    // Layout initial frame
    setTimeout(() => this.layout(this.pos), 0);
  }

  ngOnDestroy(): void {
    if (this.ro && this.rootRef) {
      this.ro.disconnect();
    }
    const el = this.rootRef?.nativeElement;
    if (el) {
      el.removeEventListener('wheel', this.onWheel.bind(this));
    }
    if (this.tween) this.tween.kill();
    if (this.wheelTimer) clearTimeout(this.wheelTimer);
    this.stopAutoplay();
  }

  layout(pos: number) {
    const n = this.data.length;
    if (!n) return;
    const dir = this.tiltDirection === 'left' ? -1 : 1;
    const sc = this.scale;

    const cards = this.cardRefs.toArray();
    const overlays = this.overlayRefs.toArray();

    for (let i = 0; i < n; i++) {
      const el = cards[i]?.nativeElement;
      if (!el) continue;

      let d = i - pos;
      if (this.loop && n > 1) {
        d = ((d % n) + n) % n;
        if (d > n / 2) d -= n;
      }

      const back = Math.max(0, d);
      const az = Math.abs(d);
      const shown = az <= this.visibleCards + 0.5;

      const tz = -this.depth * d;
      const tx = dir * this.spread * d;
      const ry = dir * this.tilt * clamp(d, 0, 1);

      let opacity = d < 0 ? Math.max(0, 1 + d) : 1;
      if (!shown) opacity = 0;

      const brightness = Math.max(0.15, 1 - back * this.falloff);
      const blurPx = this.blur > 0 ? Math.min(this.blur, (back / Math.max(1, this.visibleCards)) * this.blur) : 0;
      const zi = Math.round(2000 - d * 20);

      el.style.transform = `translate(-50%, -50%) scale(${sc}) translateX(${tx.toFixed(2)}px) translateZ(${tz.toFixed(2)}px) rotateY(${ry.toFixed(3)}deg)`;
      el.style.opacity = opacity.toFixed(3);
      el.style.filter = `brightness(${brightness.toFixed(3)}) blur(${blurPx.toFixed(2)}px)`;
      el.style.zIndex = String(zi);
      el.style.pointerEvents = shown && opacity > 0.05 ? 'auto' : 'none';

      const ov = overlays[i]?.nativeElement;
      if (ov) ov.style.opacity = clamp(back * this.falloff * 1.25, 0, 0.86).toFixed(3);
    }
  }

  notify(idx: number) {
    this.ngZone.run(() => {
      this.active = idx;
      this.indexChange.emit({ index: idx, item: this.data[idx] });
    });
  }

  tweenTo(target: number, animate: boolean) {
    if (this.tween) this.tween.kill();
    const proxy = { p: this.pos };
    const dur = animate && !this.reduced ? this.duration / 1000 : 0;
    
    this.tween = gsap.to(proxy, {
      p: target,
      duration: dur,
      ease: this.ease,
      onUpdate: () => {
        this.pos = proxy.p;
        this.layout(proxy.p);
      },
      onComplete: () => {
        const n = this.data.length;
        if (n > 0) this.pos = ((this.pos % n) + n) % n;
        this.layout(this.pos);
      }
    });
  }

  setFocus(rawIndex: number, animate = true) {
    const n = this.data.length;
    if (!n) return;
    const idx = this.loop ? ((rawIndex % n) + n) % n : clamp(rawIndex, 0, n - 1);
    let delta = idx - this.pos;
    if (this.loop && n > 1) {
      delta = ((delta % n) + n) % n;
      if (delta > n / 2) delta -= n;
    }
    this.tweenTo(this.pos + delta, animate);
    if (idx !== this.focus) {
      this.focus = idx;
      this.notify(idx);
    }
  }

  navigateBy(step: number) {
    this.setFocus(this.focus + step, true);
  }

  onWheel(e: WheelEvent) {
    if (this.data.length < 2) return;
    e.preventDefault();
    if (this.tween) this.tween.kill();
    const raw = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    const delta = e.deltaMode === 1 ? raw * 24 : raw;
    const step = clamp(delta / (this.cardWidth * 0.9), -0.6, 0.6);
    this.pos += step;
    this.layout(this.pos);
    if (this.wheelTimer) clearTimeout(this.wheelTimer);
    this.wheelTimer = setTimeout(() => this.setFocus(Math.round(this.pos), true), 130);
  }

  onPointerDown(e: PointerEvent) {
    if (this.data.length < 2) return;
    if (this.tween) this.tween.kill();
    this.drag = {
      x: e.clientX,
      startPos: this.pos,
      lastX: e.clientX,
      lastT: performance.now(),
      v: 0,
      moved: false,
      id: e.pointerId
    };
  }

  onPointerMove(e: PointerEvent) {
    if (!this.drag) return;
    const stepPx = Math.max(this.cardWidth * 0.55 * this.scale, 40);
    const dx = e.clientX - this.drag.x;
    if (!this.drag.moved && Math.abs(dx) > 4) {
      this.drag.moved = true;
      this.rootRef.nativeElement.setPointerCapture(this.drag.id);
    }
    if (!this.drag.moved) return;
    const now = performance.now();
    const dt = Math.max(now - this.drag.lastT, 1);
    this.drag.v = (e.clientX - this.drag.lastX) / dt;
    this.drag.lastX = e.clientX;
    this.drag.lastT = now;
    this.pos = this.drag.startPos - dx / stepPx;
    this.layout(this.pos);
  }

  onPointerEnd() {
    if (!this.drag) return;
    const drag = this.drag;
    this.drag = null;
    if (!drag.moved) return;
    const stepPx = Math.max(this.cardWidth * 0.55 * this.scale, 40);
    const projected = this.pos - (drag.v * 180) / stepPx;
    this.setFocus(Math.round(projected), true);
  }

  onKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      this.navigateBy(-1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      this.navigateBy(1);
    }
  }

  onCardClick(index: number) {
    if (this.drag?.moved) return;
    this.setFocus(index, true);
  }

  private stopAutoplay() {
    if (this.autoTimer) {
      clearInterval(this.autoTimer);
      this.autoTimer = null;
    }
  }

  private setupAutoplay() {
    this.stopAutoplay();
    if (!this.autoplay || this.reduced || this.data.length < 2) return;
    this.autoTimer = setInterval(() => {
      if (!this.hovered && !this.focused) {
        this.navigateBy(1);
      }
    }, Math.max(this.autoplayDelay, 600));
  }
}
