import { Component, Input, ViewChild, ElementRef, AfterViewInit, OnDestroy, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { isPlatformBrowser, NgIf } from '@angular/common';

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp((x - edge0) / (edge1 - edge0 || 1e-6), 0, 1);
  return t * t * (3 - 2 * t);
};

@Component({
  selector: 'app-scroll-expand',
  standalone: true,
  imports: [NgIf],
  templateUrl: './scroll-expand.component.html',
  styleUrl: './scroll-expand.component.css'
})
export class ScrollExpandComponent implements AfterViewInit, OnDestroy {
  @Input() title = '';
  @Input() scrollHint = '';
  @Input() startWidth = 42;
  @Input() startHeight = 58;
  @Input() startRadius = 24;
  @Input() endRadius = 0;
  @Input() mediaZoom = 1.35;
  @Input() scrollDistance = 1.2;
  @Input() holdDistance = 0.35;
  @Input() smoothing = 0.1;
  @Input() overlayScrim = 0.45;
  @Input() useWindowScroll = true;
  @Input() enabled = true;

  @ViewChild('root') rootRef!: ElementRef<HTMLDivElement>;
  @ViewChild('track') trackRef!: ElementRef<HTMLDivElement>;
  @ViewChild('stage') stageRef!: ElementRef<HTMLDivElement>;
  @ViewChild('frame') frameRef!: ElementRef<HTMLDivElement>;
  @ViewChild('mediaWrapper') mediaRef!: ElementRef<HTMLDivElement>;
  @ViewChild('overlay') overlayRef?: ElementRef<HTMLDivElement>;
  @ViewChild('scrim') scrimRef!: ElementRef<HTMLDivElement>;
  @ViewChild('titleEl') titleRef?: ElementRef<HTMLDivElement>;
  @ViewChild('hintEl') hintRef?: ElementRef<HTMLDivElement>;

  private rafId = 0;
  private current = 0;
  private target = 0;
  private stageH = 0;
  private running = false;
  private resizeObserver?: ResizeObserver;
  private scroller?: HTMLElement | Window;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private ngZone: NgZone) {}

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    
    // Run outside Angular zone to avoid triggering change detection on every scroll/frame
    this.ngZone.runOutsideAngular(() => {
      this.initEffect();
    });
  }

  private applyProgress(p: number) {
    const frame = this.frameRef?.nativeElement;
    const media = this.mediaRef?.nativeElement;
    if (!frame || !media) return;

    const e = smoothstep(0, 1, p);
    const w = this.startWidth + (100 - this.startWidth) * e;
    const h = this.startHeight + (100 - this.startHeight) * e;
    const ix = Math.max(0, (100 - w) / 2);
    const iy = Math.max(0, (100 - h) / 2);
    const r = this.startRadius + (this.endRadius - this.startRadius) * e;
    
    frame.style.clipPath = `inset(${iy}% ${ix}% ${iy}% ${ix}% round ${r}px)`;
    media.style.transform = `scale(${this.mediaZoom + (1 - this.mediaZoom) * e})`;

    if (this.scrimRef?.nativeElement) {
      this.scrimRef.nativeElement.style.opacity = `${this.overlayScrim * e}`;
    }

    if (this.titleRef?.nativeElement) {
      const out = smoothstep(0.4, 0.88, p);
      this.titleRef.nativeElement.style.opacity = `${1 - out}`;
      this.titleRef.nativeElement.style.transform = `translate3d(0, ${-28 * out}px, 0) scale(${1 + 0.06 * out})`;
    }

    if (this.hintRef?.nativeElement) {
      const gone = smoothstep(0, 0.12, p);
      this.hintRef.nativeElement.style.opacity = `${1 - gone}`;
      this.hintRef.nativeElement.style.transform = `translate3d(0, ${8 * gone}px, 0)`;
    }

    if (this.overlayRef?.nativeElement) {
      // Fade OUT the hero content as you scroll down
      const out = smoothstep(0.1, 0.7, p);
      this.overlayRef.nativeElement.style.opacity = `${1 - out}`;
      this.overlayRef.nativeElement.style.transform = `translate3d(0, ${-20 * out}px, 0)`;
    }
  }

  private measure() {
    const root = this.rootRef?.nativeElement;
    const stage = this.stageRef?.nativeElement;
    const track = this.trackRef?.nativeElement;
    if (!root || !stage || !track) return;

    this.stageH = this.useWindowScroll ? window.innerHeight : root.clientHeight;
    if (this.stageH <= 0) return;
    
    stage.style.height = `${this.stageH}px`;
    track.style.height = `${this.stageH * (1 + Math.max(0, this.scrollDistance) + Math.max(0, this.holdDistance))}px`;

    const w = root.clientWidth || this.stageH;
    stage.style.setProperty('--se-title-size', `${clamp(w * 0.075, 20, 84)}px`);
  }

  private readProgress() {
    if (!this.enabled) return 1;
    const span = this.stageH * Math.max(0.01, this.scrollDistance);
    if (this.useWindowScroll) {
      const track = this.trackRef.nativeElement;
      const top = track.getBoundingClientRect().top;
      return clamp(-top / span, 0, 1);
    }
    const root = this.rootRef.nativeElement;
    return clamp(root.scrollTop / span, 0, 1);
  }

  private tick = () => {
    const k = this.smoothing <= 0 ? 1 : 1 - Math.exp(-1 / (60 * this.smoothing));
    this.current += (this.target - this.current) * k;
    
    if (Math.abs(this.target - this.current) < 0.0004) {
      this.current = this.target;
      this.running = false;
    }
    
    this.applyProgress(this.current);
    this.rafId = this.running ? requestAnimationFrame(this.tick) : 0;
  };

  private kick() {
    if (this.running) return;
    this.running = true;
    if (!this.rafId) this.rafId = requestAnimationFrame(this.tick);
  }

  private onScroll = () => {
    this.target = this.readProgress();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (this.smoothing <= 0 || reduceMotion) {
      this.current = this.target;
      this.applyProgress(this.current);
      return;
    }
    this.kick();
  };

  private onResize = () => {
    this.measure();
    this.target = this.readProgress();
    this.current = this.target;
    this.applyProgress(this.current);
  };

  private initEffect() {
    const root = this.rootRef?.nativeElement;
    if (!root) return;

    this.measure();
    this.target = this.readProgress();
    this.current = this.target;
    this.applyProgress(this.current);

    this.scroller = this.useWindowScroll ? window : root;
    this.scroller.addEventListener('scroll', this.onScroll, { passive: true });
    window.addEventListener('resize', this.onResize);
    
    this.resizeObserver = new ResizeObserver(this.onResize);
    this.resizeObserver.observe(root);
  }

  ngOnDestroy() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.scroller) this.scroller.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onResize);
    if (this.resizeObserver) this.resizeObserver.disconnect();
  }
}
