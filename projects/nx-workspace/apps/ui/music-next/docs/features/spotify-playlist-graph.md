# Spotify Playlist Graph

## Overview

- Force-directed graph of a user's Spotify playlists, shown as a card under the metronome on the [Music](./music.md) page, reusing the same `GraphView` (`@vigilant-broccoli/docs-explorer`) the `docs-md` note viewer uses
- Edges = shared songs between playlists; a song matches across releases (single, album, remaster) by normalized title plus primary artist, not only by identical Spotify track id
- Spotify's Web API doesn't expose playlist-folder structure, so folders aren't represented

## Auth

- Separate, per-user Spotify connection independent of `local-manager-next`'s Google sign-in (`/api/spotify/auth/login`, `/api/spotify/auth/callback`, both under the `/music/app` basePath)
- Standard OAuth authorization-code flow, scope `playlist-read-private playlist-read-collaborative`
- Identity crosses the callback redirect via a signed `state` param (HMAC'd with `SPOTIFY_CLIENT_SECRET`), not a bearer header — Spotify's redirect is a plain browser GET
- `redirect_uri` is the manager's origin plus `/music/app/api/spotify/auth/callback` (`libs/spotify-token.ts`). The origin is `SPOTIFY_REDIRECT_BASE_URL`, else the `x-forwarded-host` that `local-manager-next`'s rewrite sends, else `request.nextUrl.origin`: behind the rewrite the request's own origin is the zone's bind address (`127.0.0.1:1340`), and in production the manager's reverse proxy doesn't forward a trustworthy `Host` either
- Connect navigates the top window to Spotify; the callback redirects it back to the manager's `/music`, and the graph reads its `spotifyError` param from `window.top.location`
- Refresh/access tokens stored in Supabase `spotify_oauth_tokens`, keyed by user email (service-role only, RLS enabled with no policies)
- Not-connected state renders a "Connect Spotify" CTA instead of an error
- The `spotify_oauth_tokens` migration stays in `local-manager-next/supabase/migrations`, whose `pm2:start`/`pm2:reload` apply that shared Supabase project's migrations

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

- Spotify Developer Dashboard app (same one `dldjmusic`'s Python script uses) needs `https://manager.vigilant-broccoli.app/music/app/api/spotify/auth/callback` added as a Redirect URI
- `SPOTIFY_REDIRECT_BASE_URL` is a plain non-secret constant in `ecosystem.config.js`, not Vault. Under `serve` it is unset and the `x-forwarded-host` fallback gives the manager's dev origin, which must also be registered as a Redirect URI to test the flow locally
