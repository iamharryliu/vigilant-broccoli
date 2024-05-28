import { Component } from '@angular/core';
import { MarkdownPageComponent } from 'general-components';

@Component({
  standalone: true,
  selector: 'app-music-page',
  templateUrl: './playlists.page.html',
  imports: [MarkdownPageComponent],
})
export class PlaylistsPageComponent {
  contentFilepath = 'assets/site-content/playlists.md';
}
