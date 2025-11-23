import os
import shutil
import subprocess
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class DefaultConfig:
    output = "~/Spotify_to_MP3_Downloads"
    parallel_downloads = 20


class SpotifyToMp3Service:
    def __init__(
        self,
        output=DefaultConfig.output,
        parallel_downloads=DefaultConfig.parallel_downloads,
    ):
        self.output = output
        self.parallel_downloads = parallel_downloads

    def download_playlists(self, playlists):
        output_path = os.path.expanduser(self.output)

        # Clean up old playlists that are no longer in the list
        if os.path.exists(output_path):
            for dir_name in os.listdir(output_path):
                dir_path = os.path.join(output_path, dir_name)
                if dir_name not in [
                    playlist["name"] for playlist in playlists
                ] and os.path.isdir(dir_path):
                    shutil.rmtree(dir_path)

        with ThreadPoolExecutor(max_workers=self.parallel_downloads) as executor:
            futures = {
                executor.submit(self.download_playlist, playlist): playlist
                for playlist in playlists
            }
            for future in as_completed(futures):
                playlist = futures[future]
                try:
                    future.result()
                except Exception as e:
                    logger.error(
                        f"Error downloading playlist '{playlist['name']}': {e}"
                    )

        logger.info("All playlist downloads completed")

    def download_playlist(self, playlist):
        playlist_name = playlist["name"]
        try:
            output = f"{self.output}/{playlist_name}"
            output = os.path.expanduser(output)
            subprocess.run(
                ["spotdl", "download", playlist["url"], "--output", f"{output}"],
                check=True,
                capture_output=True,
                text=True,
            )

            logger.info(f"Successfully downloaded playlist '{playlist_name}'")

        except subprocess.CalledProcessError as e:
            error_msg = e.stderr if e.stderr else str(e)
            logger.error(f"Failed to download playlist '{playlist_name}': {error_msg}")

        except Exception as e:
            logger.error(
                f"Unexpected error downloading playlist '{playlist_name}': {type(e).__name__}: {e}"
            )

    @staticmethod
    def convert_to_slug_case(text):
        return "-".join(text.lower().split())
