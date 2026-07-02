vswsls() {
    ls -1 "$WORKSPACES_DIR" | sed 's/\.code-workspace$//' | nl -ba | sed 's/^ *//;s/\t/   /'
}
vsws() {
    if [ -z "$1" ]; then
        code "$WORKSPACES_DIR"
    elif [ -f "$WORKSPACES_DIR/$1.code-workspace" ]; then
        code "$WORKSPACES_DIR/$1.code-workspace"
    else
        echo "Workspace '$1' not found"
    fi
}
vswsn() {
    local name
    name=$(ls -1 "$WORKSPACES_DIR" | sed 's/\.code-workspace$//' | sed -n "${1}p")
    vsws "$name"
}
