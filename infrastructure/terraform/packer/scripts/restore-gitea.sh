#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/../../../config.sh"

BACKUP_BUCKET="gs://vigilant-broccoli-backup"

# Source: a local path, a gs:// URI, or nothing (latest gitea-backup-*.zip in GCS).
SOURCE="$1"
if [ -z "$SOURCE" ]; then
  SOURCE=$(gcloud storage ls "${BACKUP_BUCKET}/gitea-backup-*.zip" | sort | tail -1)
  echo "Using latest backup: ${SOURCE}"
fi

case "$SOURCE" in
  gs://*)
    DUMP_ZIP=$(mktemp -t gitea-dump.XXXXXX.zip)
    trap 'rm -f "$DUMP_ZIP"' EXIT
    echo "Downloading ${SOURCE}..."
    gcloud storage cp "$SOURCE" "$DUMP_ZIP"
    ;;
  *)
    DUMP_ZIP="$SOURCE"
    ;;
esac

if [ -z "$DUMP_ZIP" ] || [ ! -f "$DUMP_ZIP" ]; then
  echo "Usage: restore-gitea.sh [<gitea-dump.zip> | gs://.../dump.zip]"
  echo "  No arg restores the latest gitea-backup-*.zip from ${BACKUP_BUCKET}."
  exit 1
fi

# Hostname is Cloudflare-proxied, so SSH targets the VM's real IP.
GITEA_IP=$(cd "${SCRIPT_DIR}/../../" && terraform output -raw oci_gitea_public_ip)
GITEA_SSH="ubuntu@${GITEA_IP}"
SSH_OPTS="-i $HOME/.ssh/id_ed25519 -o StrictHostKeyChecking=accept-new -o ConnectTimeout=15"

echo "Uploading dump to Gitea VM (${GITEA_IP})..."
scp $SSH_OPTS "$DUMP_ZIP" "${GITEA_SSH}:/tmp/gitea-dump.zip"

echo "Restoring (stops Gitea, replaces data + repos + config, restarts)..."
# gitea dump zip layout: app.ini (root), data/ (= APP_DATA_PATH, incl. gitea.db),
# repos/<owner>/ (bare repos). data/ maps to /mnt/gitea-data/gitea, repos/ to
# /mnt/gitea-data/git/repositories. The SQLite gitea.db in data/ is used as-is.
ssh $SSH_OPTS "$GITEA_SSH" 'bash -s' <<'REMOTE'
set -e
LIVE_REPOS=/mnt/gitea-data/git/repositories
PRIOR_REPOS="${LIVE_REPOS}.prerestore.$(date -u +%Y%m%d%H%M%S)"

sudo docker stop gitea
sudo rm -rf /tmp/gitea-restore && sudo mkdir -p /tmp/gitea-restore
sudo python3 -m zipfile -e /tmp/gitea-dump.zip /tmp/gitea-restore

# A corrupt zip fails the extract above, but one that extracts cleanly can still
# be the wrong shape — a dump taken with --skip-repository, or a layout change in
# a future Gitea. The live tree is the only other copy of these repos, so every
# piece is checked before anything live is touched.
for required in repos data app.ini; do
  if [ ! -e "/tmp/gitea-restore/${required}" ]; then
    echo "Dump is missing ${required} — refusing to restore." >&2
    exit 1
  fi
done
if [ -z "$(sudo ls -A /tmp/gitea-restore/repos)" ]; then
  echo "Dump carries no repositories — refusing to restore." >&2
  exit 1
fi

# Moved aside rather than deleted, and dropped only once the copy lands, so a
# failure part-way through leaves the previous repositories recoverable.
if [ -d "$LIVE_REPOS" ]; then
  sudo mv "$LIVE_REPOS" "$PRIOR_REPOS"
fi
sudo mkdir -p "$LIVE_REPOS" /mnt/gitea-data/gitea/conf
if ! sudo cp -a /tmp/gitea-restore/repos/. "$LIVE_REPOS"/; then
  echo "Repository copy failed — rolling back." >&2
  sudo rm -rf "$LIVE_REPOS"
  if [ -d "$PRIOR_REPOS" ]; then
    sudo mv "$PRIOR_REPOS" "$LIVE_REPOS"
  fi
  exit 1
fi
if ! sudo cp -a /tmp/gitea-restore/data/. /mnt/gitea-data/gitea/ ||
  ! sudo cp -a /tmp/gitea-restore/app.ini /mnt/gitea-data/gitea/conf/app.ini; then
  echo "Data/config copy failed. Previous repositories kept at ${PRIOR_REPOS}." >&2
  exit 1
fi

# Before the chown so it doesn't walk the old tree as well.
sudo rm -rf "$PRIOR_REPOS"
sudo chown -R 1000:1000 /mnt/gitea-data
sudo rm -rf /tmp/gitea-restore /tmp/gitea-dump.zip
sudo docker start gitea
REMOTE

echo "Waiting for Gitea to become healthy..."
for i in $(seq 1 24); do
  status=$(ssh $SSH_OPTS "$GITEA_SSH" 'sudo docker inspect --format "{{.State.Health.Status}}" gitea' 2>/dev/null || echo "")
  [ "$status" = "healthy" ] && echo "✓ Gitea restored and healthy" && exit 0
  sleep 5
done
echo "⚠ Gitea did not report healthy in time — check logs: pnpm gitea:ssh"
exit 1
