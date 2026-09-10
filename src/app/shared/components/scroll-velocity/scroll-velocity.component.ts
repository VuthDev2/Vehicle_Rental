import { Component, Input, ElementRef, ViewChild, AfterViewInit, OnDestroy, PLATFORM_ID, Inject, NgZone } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';

@Component({
  selector: 'app-scroll-velocity',
  templateUrl: './scroll-velocity.component.html',
  styleUrls: ['./scroll-velocity.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class ScrollVelocityComponent implements AfterViewInit, OnDestroy {
  @Input() text = '';
  @Input() velocity = -100;
  @Input() className = '';
  
  @ViewChild('scroller') scroller!: ElementRef<HTMLDivElement>;

  copies = Array(8).fill(0); // Using 8 copies to ensure enough width for wrapping on large screens

  private baseX = 0;
  private scrollY = 0;
  private prevScrollY = 0;
  private smoothedScrollDelta = 0;
  private direction = 1;
  private rafId: number | null = null;
  private lastTime = 0;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone
  ) {}

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.scrollY = window.scrollY;
      this.prevScrollY = this.scrollY;
      
      window.addEventListener('scroll', this.onScroll, { passive: true });
      
      this.ngZone.runOutsideAngular(() => {
        this.rafId = requestAnimationFrame(this.tick);
      });
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('scroll', this.onScroll);
      if (this.rafId) cancelAnimationFrame(this.rafId);
    }
  }

  private onScroll = () => {
    this.scrollY = window.scrollY;
  }

  private wrap(min: number, max: number, v: number) {
    const range = max - min;
    const mod = (((v - min) % range) + range) % range;
    return mod + min;
  }

  private tick = (time: number) => {
    if (!this.lastTime) this.lastTime = time;
    const delta = Math.min(time - this.lastTime, 50); // cap to 50ms max
    this.lastTime = time;

    const scrollDelta = this.scrollY - this.prevScrollY;
    this.prevScrollY = this.scrollY;

    // Smooth scroll delta
    this.smoothedScrollDelta += (scrollDelta - this.smoothedScrollDelta) * 0.15;
    
    // Map to velocity factor
    const velocityFactor = this.smoothedScrollDelta * 0.008;

    if (velocityFactor < -0.05) {
      this.direction = -1;
    } else if (velocityFactor > 0.05) {
      this.direction = 1;
    }

    let moveBy = this.direction * this.velocity * (delta / 1000);
    moveBy += this.direction * moveBy * Math.abs(velocityFactor) * 2; // exaggerated effect

    this.baseX += moveBy;

    // Apply wrap
    if (this.scroller && this.scroller.nativeElement.firstElementChild) {
      const copyWidth = (this.scroller.nativeElement.firstElementChild as HTMLElement).offsetWidth;
      if (copyWidth > 0) {
        // Wrap between -copyWidth and 0
        const x = this.wrap(-copyWidth, 0, this.baseX);
        this.scroller.nativeElement.style.transform = `translate3d(${x}px, 0, 0)`;
      }
    }

    this.rafId = requestAnimationFrame(this.tick);
  };
}
