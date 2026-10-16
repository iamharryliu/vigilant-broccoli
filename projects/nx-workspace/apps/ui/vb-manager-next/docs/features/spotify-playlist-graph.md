# Spotify Playlist Graph

## Overview

- Force-directed graph of a user's Spotify playlists, shown as a card under the metronome on the Music page (`/music`), reusing the same `GraphView` (`@vigilant-broccoli/react-lib-higher-level`) the `docs-md` note viewer uses
- Edges = shared songs between playlists; a song matches across releases (single, album, remaster) by normalized title plus primary artist, not only by identical Spotify track id
- Spotify's Web API doesn't expose playlist-folder structure, so folders aren't represented

## Auth

- Separate, per-user Spotify connection independent of the app's Google sign-in (`/api/spotify/auth/login`, `/api/spotify/auth/callback`)
- Standard OAuth authorization-code flow, scope `playlist-read-private playlist-read-collaborative`
- Identity crosses the callback redirect via a signed `state` param (HMAC'd with `SPOTIFY_CLIENT_SECRET`), not a bearer header — Spotify's redirect is a plain browser GET
- `redirect_uri` prefers `SPOTIFY_REDIRECT_BASE_URL` over `request.nextUrl.origin` (`libs/spotify-token.ts`) — PM2 sits behind a reverse proxy that doesn't forward a trustworthy `Host`, so the request's own origin resolves to the internal bind address, not the public domain. Falls back to `request.nextUrl.origin` when unset, which is correct for local dev (no proxy in front of `next dev`)
- Refresh/access tokens stored in Supabase `spotify_oauth_tokens`, keyed by user email (service-role only, RLS enabled with no policies)
- Not-connected state renders a "Connect Spotify" CTA instead of an error
- `pm2:start`/`pm2:reload` run this app's pending Supabase migrations before starting/reloading (mirroring `serve`) — this app has no CI deploy pipeline to apply them otherwise

## Graph Data

- `GET /api/spotify/graph` fetches all playlists, then each playlist's tracks, computes shared-song link weights
- Cached in-memory per user for 30 minutes (`createTtlCache`); `?force=true` bypasses it (wired to the page's Refresh button)
- Link `weight` = shared-song count, scales line width in `GraphView`

## UI

- "Min shared tracks" filter prunes links client-side without refetching
- Clicking a node shows a side panel: owner, track count, link to the playlist on Spotify

## Constraints

- Song matching is a heuristic: bracketed tags and a trailing ` - ...` suffix are dropped from the title, so a studio track and its live or remix version of the same name by the same primary artist also link
- Tracks come from `GET /playlists/{id}/items` (entries under `item`); the older `/playlists/{id}/tracks` now returns 403 for every playlist. A playlist whose items can't be read (Spotify-owned algorithmic playlists may be refused) is skipped with a logged warning and still appears as a node, just with no edges
- A large library (100+ playlists) reliably trips Spotify's rate limit on a cold cache build — one `/items` call per playlist, no bulk endpoint exists. `spotifyFetch` retries a `429` up to twice only when `Retry-After` is 5s or less; a longer one (a dev-mode app's lockout can last ~23.5 hours) fails at once instead of hanging or spending more requests. A 429 on any playlist aborts the whole build, so an incomplete graph is never returned or cached; the page shows its load error until the lockout ends
- If this keeps 429ing in practice, the fix is Spotify's own Extended Quota Mode app review (dashboard), not more client-side retrying — this app is almost certainly still in Development Mode's tighter default limits

## Manual setup

- Spotify Developer Dashboard app (same one `dldjmusic`'s Python script uses) needs `https://manager.vigilant-broccoli.app/api/spotify/auth/callback` added as a Redirect URI
- `SPOTIFY_REDIRECT_BASE_URL` is a plain non-secret constant in `ecosystem.config.js` (like `VB_EXPRESS_URL`), not Vault — testing this flow against local dev works automatically via the `request.nextUrl.origin` fallback, no override needed
