import os
import subprocess


def download_playlist(playlist_url, output):
    output = os.path.expanduser(output)
    subprocess.run(["spotdl", "download", playlist_url, "--output", output], check=True)


def main():
    playlists = [
        {
            "name": "Cracked Out",
            "url": "https://open.spotify.com/playlist/7rRl4iWKuBRDYPxxNnDkt0",
            "output": "~/Downloads/cracked-out",
        },
        {
            "name": "Deep",
            "url": "https://open.spotify.com/playlist/1OibleLCNpgnUWxaSCs9tR",
            "output": "~/Downloads/deep/",
        },
    ]

    for playlist in playlists:
        print(f"Downloading playlist: {playlist['name']}")
        try:
            download_playlist(playlist["url"], playlist["output"])
            print(f"Playlist {playlist['name']} downloaded successfully.")
        except subprocess.CalledProcessError as e:
            print(f"Failed to download playlist {playlist['name']}. Error: {e}")


if __name__ == "__main__":
    main()
