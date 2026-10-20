#!/bin/bash
# Syncs grafana-dashboards/*.json onto grafana-vm's persistent data volume,
# where Grafana's file provider rescans them every 30s. The repo is the source
# of truth: a dashboard whose file is removed here disappears from Grafana.
# Rerun after `pnpm grafana:replace` only if the data volume was also lost.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
TERRAFORM_DIR="$REPO_ROOT/infrastructure/terraform"
DASHBOARDS_DIR="$TERRAFORM_DIR/grafana-dashboards"
REMOTE_DIR=/mnt/observability/grafana/dashboards
# Grafana's container uid, matching the chown in cloud-init-grafana.yaml.
GRAFANA_UID=472

for f in "$DASHBOARDS_DIR"/*.json; do
  jq -e . "$f" >/dev/null || { echo "Invalid JSON: $f" >&2; exit 1; }
done

# Goes through oci-ssh.sh first for its stale known_hosts handling, and waits
# out cloud-init so a freshly replaced VM has its data volume mounted. `--wait`
# exits 2 on a `degraded done` boot, which still mounted fine; the findmnt
# guard below is what actually protects the root disk.
"$REPO_ROOT/scripts/shell/oci-ssh.sh" aws_grafana_public_ip 'cloud-init status --wait >/dev/null || true'

IP=$(cd "$TERRAFORM_DIR" && terraform output -raw aws_grafana_public_ip)
# Extract beside the live directory and swap, so the provider never scans a
# half-written set and treats the missing dashboards as deleted.
# COPYFILE_DISABLE and --no-xattrs keep macOS tar from packing ._* files
# Grafana would try to load, and xattr headers GNU tar warns about.
(cd "$DASHBOARDS_DIR" && COPYFILE_DISABLE=1 tar --no-xattrs -cf - ./*.json) |
  ssh -T -i ~/.ssh/id_ed25519 -o StrictHostKeyChecking=accept-new "ubuntu@$IP" "
    set -e
    findmnt -M /mnt/observability >/dev/null || { echo 'Data volume not mounted on grafana-vm' >&2; exit 1; }
    sudo rm -rf $REMOTE_DIR.new
    sudo mkdir -p $REMOTE_DIR.new
    sudo tar -C $REMOTE_DIR.new -xf -
    sudo chown -R $GRAFANA_UID:$GRAFANA_UID $REMOTE_DIR.new
    sudo rm -rf $REMOTE_DIR
    sudo mv $REMOTE_DIR.new $REMOTE_DIR
  "

echo "✓ Pushed $(ls "$DASHBOARDS_DIR"/*.json | wc -l | tr -d ' ') dashboards to grafana-vm; Grafana picks them up within 30s."
