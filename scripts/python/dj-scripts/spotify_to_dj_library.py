from spotify_to_mp3_service import SpotifyToMp3Service


def main():
    playlists = [
        {
            "name": "something fun",
            "url": "https://open.spotify.com/playlist/02Fku7GHNdgm02W4RGTjdG",
        },
        {
            "name": "eurobeats",
            "url": "https://open.spotify.com/playlist/0GY6Cnx6NgpjbCuxFMvROD",
        },
        {
            "name": "vibes",
            "url": "https://open.spotify.com/playlist/2SmVVHqYt8IyoQWwh3Eja1",
        },
        {
            "name": "edgy beats",
            "url": "https://open.spotify.com/playlist/1YuKYIViNWO4n9PwUPpA93",
        },
        {
            "name": "dnd",
            "url": "https://open.spotify.com/playlist/6qk9QGFUdo3prDKqZH5SeR",
        },
        {
            "name": "religious",
            "url": "https://open.spotify.com/playlist/2WGUADorsMlsJz6KrA6I1G",
        },
        {
            "name": "chill house mix",
            "url": "https://open.spotify.com/playlist/0U9BCLabfVnNJl9lbmNhmJ",
        },
        {
            "name": "cracked out",
            "url": "https://open.spotify.com/playlist/7rRl4iWKuBRDYPxxNnDkt0",
        },
        {
            "name": "deep",
            "url": "https://open.spotify.com/playlist/1OibleLCNpgnUWxaSCs9tR",
        },
    ]

    service = SpotifyToMp3Service()
    service.download_playlists(playlists)


if __name__ == "__main__":
    main()
