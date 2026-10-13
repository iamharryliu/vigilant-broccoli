'use client';

import { SpotifyPlaylistGraphComponent } from '../../components/spotify-playlist-graph.component';
import { SIDEBAR_ROUTE } from '../../app.const';
import { usePageTitle } from '../../use-page-title';

export default function Page() {
  usePageTitle(SIDEBAR_ROUTE.SPOTIFY_PLAYLISTS.title);
  return (
    <div className="h-full -m-4">
      <SpotifyPlaylistGraphComponent />
    </div>
  );
}
