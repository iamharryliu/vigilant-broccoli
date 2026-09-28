# Spotify Playlist Graph

## Overview

- Force-directed graph of a user's Spotify playlists at `/spotify-playlists`, reusing the same `GraphView` (`@vigilant-broccoli/react-utility`) the `docs-md` note viewer uses
- Edges = shared tracks between playlists; node color = each playlist's dominant genre
- Spotify's Web API doesn't expose playlist-folder structure, so folders aren't represented — grouping is genre-based instead

## Auth

- Separate, per-user Spotify connection independent of the app's Google sign-in (`/api/spotify/auth/login`, `/api/spotify/auth/callback`)
- Standard OAuth authorization-code flow, scope `playlist-read-private playlist-read-collaborative`
- Identity crosses the callback redirect via a signed `state` param (HMAC'd with `SPOTIFY_CLIENT_SECRET`), not a bearer header — Spotify's redirect is a plain browser GET
- `redirect_uri` prefers `SPOTIFY_REDIRECT_BASE_URL` over `request.nextUrl.origin` (`libs/spotify-token.ts`) — PM2 sits behind a reverse proxy that doesn't forward a trustworthy `Host`, so the request's own origin resolves to the internal bind address, not the public domain. Falls back to `request.nextUrl.origin` when unset, which is correct for local dev (no proxy in front of `next dev`)
- Refresh/access tokens stored in Supabase `spotify_oauth_tokens`, keyed by user email (service-role only, RLS enabled with no policies)
- Not-connected state renders a "Connect Spotify" CTA instead of an error
- `pm2:start`/`pm2:reload` run this app's pending Supabase migrations before starting/reloading (mirroring `serve`) — this app has no CI deploy pipeline to apply them otherwise

## Graph Data

- `GET /api/spotify/graph` fetches all playlists, then each playlist's tracks, computes shared-track link weights and per-playlist dominant genre
- Cached in-memory per user for 30 minutes (`createTtlCache`); `?force=true` bypasses it (wired to the page's Refresh button)
- Link `weight` = shared-track count, scales line width in `GraphView`

## UI

- "Min shared tracks" filter prunes links client-side without refetching
- Clicking a node shows a side panel: owner, track count, top genre, link to the playlist on Spotify

## Constraints

- Genre comes from each track's primary artist only (not full collaborator list)
- A playlist whose `/tracks` endpoint 403s (Spotify-owned algorithmic playlists — Discover Weekly, Daily Mix, Release Radar — routinely do) still appears as a node, just with no edges and "Ungrouped" genre
- A large library (100+ playlists) reliably trips Spotify's rate limit on a cold cache build — one `/tracks` call per playlist, no bulk endpoint exists. `spotifyFetch` retries a `429` up to twice, honoring `Retry-After` but capped at 5s (a dev-mode app's real penalty can run minutes, not seconds, so a request this app makes synchronously for a page load must fail fast rather than hang); a persistently-limited call surfaces as a load error like any other failure
- If this keeps 429ing in practice, the fix is Spotify's own Extended Quota Mode app review (dashboard), not more client-side retrying — this app is almost certainly still in Development Mode's tighter default limits

## Manual setup

- Spotify Developer Dashboard app (same one `dldjmusic`'s Python script uses) needs `https://manager.vigilant-broccoli.app/api/spotify/auth/callback` added as a Redirect URI
- `SPOTIFY_REDIRECT_BASE_URL` is a plain non-secret constant in `ecosystem.config.js` (like `VB_EXPRESS_URL`), not Vault — testing this flow against local dev works automatically via the `request.nextUrl.origin` fallback, no override needed
