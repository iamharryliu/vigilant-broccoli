import json
import os
from time import time
from spotify_to_mp3_service import SpotifyToMp3Service

CUSTOM_PLAYLIST_FILENAME = "custom_playlists.json"
DEFAULT_PLAYLIST_FILENAME = "default_playlists.json"


def main():
    start_time = time()
    print("Downloading music started.")
    filename = (
        CUSTOM_PLAYLIST_FILENAME
        if os.path.exists(CUSTOM_PLAYLIST_FILENAME)
        else DEFAULT_PLAYLIST_FILENAME
    )
    with open(filename, "r") as file:
        playlists = json.load(file)
    service = SpotifyToMp3Service()
    service.download_playlists(playlists)
    end_time = time()
    time_passed = end_time - start_time
    minutes = int(time_passed // 60)
    seconds = int(time_passed % 60)
    print(f"Downloading music complete in {minutes}m{seconds}s.")


if __name__ == "__main__":
    main()
