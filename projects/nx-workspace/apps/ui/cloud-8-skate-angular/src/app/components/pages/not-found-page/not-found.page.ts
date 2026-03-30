import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentContainerComponent } from '../../features/content-container/content-container.component';
import { SeoService } from '../../../services/seo.service';

@Component({
  selector: 'app-not-found-page',
  templateUrl: './not-found.page.html',
  imports: [ContentContainerComponent, RouterLink],
})
export class NotFoundPageComponent implements OnInit {
  private seoService = inject(SeoService);

  ngOnInit() {
    this.seoService.updateMetaTags({
      title: 'Page Not Found',
      description: 'The page you are looking for does not exist.',
      keywords: '',
    });
  }
}
