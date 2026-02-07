import { Component, OnInit, inject } from '@angular/core';
import { MarkdownPageComponent } from 'general-components';
import { SeoService } from '../../../services/seo.service';

@Component({
  selector: 'app-terminology-page',
  templateUrl: './terminology.page.html',
  imports: [MarkdownPageComponent],
})
export class TerminologyPageComponent implements OnInit {
  private seoService = inject(SeoService);
  contentFilepath = 'assets/site-content/skate-terminology.md';

  ngOnInit() {
    this.seoService.updateMetaTags({
      title: 'Skate Terminology',
      description:
        'Learn skating terminology and slang. A comprehensive guide to inline skating, rollerblading, and roller skating terms used by the Cloud8 community.',
      url: 'https://cloud8skate.com/skate-terminology',
      keywords:
        'skating terms, inline skating terminology, rollerblading slang, skating dictionary',
    });
  }
}
