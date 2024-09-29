import json
import os
from spotify_to_mp3_service import SpotifyToMp3Service

CUSTOM_PLAYLIST_FILENAME = "custom_playlists.json"
DEFAULT_PLAYLIST_FILENAME = "default_playlists.json"


def main() -> None:
    filename = (
        CUSTOM_PLAYLIST_FILENAME
        if os.path.exists(CUSTOM_PLAYLIST_FILENAME)
        else DEFAULT_PLAYLIST_FILENAME
    )
    with open(filename, "r", encoding="utf-8") as file:
        playlists = json.load(file)
    service = SpotifyToMp3Service()
    service.download_playlists(playlists)


if __name__ == "__main__":
    main()
