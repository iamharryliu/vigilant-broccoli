# Spotify API

- [Spotify API Dashboard](https://developer.spotify.com/dashboard)
- [Spotify API Docs](https://developer.spotify.com/documentation/web-api)
- [Spotify API Scopes](https://developer.spotify.com/documentation/web-api/concepts/scopes)

## Commands

```
curl -X POST "https://accounts.spotify.com/api/token" -H "Content-Type: application/x-www-form-urlencoded" -d "grant_type=client_credentials&client_id=CLIENT_ID&client_secret=CLIENT_SECRET&scope=SCOPE"

curl "https://api.spotify.com/v1/me/playlists" -H "Authorization: Bearer AUTHORIZATION_TOKEN"
```
