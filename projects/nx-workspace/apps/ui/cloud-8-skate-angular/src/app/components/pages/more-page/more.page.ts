import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { MarkdownPageComponent } from 'general-components';
import { SeoService } from '../../../services/seo.service';

@Component({
  selector: 'app-more-page',
  templateUrl: './more.page.html',
  imports: [MarkdownPageComponent],
})
export class MorePageComponent implements OnInit {
  contentFilepath = 'assets/site-content/more.md';
  private route = inject(ActivatedRoute);
  private seoService = inject(SeoService);

  constructor() {
    this.route.paramMap.subscribe((params: ParamMap) => {
      const id = params.get('id');
      if (id) {
        this.contentFilepath = `assets/site-content/${id}.md`;
      }
    });
  }

  ngOnInit() {
    this.seoService.updateMetaTags({
      title: 'More Info',
      description:
        'Useful information for skating in Toronto. Find skate rinks, skateparks, shops, and local skating resources.',
      url: 'https://cloud8skate.com/more',
      keywords:
        'Toronto skate rinks, Toronto skateparks, skate shops Toronto, skating resources',
    });
  }
}
