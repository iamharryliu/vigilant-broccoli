# Music

## Overview

- The root page (`src/app/page.tsx`, served at `/music/app` and embedded by `local-manager-next`'s `/music`) hosts the DJ Music card (`src/app/components/dj-music.component.tsx`), the Metronome from `@vigilant-broccoli/react-music-lib` and the [Spotify Playlists](./spotify-playlist-graph.md) graph, in two columns at every width (`grid-cols-2`, `min-w-0` cells that scroll horizontally if a card's content is too wide): DJ Music left, Metronome above Spotify Playlists right
- DJ Music lists the downloaded playlists under the Google Drive DJ library (`GET /api/dj/playlists`), downloads `mix` playlists with the `spotify-to-mp3` Python scripts (`POST /api/dj/download`) and opens Rekordbox on the host (`POST /api/dj/open-rekordbox`)
