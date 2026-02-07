import { Component, OnInit, inject } from '@angular/core';
import { MarkdownPageComponent } from 'general-components';
import { SeoService } from '../../../services/seo.service';

@Component({
  selector: 'app-faq-page',
  templateUrl: './faq.page.html',
  imports: [MarkdownPageComponent],
})
export class FaqPageComponent implements OnInit {
  private seoService = inject(SeoService);
  contentFilepath = 'assets/site-content/faq.md';

  ngOnInit() {
    this.seoService.updateMetaTags({
      title: 'FAQ',
      description:
        'Frequently asked questions about Cloud8Skate, skating in Toronto, equipment, locations, and our skating community events.',
      url: 'https://cloud8skate.com/faq',
      keywords: 'skating FAQ, Toronto skating questions, inline skating help',
    });
  }
}
