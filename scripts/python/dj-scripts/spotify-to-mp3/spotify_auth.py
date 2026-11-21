import os

import spotipy
from spotipy.oauth2 import SpotifyOAuth

REDIRECT_URI = "http://127.0.0.1:20001/callback"
PLAYLIST_READ_SCOPE = "playlist-read-private playlist-read-collaborative"


def build_spotify_client(
    scope=PLAYLIST_READ_SCOPE,
    client_id=None,
    client_secret=None,
) -> spotipy.Spotify:
    return spotipy.Spotify(
        auth_manager=SpotifyOAuth(
            client_id=client_id or os.environ.get("SPOTIFY_CLIENT_ID"),
            client_secret=client_secret or os.environ.get("SPOTIFY_CLIENT_SECRET"),
            redirect_uri=REDIRECT_URI,
            scope=scope,
        )
    )
