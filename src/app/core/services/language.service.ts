import { Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private translate = inject(TranslateService);
  currentLang = signal<string>('en');

  readonly availableLangs = ['en', 'km', 'zh'];

  constructor() {
    this.translate.addLangs(this.availableLangs);
    this.translate.setFallbackLang('en');
    
    if (typeof window !== 'undefined') {
      const browserLang = this.translate.getBrowserLang() || 'en';
      const lang = browserLang.match(/en|km|zh/) ? browserLang : 'en';
      this.translate.use(lang);
      this.currentLang.set(lang);
    } else {
      this.translate.use('en');
    }
  }

  switchLang(lang: string) {
    this.translate.use(lang);
    this.currentLang.set(lang);
  }

  cycleLang() {
    const currentIndex = this.availableLangs.indexOf(this.currentLang());
    const nextIndex = (currentIndex + 1) % this.availableLangs.length;
    this.switchLang(this.availableLangs[nextIndex]);
  }
}
