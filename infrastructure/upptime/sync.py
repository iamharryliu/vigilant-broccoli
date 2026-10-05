#!/usr/bin/env python3
"""Publish an allowlist through the Git database API without checking out the target."""

import argparse
import base64
import hashlib
import json
import os
from pathlib import Path
import re
import time
from urllib.error import HTTPError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "infrastructure/upptime"
API_URL = "https://api.github.com"
DEFAULT_REPOSITORY = "iamharryliu/uptime"
SOURCE_REPOSITORY = "iamharryliu/vigilant-broccoli"
BRANCH = "main"
MAX_ATTEMPTS = 3
RETRY_DELAY = 2
STATUS_START = "<!--start: status pages-->"
STATUS_END = "<!--end: status pages-->"
MANAGED_FILES = {
    ".github/workflows/cron-upptime.yml": "workflows/cron-upptime.yml",
    ".github/workflows/cron-upptime-response-time.yml": "workflows/cron-upptime-response-time.yml",
    "scripts/warm-fly.sh": "warm-fly.sh",
    "README.md": "monitoring-readme.md",
    "scripts/graphs/package.json": "graphs/package.json",
    "scripts/graphs/package-lock.json": "graphs/package-lock.json",
}


def validate_repository(repository):
    if not re.fullmatch(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+", repository):
        raise ValueError("Expected an owner/repository name")
    if repository.lower() == SOURCE_REPOSITORY.lower():
        raise ValueError("Monitoring must use a separate repository")
    return repository


def managed_files(repository):
    owner, repo = validate_repository(repository).split("/")
    config = (ROOT / ".upptimerc.yml").read_text()
    for key, value in (("owner", owner), ("repo", repo)):
        config, count = re.subn(rf"^{key}:.*$", f"{key}: {value}", config, flags=re.M)
        if count != 1:
            raise ValueError(f"Expected exactly one {key} in .upptimerc.yml")
    files = {".upptimerc.yml": config, ".nvmrc": (ROOT / ".nvmrc").read_text()}
    files.update(
        {
            target: (SOURCE / source)
            .read_text()
            .replace("@MONITORING_REPOSITORY@", repository)
            for target, source in MANAGED_FILES.items()
        }
    )
    return files


def blob_sha(content):
    data = content.encode()
    return hashlib.sha1(f"blob {len(data)}\0".encode() + data).hexdigest()


def request(token, repository, method, path, payload=None):
    data = json.dumps(payload).encode() if payload is not None else None
    req = Request(
        f"{API_URL}/repos/{repository}/{path}",
        data=data,
        method=method,
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "Content-Type": "application/json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "vigilant-broccoli-upptime-sync",
        },
    )
    with urlopen(req, timeout=30) as response:
        return json.load(response)


def preserve_status(template, current):
    if STATUS_START in current and STATUS_END in current:
        status = current.split(STATUS_START, 1)[1].split(STATUS_END, 1)[0]
        return (
            template.split(STATUS_START, 1)[0]
            + STATUS_START
            + status
            + STATUS_END
            + template.split(STATUS_END, 1)[1]
        )
    return template


def publish(repository, token):
    files = managed_files(repository)
    ref_path = f"git/ref/heads/{BRANCH}"
    for attempt in range(MAX_ATTEMPTS):
        parent = request(token, repository, "GET", ref_path)["object"]["sha"]
        commit = request(token, repository, "GET", f"git/commits/{parent}")
        tree_sha = commit["tree"]["sha"]
        tree = request(token, repository, "GET", f"git/trees/{tree_sha}?recursive=1")
        if tree.get("truncated"):
            raise ValueError("Target tree is truncated; refusing an incomplete sync")
        entries = {entry["path"]: entry for entry in tree["tree"]}
        desired = files.copy()
        readme = entries.get("README.md")
        if readme and readme["type"] == "blob" and readme["mode"] == "100644":
            blob = request(token, repository, "GET", f"git/blobs/{readme['sha']}")
            current = base64.b64decode(blob["content"]).decode()
            desired["README.md"] = preserve_status(desired["README.md"], current)
        changes = [
            {"path": path, "mode": "100644", "type": "blob", "content": content}
            for path, content in desired.items()
            if entries.get(path, {}).get("sha") != blob_sha(content)
            or entries.get(path, {}).get("mode") != "100644"
        ]
        if not changes:
            print("Monitoring configuration is already current.")
            return
        new_tree = request(
            token,
            repository,
            "POST",
            "git/trees",
            {"base_tree": tree_sha, "tree": changes},
        )
        new_commit = request(
            token,
            repository,
            "POST",
            "git/commits",
            {
                "message": "ci(upptime): Sync managed monitoring configuration.",
                "tree": new_tree["sha"],
                "parents": [parent],
            },
        )
        try:
            request(
                token,
                repository,
                "PATCH",
                f"git/refs/heads/{BRANCH}",
                {"sha": new_commit["sha"], "force": False},
            )
        except HTTPError as error:
            if error.code not in (409, 422) or attempt == MAX_ATTEMPTS - 1:
                raise
            if request(token, repository, "GET", ref_path)["object"]["sha"] == parent:
                raise
            print("Monitoring advanced during sync; retrying from its latest commit.")
            time.sleep(RETRY_DELAY)
            continue
        print(
            f"Published {len(changes)} managed files to {repository} at {new_commit['sha']}."
        )
        return


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--repository", default=os.environ.get("UPPTIME_REPOSITORY", DEFAULT_REPOSITORY)
    )
    parser.add_argument(
        "--render",
        type=Path,
        help="Render managed files locally without credentials or network calls",
    )
    args = parser.parse_args()
    repository = validate_repository(args.repository)
    if args.render:
        destination = args.render.resolve()
        if destination == ROOT or ROOT in destination.parents:
            raise ValueError("Render into a directory outside the source repository")
        destination.mkdir(parents=True, exist_ok=True)
        if any(destination.iterdir()):
            raise ValueError("Render directory must be empty")
        for name, content in managed_files(repository).items():
            path = destination / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content)
        print(f"Rendered managed monitoring files in {destination}.")
        return
    publish(repository, os.environ["GH_TOKEN"])


if __name__ == "__main__":
    main()
