'use client';

import { CardContainer } from '@vigilant-broccoli/react-lib';
import { Metronome } from '@vigilant-broccoli/react-music-lib';
import { SpotifyPlaylistGraphComponent } from '../../components/spotify-playlist-graph.component';
import { DjMusicUtilityContent } from '../../components/utilities/dj-music.utility';
import { SIDEBAR_ROUTE } from '../../app.const';
import { usePageTitle } from '../../use-page-title';

const DJ_MUSIC_TITLE = 'DJ Music';
const METRONOME_TITLE = 'Metronome';
const SPOTIFY_PLAYLISTS_TITLE = 'Spotify Playlists';

export default function Page() {
  usePageTitle(SIDEBAR_ROUTE.MUSIC.title);
  return (
    <div className="h-full overflow-auto">
      <div className="grid grid-cols-2 gap-4">
        <div className="min-w-0 overflow-x-auto">
          <CardContainer title={DJ_MUSIC_TITLE}>
            <DjMusicUtilityContent />
          </CardContainer>
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <div className="overflow-x-auto">
            <CardContainer title={METRONOME_TITLE}>
              <Metronome />
            </CardContainer>
          </div>
          <CardContainer title={SPOTIFY_PLAYLISTS_TITLE}>
            <div className="h-[640px]">
              <SpotifyPlaylistGraphComponent />
            </div>
          </CardContainer>
        </div>
      </div>
    </div>
  );
}
