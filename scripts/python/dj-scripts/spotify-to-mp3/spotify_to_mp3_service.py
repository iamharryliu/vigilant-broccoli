import os
import re
import shutil
import time
import subprocess
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass

LOG_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "logs")
LOG_FILE = os.path.join(LOG_DIR, "dldjmusic.log")
os.makedirs(LOG_DIR, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(), logging.FileHandler(LOG_FILE)],
)
logger = logging.getLogger(__name__)


REMOVED_DIR_NAME = ".removed"

SPOTDL_YT_DLP_ARGS = "--extractor-args youtube:player_client=web_embedded"
# spotdl exits 0 even when individual tracks fail; the error is followed by the track's URL.
SPOTDL_FAILED_TRACK_PATTERN = re.compile(r"AudioProviderError[^\n]*\n\s*(https?://\S+)")


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

        # Stale folders are parked in REMOVED_DIR_NAME rather than deleted, so a
        # name mismatch (e.g. a trailing space) cannot lose a library.
        if os.path.exists(output_path):
            removed_path = os.path.join(output_path, REMOVED_DIR_NAME)
            playlist_names = [playlist["name"] for playlist in playlists]
            for dir_name in os.listdir(output_path):
                dir_path = os.path.join(output_path, dir_name)
                if (
                    dir_name != REMOVED_DIR_NAME
                    and dir_name not in playlist_names
                    and os.path.isdir(dir_path)
                ):
                    os.makedirs(removed_path, exist_ok=True)
                    destination = os.path.join(
                        removed_path, f"{dir_name}.{int(time.time())}"
                    )
                    logger.warning(
                        f"Moving playlist folder no longer listed: '{dir_name}' -> '{destination}'"
                    )
                    shutil.move(dir_path, destination)

        results = []
        with ThreadPoolExecutor(max_workers=self.parallel_downloads) as executor:
            futures = {
                executor.submit(self.download_playlist, playlist): playlist
                for playlist in playlists
            }
            for future in as_completed(futures):
                playlist = futures[future]
                try:
                    results.append(future.result())
                except Exception as e:
                    logger.error(
                        f"Error downloading playlist '{playlist['name']}': {e}"
                    )
                    results.append(
                        {"name": playlist["name"], "failed_tracks": [], "error": str(e)}
                    )

        failed = [r for r in results if r["error"] or r["failed_tracks"]]
        logger.info(
            f"All playlist downloads completed: {len(results) - len(failed)}/{len(results)} playlists clean (log: {LOG_FILE})"
        )
        for result in sorted(failed, key=lambda r: r["name"]):
            logger.error(
                f"FAILED '{result['name']}': "
                f"{len(result['failed_tracks'])} failed tracks {result['failed_tracks']}"
                f"{' error: ' + result['error'] if result['error'] else ''}"
            )
        return failed

    def download_playlist(self, playlist):
        playlist_name = playlist["name"]
        try:
            output = f"{self.output}/{playlist_name}"
            output = os.path.expanduser(output)
            logger.info(f"Downloading '{playlist_name}'...")
            result = subprocess.run(
                [
                    "spotdl",
                    "download",
                    playlist["url"],
                    "--output",
                    f"{output}",
                    "--yt-dlp-args",
                    SPOTDL_YT_DLP_ARGS,
                ],
                check=True,
                capture_output=True,
                text=True,
            )

            failed_tracks = SPOTDL_FAILED_TRACK_PATTERN.findall(
                result.stdout + result.stderr
            )
            if failed_tracks:
                logger.error(
                    f"Downloaded playlist '{playlist_name}' with {len(failed_tracks)} failed tracks: {failed_tracks}"
                )
            else:
                logger.info(f"Successfully downloaded playlist '{playlist_name}'")
            return {
                "name": playlist_name,
                "failed_tracks": failed_tracks,
                "error": None,
            }

        except subprocess.CalledProcessError as e:
            error = e.stderr or e.stdout or str(e)
            logger.error(f"Failed '{playlist_name}': {error}")
            return {"name": playlist_name, "failed_tracks": [], "error": error}

    @staticmethod
    def convert_to_slug_case(text):
        return "-".join(text.lower().split())
