import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

export interface SeoConfig {
  title: string;
  description: string;
  image?: string;
  url?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private readonly titleService = inject(Title);
  private readonly metaService = inject(Meta);

  updateSeoTags(config: SeoConfig) {
    // Update Title
    this.titleService.setTitle(config.title);
    this.metaService.updateTag({ property: 'og:title', content: config.title });

    // Update Description
    this.metaService.updateTag({ name: 'description', content: config.description });
    this.metaService.updateTag({ property: 'og:description', content: config.description });

    // Update Image
    if (config.image) {
      this.metaService.updateTag({ property: 'og:image', content: config.image });
    } else {
      this.metaService.removeTag("property='og:image'");
    }

    // Update URL
    if (config.url) {
      this.metaService.updateTag({ property: 'og:url', content: config.url });
    } else {
      this.metaService.removeTag("property='og:url'");
    }
  }
}
