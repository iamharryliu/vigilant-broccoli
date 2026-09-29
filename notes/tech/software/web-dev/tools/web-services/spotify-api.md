# Spotify API

- [Spotify API Dashboard](https://developer.spotify.com/dashboard)
- [Spotify API Docs](https://developer.spotify.com/documentation/web-api)
- [Spotify API Scopes](https://developer.spotify.com/documentation/web-api/concepts/scopes)

## Free Tier

The Web API itself is free — no paid tier, no published request quota. Spotify enforces a rolling rate limit (per app, measured over a ~30 second window) rather than a daily/monthly cap; exceeding it returns a `429` with a `Retry-After` header. Extended/commercial quota beyond the default requires an app-review request from Spotify, not a billing upgrade.

## Commands

```
curl -X POST "https://accounts.spotify.com/api/token" -H "Content-Type: application/x-www-form-urlencoded" -d "grant_type=client_credentials&client_id=CLIENT_ID&client_secret=CLIENT_SECRET&scope=SCOPE"

curl "https://api.spotify.com/v1/me/playlists" -H "Authorization: Bearer AUTHORIZATION_TOKEN"
```
