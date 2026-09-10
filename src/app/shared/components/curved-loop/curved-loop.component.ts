import {
  Component,
  Input,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  PLATFORM_ID,
  Inject,
  NgZone
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';

@Component({
  selector: 'app-curved-loop',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './curved-loop.component.html',
  styleUrl: './curved-loop.component.css'
})
export class CurvedLoopComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input() marqueeText = 'PREMIUM VEHICLES • FLEXIBLE RENTALS • 24/7 SUPPORT • EXPLORE CAMBODIA • ';
  @Input() speed = 2;
  @Input() className = 'curved-loop-text';
  @Input() curveAmount = 400;
  @Input() direction: 'left' | 'right' = 'left';
  @Input() interactive = true;

  @ViewChild('measureText') measureTextRef!: ElementRef<SVGTextElement>;
  @ViewChild('textPath') textPathRef!: ElementRef<SVGTextPathElement>;

  text = '';
  totalText = '';
  spacing = 0;
  offset = 0;
  ready = false;
  
  uid = Math.random().toString(36).substring(2, 9);
  pathId = `curve-${this.uid}`;
  pathD = `M-100,40 Q500,${40 + this.curveAmount} 1540,40`;

  private drag = false;
  private lastX = 0;
  private dir: 'left' | 'right' = 'left';
  private vel = 0;
  private frameId = 0;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.updateText();
    this.dir = this.direction;
    this.pathD = `M-100,40 Q500,${40 + Number(this.curveAmount)} 1540,40`;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['marqueeText']) {
      this.updateText();
      this.measure();
    }
    if (changes['curveAmount']) {
      this.pathD = `M-100,40 Q500,${40 + Number(this.curveAmount)} 1540,40`;
    }
    if (changes['direction']) {
      this.dir = this.direction;
    }
  }

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    setTimeout(() => {
      this.measure();
    }, 0);
  }

  ngOnDestroy() {
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
    }
  }

  private updateText() {
    const hasTrailing = /\s|\u00A0$/.test(this.marqueeText);
    this.text = (hasTrailing ? this.marqueeText.replace(/\s+$/, '') : this.marqueeText) + '\u00A0';
  }

  private measure() {
    if (this.measureTextRef?.nativeElement) {
      this.spacing = this.measureTextRef.nativeElement.getComputedTextLength();
      if (this.spacing > 0) {
        const repeatCount = Math.ceil(1800 / this.spacing) + 2;
        this.totalText = Array(repeatCount).fill(this.text).join('');
        this.ready = true;
        this.offset = -this.spacing;
        
        // Use a timeout to ensure Angular updates the view with @if (ready) before starting loop
        setTimeout(() => this.startLoop(), 10);
      } else {
        // Retry if font/text not loaded yet
        setTimeout(() => this.measure(), 100);
      }
    }
  }

  private startLoop() {
    this.ngZone.runOutsideAngular(() => {
      if (this.frameId) cancelAnimationFrame(this.frameId);

      const step = () => {
        if (!this.drag && this.textPathRef?.nativeElement) {
          const delta = this.dir === 'right' ? this.speed : -this.speed;
          const currentOffset = parseFloat(this.textPathRef.nativeElement.getAttribute('startOffset') || '0');
          let newOffset = currentOffset + delta;

          const wrapPoint = this.spacing;
          if (newOffset <= -wrapPoint) newOffset += wrapPoint;
          if (newOffset > 0) newOffset -= wrapPoint;

          this.textPathRef.nativeElement.setAttribute('startOffset', newOffset + 'px');
          this.offset = newOffset;
        }
        this.frameId = requestAnimationFrame(step);
      };
      
      this.frameId = requestAnimationFrame(step);
    });
  }

  onPointerDown(e: PointerEvent) {
    if (!this.interactive) return;
    this.drag = true;
    this.lastX = e.clientX;
    this.vel = 0;
    (e.target as Element).setPointerCapture(e.pointerId);
  }

  onPointerMove(e: PointerEvent) {
    if (!this.interactive || !this.drag || !this.textPathRef?.nativeElement) return;
    const dx = e.clientX - this.lastX;
    this.lastX = e.clientX;
    this.vel = dx;

    const currentOffset = parseFloat(this.textPathRef.nativeElement.getAttribute('startOffset') || '0');
    let newOffset = currentOffset + dx;

    const wrapPoint = this.spacing;
    if (newOffset <= -wrapPoint) newOffset += wrapPoint;
    if (newOffset > 0) newOffset -= wrapPoint;

    this.textPathRef.nativeElement.setAttribute('startOffset', newOffset + 'px');
    this.offset = newOffset;
  }

  endDrag() {
    if (!this.interactive) return;
    this.drag = false;
    if (this.vel !== 0) {
      this.dir = this.vel > 0 ? 'right' : 'left';
    }
  }

  get cursorStyle(): string {
    return this.interactive ? (this.drag ? 'grabbing' : 'grab') : 'auto';
  }
}
