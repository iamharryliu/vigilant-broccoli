import json
from spotify_to_mp3_service import SpotifyToMp3Service


def main():
    with open("playlists.json", "r") as file:
        playlists = json.load(file)
    service = SpotifyToMp3Service()
    service.download_playlists(playlists)


if __name__ == "__main__":
    main()
