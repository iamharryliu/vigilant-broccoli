import argparse
import json
from download_music import get_spotify_playlists

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Get Spotify playlists as JSON"
    )
    parser.add_argument(
        "--filter",
        "-f",
        type=str,
        default="",
        help="Filter playlists by description.",
    )
    args = parser.parse_args()

    playlists = get_spotify_playlists(description_filter=args.filter)
    print(json.dumps(playlists))
