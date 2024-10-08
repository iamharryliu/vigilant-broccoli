import os
import shutil
import subprocess
import threading


class SpotifyToMp3Service:
    def __init__(
        self, output=os.environ.get("MUSIC_LIBRARY") or "~/Spotify_to_MP3_Downloads"
    ):
        self.output = output

    def download_playlists(self, playlists):
        for dir_name in os.listdir(os.path.expanduser(self.output)):
            dir_path = os.path.join(self.output, dir_name)
            if dir_name not in [
                playlist["name"] for playlist in playlists
            ] and os.path.isdir(os.path.expanduser(dir_path)):
                shutil.rmtree(os.path.expanduser(dir_path))
        threads = []
        for playlist in playlists:
            thread = threading.Thread(target=self.download_playlist, args=(playlist,))
            thread.start()
            threads.append(thread)
        for thread in threads:
            thread.join()

    def download_playlist(self, playlist):
        try:
            output = f"{self.output}/{playlist['name']}"
            output = os.path.expanduser(output)
            subprocess.run(
                ["spotdl", "download", playlist["url"], "--output", f"{output}"],
                check=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
        except subprocess.CalledProcessError as e:
            pass
            # print(f"Failed to download playlist {playlist['name']}. Error: {e}")

    @staticmethod
    def convert_to_slug_case(text):
        return "-".join(text.lower().split())
