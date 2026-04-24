import { Component, OnInit, inject } from '@angular/core';
import { EXTERNAL_LINKS } from '../../../core/consts/routes.const';
import { SeoService } from '../../../services/seo.service';
import { ContentContainerComponent } from '../../features/content-container/content-container.component';

@Component({
  selector: 'app-waiver-page',
  templateUrl: './waiver.page.html',
  imports: [ContentContainerComponent],
})
export class WaiverPageComponent implements OnInit {
  private seoService = inject(SeoService);
  waiverUrl = EXTERNAL_LINKS.WAIVER_DOC.url.external;

  ngOnInit() {
    this.seoService.updateMetaTags({
      title: 'Waiver',
      description:
        'Review the Cloud8Skate waiver before joining any city skate event.',
      url: 'https://cloud8skate.com/waiver',
      keywords:
        'skating waiver, city skate waiver, Cloud8Skate event waiver, Toronto skating',
    });
  }
}
