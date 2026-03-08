import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Cloud8FaqPage,
  Cloud8SanityService,
} from '../../../services/cloud8-sanity.service';
import { SeoService } from '../../../services/seo.service';

@Component({
  selector: 'app-faq-page',
  templateUrl: './faq.page.html',
  imports: [CommonModule],
})
export class FaqPageComponent implements OnInit {
  private seoService = inject(SeoService);
  private cloud8SanityService = inject(Cloud8SanityService);
  faqPage: Cloud8FaqPage | null = null;
  isLoading = true;

  ngOnInit() {
    this.updateSeo();

    this.cloud8SanityService.getFaqPage().subscribe(faqPage => {
      this.faqPage = faqPage;
      this.isLoading = false;

      if (faqPage) {
        this.updateSeo(faqPage);
      }
    });
  }

  trackFaqItem(_: number, item: { _key?: string; question: string }) {
    return item._key ?? item.question;
  }

  private updateSeo(faqPage?: Cloud8FaqPage) {
    this.seoService.updateMetaTags({
      title: faqPage?.seoTitle || 'FAQ',
      description:
        faqPage?.seoDescription ||
        'Frequently asked questions about Cloud8Skate, skating in Toronto, equipment, locations, and our skating community events.',
      url: 'https://cloud8skate.com/faq',
      keywords:
        faqPage?.seoKeywords ||
        'skating FAQ, Toronto skating questions, inline skating help',
    });
  }
}
