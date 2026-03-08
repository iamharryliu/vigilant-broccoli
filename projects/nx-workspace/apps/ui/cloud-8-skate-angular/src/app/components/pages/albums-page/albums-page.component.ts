import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ContentContainerComponent } from '../../features/content-container/content-container.component';
import { INTERNAL_LINKS } from '../../../core/consts/routes.const';
import {
  Cloud8GalleryAlbumSummary,
  Cloud8SanityService,
} from '../../../services/cloud8-sanity.service';
import { SeoService } from '../../../services/seo.service';

@Component({
  selector: 'app-albums-page',
  templateUrl: './albums-page.component.html',
  imports: [CommonModule, RouterModule, ContentContainerComponent],
})
export class AlbumsPageComponent implements OnInit {
  albums: Cloud8GalleryAlbumSummary[] = [];
  isLoading = true;
  LINKS = INTERNAL_LINKS;
  private cloud8SanityService = inject(Cloud8SanityService);
  private seoService = inject(SeoService);

  ngOnInit() {
    this.cloud8SanityService.getGalleryAlbums().subscribe(albums => {
      this.albums = albums;
      this.isLoading = false;
    });

    this.seoService.updateMetaTags({
      title: 'Gallery',
      description:
        'Cloud8Skate photo albums. View photos from our Toronto skating sessions, events, and meetups at The Bentway and College Park.',
      url: 'https://cloud8skate.com/gallery',
      keywords:
        'Cloud8 photos, Toronto skating photos, skating pictures, Cloud8 events',
    });
  }

  trackAlbum(_: number, album: Cloud8GalleryAlbumSummary) {
    return album._id;
  }
}
