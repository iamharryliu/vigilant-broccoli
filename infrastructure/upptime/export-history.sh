#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SOURCE_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
OUTPUT=${1:?Usage: export-history.sh /absolute/path/history.bundle [source-ref]}
SOURCE_REF=${2:-HEAD}

if [[ "$OUTPUT" != /* ]] || [ -e "$OUTPUT" ]; then
  echo "Choose an absolute output path that does not already exist." >&2
  exit 1
fi
if [ "$(git -C "$SOURCE_ROOT" rev-parse --is-shallow-repository)" = true ]; then
  echo "Fetch the full source history before exporting." >&2
  exit 1
fi

EXPORT_DIR=$(mktemp -d)
trap 'rm -rf "$EXPORT_DIR"' EXIT
git init --bare --quiet --initial-branch=main "$EXPORT_DIR"
git -C "$SOURCE_ROOT" fast-export --refspec="${SOURCE_REF}:refs/heads/main" "$SOURCE_REF" -- history |
  git -C "$EXPORT_DIR" fast-import --quiet
git -C "$EXPORT_DIR" bundle create "$OUTPUT" refs/heads/main
echo "Exported history-only commits to $OUTPUT; source refs and working files were not changed."
