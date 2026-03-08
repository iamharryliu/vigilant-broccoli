import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Cloud8PlaylistsPage,
  Cloud8SanityService,
} from '../../../services/cloud8-sanity.service';
import { SeoService } from '../../../services/seo.service';

@Component({
  selector: 'app-music-page',
  templateUrl: './playlists.page.html',
  imports: [CommonModule],
})
export class PlaylistsPageComponent implements OnInit {
  private seoService = inject(SeoService);
  private cloud8SanityService = inject(Cloud8SanityService);
  playlistsPage: Cloud8PlaylistsPage | null = null;
  isLoading = true;

  ngOnInit() {
    this.updateSeo();

    this.cloud8SanityService.getPlaylistsPage().subscribe(playlistsPage => {
      this.playlistsPage = playlistsPage;
      this.isLoading = false;

      if (playlistsPage) {
        this.updateSeo(playlistsPage);
      }
    });
  }

  trackPlaylist(_: number, item: { _key?: string; title: string }) {
    return item._key ?? item.title;
  }

  private updateSeo(playlistsPage?: Cloud8PlaylistsPage) {
    this.seoService.updateMetaTags({
      title: playlistsPage?.seoTitle || 'Playlists',
      description:
        playlistsPage?.seoDescription ||
        'Cloud8Skate music playlists for skating. Listen to our curated playlists perfect for inline skating and roller skating sessions.',
      url: 'https://cloud8skate.com/playlists',
      keywords:
        playlistsPage?.seoKeywords ||
        'skating music, skating playlists, Cloud8 music, skating songs',
    });
  }
}
