import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ImageGalleryComponent } from '../../features/image-gallery/image-gallery.component';
import { of, switchMap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  Cloud8GalleryAlbumDetail,
  Cloud8SanityService,
} from '../../../services/cloud8-sanity.service';
import { SeoService } from '../../../services/seo.service';

@Component({
  selector: 'app-album-page',
  templateUrl: './album-page.component.html',
  imports: [ImageGalleryComponent, CommonModule],
})
export class AlbumPageComponent implements OnInit {
  album: Cloud8GalleryAlbumDetail | null = null;
  isLoading = true;

  private route = inject(ActivatedRoute);
  private cloud8SanityService = inject(Cloud8SanityService);
  private seoService = inject(SeoService);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap(params => {
          const albumSlug = params.get('albumSlug');
          this.isLoading = true;

          if (!albumSlug) {
            return of(null);
          }

          return this.cloud8SanityService.getGalleryAlbum(albumSlug);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(album => {
        this.album = album;
        this.isLoading = false;

        if (!album) {
          return;
        }

        this.seoService.updateMetaTags({
          title: album.name,
          description:
            album.description ||
            `Cloud8Skate gallery album: ${album.name}. View photos from our Toronto skating sessions and events.`,
          url: `https://cloud8skate.com/gallery/${album.slug}`,
          keywords: 'Cloud8 gallery, Toronto skating photos, Cloud8 album',
        });
      });
  }
}
