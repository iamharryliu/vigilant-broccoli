import os
import subprocess
import threading


dj_music_directory = "~/My Drive/DJ Music Library"


def download_playlist(playlist):
    try:
        fname = convert_to_slug(playlist["name"])
        output = f"{dj_music_directory}/{fname}"
        output = os.path.expanduser(output)
        subprocess.run(
            ["spotdl", "download", playlist["url"], "--output", output], check=True
        )
        print(f"Playlist {playlist['name']} downloaded successfully.")
    except subprocess.CalledProcessError as e:
        print(f"Failed to download playlist {playlist['name']}. Error: {e}")


def convert_to_slug(text):
    return "-".join(text.lower().split())


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

    # for playlist in playlists:
    #     print(f"Downloading playlist: {playlist['name']}")
    #     try:
    #         download_playlist(playlist)
    #         print(f"Playlist {playlist['name']} downloaded successfully.")
    #     except subprocess.CalledProcessError as e:
    #         print(f"Failed to download playlist {playlist['name']}. Error: {e}")

    threads = []
    for playlist in playlists:
        thread = threading.Thread(target=download_playlist, args=(playlist,))
        thread.start()
        threads.append(thread)
    for thread in threads:
        thread.join()


if __name__ == "__main__":
    main()
