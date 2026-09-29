# Spotify API

## Table of Contents

- [Reference](#reference)
- [Commands](#commands)
- [Authentication Flows](#authentication-flows)
- [API Limitations](#api-limitations)
  - [Quota Modes](#quota-modes)
  - [Endpoint Accessibility by Token Type](#endpoint-accessibility-by-token-type)
- [Rate Limiting](#rate-limiting)
- [Free Tier](#free-tier)

## Reference

- [Spotify API Dashboard](https://developer.spotify.com/dashboard)
- [Spotify API Docs](https://developer.spotify.com/documentation/web-api)
- [Spotify API Scopes](https://developer.spotify.com/documentation/web-api/concepts/scopes)

## Commands

```
curl -X POST "https://accounts.spotify.com/api/token" -H "Content-Type: application/x-www-form-urlencoded" -d "grant_type=client_credentials&client_id=CLIENT_ID&client_secret=CLIENT_SECRET&scope=SCOPE"

curl "https://api.spotify.com/v1/me/playlists" -H "Authorization: Bearer AUTHORIZATION_TOKEN"
```

## Authentication Flows

| Flow               | User context | Obtains                          | Use when                                                             |
| ------------------ | ------------ | -------------------------------- | -------------------------------------------------------------------- |
| Authorization Code | Yes          | Access token + **refresh token** | Reading a user's own library, private or collaborative playlists     |
| Client Credentials | No           | Access token only                | Unattended jobs touching only public catalogue data (search, tracks) |
| PKCE               | Yes          | Access token + refresh token     | Public clients that cannot hold a client secret (browser, mobile)    |

Access tokens expire after `expires_in` (3600s in practice) — refresh slightly
early rather than on expiry, so a token cannot die mid-request. Refresh tokens
do not expire on a timer, so one minted interactively can drive an unattended
job indefinitely; they can still be revoked, which is a separate failure mode
worth distinguishing from ordinary expiry.

## API Limitations

### Quota Modes

An app starts in **development mode**, which is not merely a lower rate limit —
it removes access to whole endpoint families. Development mode also caps the app
at a small number of manually-added users. **Extended quota mode** lifts both and
requires a review/approval request; it is not self-serve.

A November 2024 change withdrew several endpoints from development-mode apps,
including Related Artists, Recommendations, Audio Features, Audio Analysis,
Featured Playlists, and algorithmic or editorial playlists. Treat any endpoint
returning data Spotify itself curates as unavailable unless proven otherwise.

### Endpoint Accessibility by Token Type

Observed 2026-09-29 against a development-mode app. Rows marked _verified_ were
tested directly; the rest follow from the flow's design.

| Endpoint                   | Client credentials                | User token | Notes                                                 |
| -------------------------- | --------------------------------- | ---------- | ----------------------------------------------------- |
| `GET /browse/new-releases` | `403` _(verified)_                | Yes        | Curated content, withdrawn from development-mode apps |
| `GET /me/*`                | `401`                             | Yes        | No user context exists on an app-only token           |
| `GET /playlists/{id}`      | `429 QUOTA_EXCEEDED` _(verified)_ | Yes        | Not a throttle — see below                            |
| `GET /search`              | `200` _(verified)_                | Yes        | Reliable app-only liveness check                      |
| `GET /tracks/{id}`         | `200` _(verified)_                | Yes        | Returns `404` for a well-formed but unresolvable id   |

The playlist result is the trap. A development-mode app reading
`GET /playlists/{id}` with a client-credentials token gets `429` with
`"reason": "QUOTA_EXCEEDED"` and a `Retry-After` measured in **hours** (27574
seconds observed) — on the very first such request of a session, with no prior
usage to accumulate against. That, plus the multi-hour window, is why this reads
as a standing restriction rather than ordinary throttling. Not confirmed by
experiment: whether waiting out the full `Retry-After` would succeed, and
whether a user token reaches the same playlist (indirect evidence only — user
OAuth tools read playlists routinely).

**The `429` still means the token authenticated.** A rejected or expired token
returns `401`; here the same token returned `200` from `GET /search` moments
later. Note the converse does not hold — a `429` alone is not proof that
credentials are valid, since rate limiting is often applied at the edge before
auth is evaluated. Prove credentials with a `200` from an endpoint the token can
actually reach, never by interpreting a `429`.

## Rate Limiting

- Calculated over a **rolling 30-second window**; development-mode apps get a
  much smaller allowance than extended-quota ones.
- A `429` carries `Retry-After` in **whole seconds**. Honour it: ignoring it
  escalates to longer lockouts against the client id.
- **Cap the sleep.** Because a permission failure can surface as a `429` with a
  multi-hour `Retry-After`, a client that sleeps for whatever the header says
  will hang far past any sane job timeout, silently and with no output. Clamp
  retry delays to a ceiling and surface the `429` instead of waiting past it.
- Set a per-request timeout as well — a stalled socket otherwise hangs forever,
  which looks identical to a slow API from the outside.

## Free Tier

- **No paid tier for API access.** The Web API is free; there is no billing plan
  that raises limits, so cost is never the constraint — quota mode is.
- **Development mode (default):** free, self-serve, limited to a small set of
  manually-added users, reduced rate limits, and missing the endpoint families
  listed above.
- **Extended quota mode:** also free, but gated behind an approval request
  rather than a payment.
- A Spotify **Premium account** is required for playback-related endpoints
  (Web Playback SDK, transport controls); metadata and search are not affected.
