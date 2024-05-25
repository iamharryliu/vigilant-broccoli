import { Component } from '@angular/core';
import { GeneralLayoutComponent } from '../../layouts/general-layout.component';
import { MarkdownPageComponent } from 'general-components';

@Component({
  standalone: true,
  selector: 'app-music-page',
  templateUrl: './playlists.page.html',
  imports: [GeneralLayoutComponent, MarkdownPageComponent],
})
export class PlaylistsPageComponent {
  contentFilepath = 'assets/site-content/playlists.md';
}
