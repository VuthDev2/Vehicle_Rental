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

export interface AccordionItem {
  image: string;
  alt?: string;
  title: string;
  desc?: string;
  link?: string;
}

@Component({
  selector: 'app-accordion-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accordion-gallery.component.html',
  styleUrl: './accordion-gallery.component.css'
})
export class AccordionGalleryComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input() items: AccordionItem[] = [];
  @Input() defaultIndex = 1;
  @Input() accentColor = '#10b981';
  @Input() overlayColor = '#0f172a';
  @Input() textColor = '#ffffff';
  @Input() height = 460;
  @Input() gap = 12;
  @Input() radius = 24;
  @Input() expandRatio = 0.52;
  @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';
  @Input() duration = 0.6;
  @Input() ease = 'power3.out';
  @Input() parallax = 0.5;
  @Input() tilt = 8;
  @Input() stagger = 0.06;
  @Input() trigger: 'hover' | 'click' = 'hover';
  @Input() showLabels = true;
  @Input() grayscale = false; // By default Cambo Rent doesn't use grayscale
  @Input() className = '';
  @Input() autoExpandOnScroll = false;

  @Output() indexChange = new EventEmitter<number>();

  active = 0;
  
  @ViewChild('root') rootRef!: ElementRef<HTMLElement>;
  @ViewChildren('panel') panelRefs!: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('media') mediaRefs!: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('bar') barRefs!: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('text') textRefs!: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('desc') descRefs!: QueryList<ElementRef<HTMLElement>>;

  private tl: gsap.core.Timeline | null = null;
  private firstRun = true;
  private mediaSize = 320;
  private ro: ResizeObserver | null = null;
  private scrollObserver: IntersectionObserver | null = null;
  private prefersReduced = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.active = Math.min(Math.max(this.defaultIndex, 0), Math.max(0, this.items.length - 1));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items'] || changes['active']) {
      if (this.rootRef) {
        this.applyLayout(!this.firstRun);
      }
    }
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const el = this.rootRef.nativeElement;
    
    this.ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      const vertical = this.orientation === 'vertical';
      const count = this.items.length;
      const total = vertical ? rect.height : rect.width;
      const usable = Math.max(total - this.gap * (count - 1), 120);
      const size = Math.max(140, usable * Math.min(Math.max(this.expandRatio, 0.2), 0.9) * 1.22);
      this.mediaSize = size;
      el.style.setProperty('--ag-media-size', `${size}px`);
      this.applyLayout(!this.firstRun);
    });

    this.ro.observe(el);
    
    // Setup scroll observer for auto-expanding on mobile/vertical
    if (this.autoExpandOnScroll && typeof IntersectionObserver !== 'undefined') {
      this.scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const idxStr = (entry.target as HTMLElement).getAttribute('data-index');
            if (idxStr) {
              const idx = parseInt(idxStr, 10);
              if (this.active !== idx) {
                this.setActive(idx);
              }
            }
          }
        });
      }, { threshold: [0.5] }); // Trigger when 50% of the element is visible

      setTimeout(() => {
        this.panelRefs.forEach((panelRef, i) => {
          const panelEl = panelRef.nativeElement;
          panelEl.setAttribute('data-index', i.toString());
          this.scrollObserver?.observe(panelEl);
        });
      }, 100);
    }
    
    setTimeout(() => {
      this.applyLayout(!this.firstRun);
      this.firstRun = false;
    }, 0);
  }

  ngOnDestroy(): void {
    if (this.ro) {
      this.ro.disconnect();
    }
    if (this.scrollObserver) {
      this.scrollObserver.disconnect();
    }
    if (this.tl) {
      this.tl.kill();
    }
  }

  applyLayout(animate: boolean) {
    const panels = this.panelRefs?.toArray();
    if (!panels || !panels.length) return;

    const count = this.items.length;
    const vertical = this.orientation === 'vertical';
    const r = Math.min(Math.max(this.expandRatio, 0.2), 0.9);
    const grow = count > 1 ? (r * (count - 1)) / (1 - r) : 1;
    
    if (this.tl) this.tl.kill();
    
    const dur = animate && !this.prefersReduced ? this.duration : 0;
    this.tl = gsap.timeline();

    const mediaArr = this.mediaRefs.toArray();
    const barArr = this.barRefs.toArray();
    const textArr = this.textRefs.toArray();
    const descArr = this.descRefs.toArray();

    panels.forEach((panelRef, i) => {
      const panel = panelRef.nativeElement;
      if (!panel) return;
      
      const isActive = i === this.active;
      const media = mediaArr[i]?.nativeElement;
      const bar = barArr[i]?.nativeElement;
      const text = textArr[i]?.nativeElement;
      const desc = descArr[i]?.nativeElement;

      const rot = isActive ? 0 : i < this.active ? this.tilt : -this.tilt;
      const rotProp = vertical ? { rotateX: -rot } : { rotateY: rot };

      this.tl!.to(panel, { flexGrow: isActive ? grow : 1, ...rotProp, duration: dur, ease: this.ease }, 0);

      if (media) {
        const drift = Math.max(-1.5, Math.min(1.5, this.active - i));
        const shift = drift * this.parallax * this.mediaSize * 0.06;
        const gray = this.grayscale ? (isActive ? 0 : 1) : 0;
        this.tl!.to(
          media,
          {
            xPercent: -50,
            yPercent: -50,
            x: vertical ? 0 : isActive ? 0 : shift,
            y: vertical ? (isActive ? 0 : shift) : 0,
            '--ag-gray': gray,
            '--ag-dim': isActive ? 0 : 0.45,
            duration: dur,
            ease: this.ease
          },
          0
        );
      }

      if (this.showLabels && bar && text) {
        const labelTargets = desc ? [bar, text, desc] : [bar, text];
        if (isActive) {
          this.tl!.to(labelTargets, { opacity: 1, x: 0, duration: dur, ease: this.ease, stagger: this.prefersReduced ? 0 : this.stagger }, 0);
        } else {
          this.tl!.to(labelTargets, { opacity: 0, x: -14, duration: dur * 0.6, ease: this.ease }, 0);
        }
      }
    });
  }

  setActive(i: number) {
    if (this.active !== i) {
      this.ngZone.run(() => {
        this.active = i;
        this.indexChange.emit(i);
        this.applyLayout(true);
      });
    }
  }

  handleEnter(i: number) {
    if (this.trigger === 'hover') {
      this.setActive(i);
    }
  }

  handleClick(i: number, e: Event) {
    if (i !== this.active) {
      e.preventDefault();
      this.setActive(i);
    }
  }

  handleKeyDown(i: number, e: KeyboardEvent) {
    const count = this.items.length;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      this.setActive((i + 1) % count);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      this.setActive((i - 1 + count) % count);
    }
  }
}
