import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

interface SeoConfig {
  title: string;
  description: string;
  image?: string;
  url?: string;
  keywords?: string;
}

const DEFAULT_IMAGE = 'https://cloud8skate.com/assets/cloud8skate.png';
const BASE_URL = 'https://cloud8skate.com';

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  private titleService = inject(Title);
  private metaService = inject(Meta);

  updateMetaTags(config: SeoConfig) {
    const image = config.image || DEFAULT_IMAGE;
    const url = config.url || BASE_URL;
    const fullTitle = `${config.title} - Cloud8Skate`;

    this.titleService.setTitle(fullTitle);

    this.metaService.updateTag({
      name: 'description',
      content: config.description,
    });

    if (config.keywords) {
      this.metaService.updateTag({ name: 'keywords', content: config.keywords });
    }

    this.metaService.updateTag({ property: 'og:title', content: fullTitle });
    this.metaService.updateTag({
      property: 'og:description',
      content: config.description,
    });
    this.metaService.updateTag({ property: 'og:image', content: image });
    this.metaService.updateTag({ property: 'og:url', content: url });

    this.metaService.updateTag({ name: 'twitter:title', content: fullTitle });
    this.metaService.updateTag({
      name: 'twitter:description',
      content: config.description,
    });
    this.metaService.updateTag({ name: 'twitter:image', content: image });

    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', url);
    }
  }
}
