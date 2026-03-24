#!/bin/bash
set -euo pipefail

TIMESTAMP=$(date -u +%Y-%m-%d)
BACKUP_DIR="$HOME/resilio-sync/backup/vb-repo"
FILENAME="vb-repo-$TIMESTAMP.zip"

mkdir -p "$BACKUP_DIR"

curl -sL -o "$BACKUP_DIR/$FILENAME" https://github.com/iamharryliu/vigilant-broccoli/archive/refs/heads/main.zip

echo "✓ Repo backed up to $BACKUP_DIR/$FILENAME"
