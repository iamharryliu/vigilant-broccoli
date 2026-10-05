#!/bin/bash
set -euo pipefail

BUNDLE=${1:?Usage: import-history.sh /absolute/path/history.bundle [owner/repository]}
REPOSITORY=${2:-iamharryliu/uptime}

if [[ ! "$REPOSITORY" =~ ^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$ ]] || [ "$(printf '%s' "$REPOSITORY" | tr '[:upper:]' '[:lower:]')" = iamharryliu/vigilant-broccoli ]; then
  echo "Choose a separate monitoring repository." >&2
  exit 1
fi
if [[ "$BUNDLE" != /* ]] || [ ! -f "$BUNDLE" ]; then
  echo "Provide an existing history bundle by absolute path." >&2
  exit 1
fi

IMPORT_DIR=$(mktemp -d)
trap 'rm -rf "$IMPORT_DIR"' EXIT
git clone --bare --quiet "https://github.com/${REPOSITORY}.git" "$IMPORT_DIR"
TARGET=$(git -C "$IMPORT_DIR" rev-parse refs/heads/main)
if [ -n "$(git -C "$IMPORT_DIR" ls-tree "$TARGET" history)" ]; then
  echo "Target already has history; refusing to overwrite monitoring data." >&2
  exit 1
fi
git -C "$IMPORT_DIR" fetch --quiet "$BUNDLE" refs/heads/main
HISTORY=$(git -C "$IMPORT_DIR" rev-parse FETCH_HEAD)
if [ "$(git -C "$IMPORT_DIR" ls-tree --name-only "$HISTORY")" != history ]; then
  echo "Bundle contains files outside history/; refusing to import it." >&2
  exit 1
fi
TREE=$({
  git -C "$IMPORT_DIR" ls-tree -z "$TARGET"
  git -C "$IMPORT_DIR" ls-tree -z "$HISTORY" history
} | git -C "$IMPORT_DIR" mktree -z)
COMMIT=$(git -C "$IMPORT_DIR" commit-tree "$TREE" -p "$TARGET" -p "$HISTORY" -m "ci(upptime): Import existing monitoring history.")
git -C "$IMPORT_DIR" push origin "${COMMIT}:refs/heads/main"
echo "Imported history into ${REPOSITORY}; configure and verify monitoring before cutover."
