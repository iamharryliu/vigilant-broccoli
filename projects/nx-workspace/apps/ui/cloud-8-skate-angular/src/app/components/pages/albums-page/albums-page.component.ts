import { Component, OnInit, inject } from '@angular/core';
import { ImageGalleryComponent } from '../../features/image-gallery/image-gallery.component';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT } from '../../../../environments/environment';

import { RouterModule } from '@angular/router';
import { INTERNAL_LINKS } from '../../../core/consts/routes.const';
import { ImageAlbum } from '@prettydamntired/personal-website-lib';
import { SeoService } from '../../../services/seo.service';

@Component({
  selector: 'app-albums-page',
  templateUrl: './albums-page.component.html',
  imports: [ImageGalleryComponent, RouterModule],
})
export class AlbumsPageComponent implements OnInit {
  albums!: ImageAlbum[];
  LINKS = INTERNAL_LINKS;
  private http = inject(HttpClient);
  private seoService = inject(SeoService);

  constructor() {
    this.getPosts().subscribe((res) => (this.albums = res));
  }

  ngOnInit() {
    this.seoService.updateMetaTags({
      title: 'Photo Albums',
      description:
        'Cloud8Skate photo albums. View photos from our Toronto skating sessions, events, and meetups at The Bentway and College Park.',
      url: 'https://cloud8skate.com/albums',
      keywords:
        'Cloud8 photos, Toronto skating photos, skating pictures, Cloud8 events',
    });
  }

  private getPosts(): Observable<any> {
    return this.http.get<any>(ENVIRONMENT.URLS.HEADLESS_CMS.IMAGE_ALBUMS);
  }
}
