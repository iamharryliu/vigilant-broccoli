#!/usr/bin/env bash
#
# Backs up Gmail mailboxes for a list of addresses into a local directory,
# one subfolder per address, using GYB (Got Your Back) via a Google
# Workspace service account (domain-wide delegation). Re-running is
# incremental — GYB only fetches messages new since the last backup for
# each folder.
#
# Setup:
#   1. Install GYB: https://github.com/GAM-team/got-your-back
#   2. Add the addresses you want to back up to the EMAILS array below.
#
# Usage:
#   ./backup-emails.sh [output-dir]
#
# Defaults:
#   output-dir: ~/Desktop/gmail-backup

set -euo pipefail

# One Gmail address per line. Leave empty and the script will just error
# out with a reminder to configure it.
EMAILS=(
  # "someone@example.com"
)

OUTPUT_DIR="${1:-$HOME/Desktop/gmail-backup}"

if command -v gyb >/dev/null 2>&1; then
  GYB_BIN="gyb"
elif [ -x "$HOME/bin/gyb/gyb" ]; then
  GYB_BIN="$HOME/bin/gyb/gyb"
else
  echo "ERROR: gyb binary not found (checked PATH and \$HOME/bin/gyb/gyb)." >&2
  exit 1
fi

if [ "${#EMAILS[@]}" -eq 0 ]; then
  echo "ERROR: no addresses configured. Add them to the EMAILS array at the top of this script." >&2
  exit 1
fi

mkdir -p "$OUTPUT_DIR"

total=0
fail_count=0

for raw_email in "${EMAILS[@]}"; do
  email="$(echo "$raw_email" | xargs)"
  [ -z "$email" ] && continue
  [[ "$email" == \#* ]] && continue

  total=$((total + 1))
  dest="$OUTPUT_DIR/$email"
  echo "==> Backing up $email to $dest"
  if "$GYB_BIN" --email "$email" --action backup --service-account --local-folder "$dest"; then
    echo "==> Done: $email"
  else
    echo "==> FAILED: $email" >&2
    fail_count=$((fail_count + 1))
  fi
done

echo
echo "Backup complete: $((total - fail_count))/$total succeeded."
[ "$fail_count" -eq 0 ]
