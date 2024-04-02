import json
import os
from spotify_to_mp3_service import SpotifyToMp3Service

CUSTOM_PLAYLIST_FILENAME = "custom_playlists.json"
DEFAULT_PLAYLIST_FILENAME = "default_playlists.json"


def main():
    if os.path.exists(CUSTOM_PLAYLIST_FILENAME):
        with open(CUSTOM_PLAYLIST_FILENAME, "r") as file:
            playlists = json.load(file)
    else:
        with open(DEFAULT_PLAYLIST_FILENAME, "r") as file:
            playlists = json.load(file)
    service = SpotifyToMp3Service()
    service.download_playlists(playlists)


if __name__ == "__main__":
    main()
