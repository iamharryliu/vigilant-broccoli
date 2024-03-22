import os
import subprocess
import threading


class SpotifyToMp3Service:
    def __init__(
        self, output=os.environ.get("MUSIC_LIBRARY") or "~/Spotify_to_MP3_Downloads"
    ):
        print(f"'{output}' selected as output folder")
        self.output = output

    def download_playlists(self, playlists):
        threads = []
        for playlist in playlists:
            thread = threading.Thread(target=self.download_playlist, args=(playlist,))
            thread.start()
            threads.append(thread)
        for thread in threads:
            thread.join()

    def download_playlist(self, playlist):
        try:
            fname = SpotifyToMp3Service.convert_to_slug_case(playlist["name"])
            output = f"{self.output}/{fname}"

            output = os.path.expanduser(output)
            print(f"Downloading {output}")
            subprocess.run(
                ["spotdl", "download", playlist["url"], "--output", output], check=True
            )
            print(f"Playlist {playlist['name']} downloaded successfully.")
        except subprocess.CalledProcessError as e:
            print(f"Failed to download playlist {playlist['name']}. Error: {e}")

    @staticmethod
    def convert_to_slug_case(text):
        return "-".join(text.lower().split())
