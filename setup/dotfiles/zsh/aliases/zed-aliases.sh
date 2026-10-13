fzfzed() {
    local filepath
    filepath=$(fzf) || return
    [ -n "$filepath" ] && zed "$filepath"
}

zedwsls() {
    vswsls
}

zedws() {
    if [ -z "$1" ]; then
        zed "$REPO_DIR"
        return
    fi

    local workspace="$WORKSPACES_DIR/$1.code-workspace"
    if [ ! -f "$workspace" ]; then
        echo "Workspace '$1' not found" >&2
        return 1
    fi

    python3 - "$workspace" <<'PY'
import json
import subprocess
import sys
from pathlib import Path

workspace = Path(sys.argv[1])
folders = json.loads(workspace.read_text())["folders"]
paths = [str((workspace.parent / folder["path"]).resolve()) for folder in folders]
if not paths:
    sys.exit("Workspace has no folders")
sys.exit(subprocess.call(["zed", "--new", *paths]))
PY
}

zedwsn() {
    if ! [[ "$1" =~ ^[1-9][0-9]*$ ]]; then
        echo "Usage: zedwsn <positive workspace number>" >&2
        return 1
    fi
    local name
    name=$(ls -1 "$WORKSPACES_DIR" | sed 's/\.code-workspace$//' | sed -n "${1}p")
    if [ -z "$name" ]; then
        echo "Workspace number '$1' not found" >&2
        return 1
    fi
    zedws "$name"
}
