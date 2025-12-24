import os
import argparse
import json
from spotify_to_mp3_service import SpotifyToMp3Service
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from dotenv import load_dotenv

load_dotenv()


def get_spotify_playlists(
    description_filter="",
    client_id=os.environ.get("SPOTIFY_CLIENT_ID"),
    client_secret=os.environ.get("SPOTIFY_CLIENT_SECRET"),
) -> list[dict]:

    redirect_uri = "http://127.0.0.1:8888/callback"

    sp = spotipy.Spotify(
        auth_manager=SpotifyOAuth(
            client_id=client_id,
            client_secret=client_secret,
            redirect_uri=redirect_uri,
            scope="playlist-read-private playlist-read-collaborative",
        )
    )

    all_playlists = []
    results = sp.current_user_playlists(limit=50)

    while results:
        for playlist in results["items"]:
            all_playlists.append(playlist)
        if results["next"]:
            results = sp.next(results)
        else:
            break

    playlists = [
        {"name": p["name"], "url": p["external_urls"]["spotify"]}
        for p in all_playlists
        if not description_filter
        or (
            p.get("description")
            and description_filter.lower() in p["description"].lower()
        )
    ]
    return playlists


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Download Spotify playlists as MP3 files"
    )
    parser.add_argument(
        "--filter",
        "-f",
        type=str,
        default="",
        help="Filter playlists by description.",
    )
    parser.add_argument(
        "--playlists",
        type=str,
        help="JSON string of playlists to download (overrides --filter)",
    )
    parser.add_argument(
        "--output",
        "-o",
        type=str,
        default="~/Spotify_to_MP3_Downloads",
        help="Output directory for downloaded playlists (default: ~/Spotify_to_MP3_Downloads)",
    )
    parser.add_argument(
        "--parallel",
        "-p",
        type=int,
        default=20,
        help="Number of parallel downloads (default: 20)",
    )
    args = parser.parse_args()

    # Use provided playlists JSON if available, otherwise fetch from Spotify
    if args.playlists:
        playlists = json.loads(args.playlists)
    else:
        playlists = get_spotify_playlists(description_filter=args.filter)

    service = SpotifyToMp3Service(output=args.output, parallel_downloads=args.parallel)
    service.download_playlists(playlists)


if __name__ == "__main__":
    main()
