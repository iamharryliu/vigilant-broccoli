import { Component, OnInit, inject } from '@angular/core';
import { MarkdownPageComponent } from 'general-components';
import { SeoService } from '../../../services/seo.service';

@Component({
  selector: 'app-more-page',
  templateUrl: './rules.page.html',
  imports: [MarkdownPageComponent],
})
export class RulesPageComponent implements OnInit {
  private seoService = inject(SeoService);
  contentFilepath = 'https://bucket.cloud8skate.com/content/rules.md';

  ngOnInit() {
    this.seoService.updateMetaTags({
      title: 'Rules',
      description:
        'Cloud8Skate community rules and guidelines. Learn about our safety rules and etiquette for skating sessions in Toronto.',
      url: 'https://cloud8skate.com/rules',
      keywords: 'skating rules, Cloud8 guidelines, skating safety, skating etiquette',
    });
  }
}
