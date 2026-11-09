'use client';

import { CardContainer, useDocumentTitle } from '@vigilant-broccoli/react-lib';
import { Metronome } from '@vigilant-broccoli/react-music-lib';
import { APP_NAME } from './app.const';
import { DjMusicComponent } from './components/dj-music.component';
import { SpotifyPlaylistGraphComponent } from './components/spotify-playlist-graph.component';

const DJ_MUSIC_TITLE = 'DJ Music';
const METRONOME_TITLE = 'Metronome';
const SPOTIFY_PLAYLISTS_TITLE = 'Spotify Playlists';

export default function Page() {
  useDocumentTitle(APP_NAME);
  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      <div className="min-w-0 overflow-x-auto">
        <CardContainer title={DJ_MUSIC_TITLE}>
          <DjMusicComponent />
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
  );
}
