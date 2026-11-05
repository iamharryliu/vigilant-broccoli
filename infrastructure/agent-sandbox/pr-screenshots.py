#!/usr/bin/env python3
"""Copy selected captures before committing, then render commit-pinned PR images."""

import argparse
import hashlib
import html
import json
from pathlib import Path
import subprocess

CAPTURE_DIR = Path("projects/nx-workspace/screenshots")
ASSET_DIR = Path(".github/pr-screenshots")
PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--prepare", action="store_true")
    parser.add_argument("--metadata", type=Path)
    parser.add_argument("paths", nargs="*")
    args = parser.parse_args()
    paths = args.paths
    if args.metadata:
        metadata = (
            json.loads(args.metadata.read_text()) if args.metadata.exists() else {}
        )
        paths = metadata.get("pr_screenshots", [])
    if not isinstance(paths, list) or any(not isinstance(p, str) for p in paths):
        parser.error("pr_screenshots must be an array of screenshot paths")
    root = Path(
        subprocess.check_output(
            ["git", "rev-parse", "--show-toplevel"], text=True
        ).strip()
    )
    capture_root = (root / CAPTURE_DIR).resolve()
    captures = []
    for value in dict.fromkeys(paths):
        source = (root / value).resolve()
        if not source.is_relative_to(capture_root) or source.suffix != ".png":
            parser.error(f"Screenshot must be a PNG inside {CAPTURE_DIR}: {value}")
        data = source.read_bytes()
        if not data.startswith(PNG_SIGNATURE):
            parser.error(f"Invalid PNG screenshot: {value}")
        asset = ASSET_DIR / f"{hashlib.sha256(data).hexdigest()}.png"
        captures.append((source.name, asset, data))
    if args.prepare:
        for _, asset, data in captures:
            destination = root / asset
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_bytes(data)
        return
    if not captures:
        return
    commit = subprocess.check_output(
        ["git", "rev-parse", "HEAD"], cwd=root, text=True
    ).strip()
    images = []
    for name, asset, data in captures:
        committed = subprocess.check_output(
            ["git", "show", f"{commit}:{asset.as_posix()}"], cwd=root
        )
        if committed != data:
            parser.error(f"Screenshot differs from committed asset: {name}")
        label = html.escape(name, quote=True)
        url = f"../blob/{commit}/{asset.as_posix()}?raw=true"
        images.append(f'<p>{label}</p>\n\n<img alt="{label}" src="{url}" width="720">')
    print("\n\n".join(images))


if __name__ == "__main__":
    main()
