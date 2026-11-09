# Agent Context — music-next

## Table of Contents

- [Nuances](#nuances)
  - [This app is a zone under local-manager-next's origin](#this-app-is-a-zone-under-local-manager-nexts-origin)
  - [Client fetches need the basePath prefix](#client-fetches-need-the-basepath-prefix)
  - [Spotify OAuth runs in the top window on the manager's origin](#spotify-oauth-runs-in-the-top-window-on-the-managers-origin)

## Nuances

### This app is a zone under local-manager-next's origin

`basePath` is `/music/app`; `local-manager-next` rewrites that prefix to `127.0.0.1:1340` and iframes it on its `/music` page. The app has no hostname of its own and nothing is registered as a public URL. Keep the prefix identical in this app's `next.config.js` and `local-manager-next`'s `next.config.js` (`MUSIC_PATH`) and music page, and deploy through `pnpm deploy:local`, which reloads this app before the manager. It runs natively under PM2 because the DJ routes open Rekordbox and write to the host's Google Drive folder.

Sign-in happens in `local-manager-next`. `libs/auth.ts` builds a Supabase client on the same project, so it reads the session that app stored in this origin's `localStorage`; opening the app standalone without a session returns 401 from every `/api` route except `/api/spotify/auth/*` (`src/proxy.ts`).

### Client fetches need the basePath prefix

Next prepends `basePath` to links and assets but not to `fetch('/api/...')`. Every endpoint in `src/app/constants/api-endpoints.ts` goes through `withBasePath`; a bare `/api/...` URL would hit `local-manager-next`'s routes and fail with 404 or 401.

### Spotify OAuth runs in the top window on the manager's origin

The registered redirect URI is the manager's origin plus `/music/app/api/spotify/auth/callback`. Behind the rewrite `request.nextUrl.origin` is `127.0.0.1:1340`, so `spotifyAppOrigin` in `libs/spotify-token.ts` uses `SPOTIFY_REDIRECT_BASE_URL` (set in `ecosystem.config.js`), else the rewrite's `x-forwarded-host`. Connect navigates `window.top` and the callback redirects to the manager's `/music`, so the error query param is read from `window.top.location`; navigating the frame instead would nest the manager shell inside it. Changing the basePath or origin requires updating the Spotify Developer Dashboard redirect URI.
