import { Component, OnInit, inject } from '@angular/core';
import { MarkdownPageComponent } from 'general-components';
import { SeoService } from '../../../services/seo.service';

@Component({
  selector: 'app-music-page',
  templateUrl: './playlists.page.html',
  imports: [MarkdownPageComponent],
})
export class PlaylistsPageComponent implements OnInit {
  private seoService = inject(SeoService);
  contentFilepath = 'assets/site-content/playlists.md';

  ngOnInit() {
    this.seoService.updateMetaTags({
      title: 'Playlists',
      description:
        'Cloud8Skate music playlists for skating. Listen to our curated playlists perfect for inline skating and roller skating sessions.',
      url: 'https://cloud8skate.com/playlists',
      keywords: 'skating music, skating playlists, Cloud8 music, skating songs',
    });
  }
}
