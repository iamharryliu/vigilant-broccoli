import argparse
import json
import os
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path

import spotipy
from dotenv import load_dotenv

from spotify_auth import PLAYLIST_READ_SCOPE, build_spotify_client

load_dotenv()

BACKUP_SCOPE = f"{PLAYLIST_READ_SCOPE} user-library-read"
DEFAULT_OUTPUT_DIR = Path.home() / "resilio-sync" / "backup" / "spotify"
KEEP_BACKUPS = 5
PAGE_SIZE = 50


def paginate(sp, first_page):
    page = first_page
    while page:
        yield from page.get("items") or []
        page = sp.next(page) if page.get("next") else None


def spotify_url(obj):
    return ((obj or {}).get("external_urls") or {}).get("spotify")


def build_track(entry):
    # Newer Web API responses may name the wrapped object "item" instead of "track".
    track = entry.get("track") or entry.get("item")
    if not track:
        return None
    is_local = bool(track.get("is_local") or entry.get("is_local"))
    result = {
        "added_at": entry.get("added_at"),
        "name": track.get("name"),
        "uri": track.get("uri"),
        "url": spotify_url(track),
        "artists": [a.get("name") for a in track.get("artists") or []],
        "album": (track.get("album") or {}).get("name"),
        "duration_ms": track.get("duration_ms"),
    }
    isrc = (track.get("external_ids") or {}).get("isrc")
    if isrc:
        result["isrc"] = isrc
    if is_local:
        result["is_local"] = True
    return result


def build_tracks(sp, first_page):
    tracks = (build_track(entry) for entry in paginate(sp, first_page) if entry)
    return [t for t in tracks if t]


def build_playlist(sp, playlist):
    owner = playlist.get("owner") or {}
    result = {
        "id": playlist.get("id"),
        "name": playlist.get("name"),
        "description": playlist.get("description"),
        "owner": {"id": owner.get("id"), "display_name": owner.get("display_name")},
        "public": playlist.get("public"),
        "collaborative": playlist.get("collaborative"),
        "snapshot_id": playlist.get("snapshot_id"),
        "url": spotify_url(playlist),
    }
    try:
        result["tracks"] = build_tracks(
            sp, sp.playlist_items(playlist["id"], limit=PAGE_SIZE)
        )
    except spotipy.SpotifyException as e:
        result["error"] = f"HTTP {e.http_status}: {e.msg}"
        result["tracks"] = []
    return result


def build_library(sp, now=None):
    now = now or datetime.now(timezone.utc)
    user = sp.current_user()
    playlists = [
        build_playlist(sp, p)
        for p in paginate(sp, sp.current_user_playlists(limit=PAGE_SIZE))
        if p
    ]
    return {
        "exported_at": now.isoformat(timespec="seconds"),
        "user": {"id": user.get("id"), "display_name": user.get("display_name")},
        "playlists": playlists,
        "liked_songs": build_tracks(sp, sp.current_user_saved_tracks(limit=PAGE_SIZE)),
    }


def write_atomically(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp_name = tempfile.mkstemp(
        dir=path.parent, prefix=f".{path.name}.", suffix=".tmp"
    )
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            f.write("\n")
        os.replace(tmp_name, path)
    except BaseException:
        Path(tmp_name).unlink(missing_ok=True)
        raise


def prune(output_dir: Path, keep: int = KEEP_BACKUPS) -> None:
    backups = sorted(
        output_dir.glob("spotify-library-*.json"),
        key=lambda p: p.stat().st_mtime,
        reverse=True,
    )
    for old in backups[keep:]:
        old.unlink()


def main() -> None:
    parser = argparse.ArgumentParser(description="Back up the Spotify library as JSON")
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR)
    args = parser.parse_args()

    library = build_library(build_spotify_client(scope=BACKUP_SCOPE))
    date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    path = args.output_dir / f"spotify-library-{date}.json"
    write_atomically(path, library)
    prune(args.output_dir)
    print(f"✓ Spotify library backed up to {path}")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"Spotify backup failed: {e}", file=sys.stderr)
        sys.exit(1)
