DOCK_STACKS_DIR="$HOME/Dock Stacks"

STACKS=(Development Leisure Social Tools Utility)

declare -a DEVELOPMENT_APPS=(
    "/Applications/Bruno.app"
    "/Applications/DB Browser for SQLite.app"
    "/Applications/DBeaver.app"
    "/Applications/Docker.app"
    "/Applications/Godot.app"
    "/Applications/iTerm.app"
    "/Applications/Visual Studio Code.app"
    "/Applications/VMware Fusion.app"
    "/Applications/Wireshark.app"
)

declare -a LEISURE_APPS=(
    "/Applications/OpenEmu.app"
    "/Applications/rekordbox 7/rekordbox.app"
    "/Applications/Spotify.app"
    "/Applications/Steam.app"
)

declare -a SOCIAL_APPS=(
    "/System/Applications/Contacts.app"
    "/System/Applications/FaceTime.app"
    "/Applications/WeChat.app"
    "/Applications/WhatsApp.app"
)

declare -a TOOLS_APPS=(
    "/Applications/AltTab.app"
    "/Applications/AppCleaner.app"
    "/Applications/balenaEtcher.app"
    "/Applications/Dropzone 4.app"
    "/Applications/Handy.app"
    "/Applications/Little Snitch.app"
    "/Applications/Raycast.app"
)

declare -a UTILITY_APPS=(
    "/Applications/Bitwarden.app"
    "/System/Applications/Books.app"
    "/System/Applications/FindMy.app"
    "/Applications/Firefox.app"
    "/Applications/Google Chrome.app"
    "/Applications/NordVPN.app"
    "/Applications/Safari.app"
    "/System/Applications/System Settings.app"
)

create_alias() {
    local source_path="$1"
    local alias_dir="$2"
    local alias_name
    alias_name=$(basename "$source_path" .app)

    if [ ! -e "$source_path" ]; then
        echo "WARNING: $source_path not found, skipping"
        return
    fi

    osascript -e "
        tell application \"Finder\"
            make new alias file at (POSIX file \"$alias_dir\" as alias) to (POSIX file \"$source_path\" as alias)
            set name of result to \"$alias_name\"
        end tell
    " > /dev/null 2>&1
    echo "  $alias_name"
}

create_stack() {
    local stack_name="$1"
    shift
    local apps=("$@")
    local stack_dir="$DOCK_STACKS_DIR/$stack_name"

    mkdir -p "$stack_dir"
    echo "Creating $stack_name stack..."
    for app in "${apps[@]}"; do create_alias "$app" "$stack_dir"; done

    dockutil --remove "$stack_name" --no-restart 2>/dev/null
    dockutil --add "$stack_dir" --sort name --display stack --no-restart
}

rm -rf "$DOCK_STACKS_DIR"

create_stack "Development" "${DEVELOPMENT_APPS[@]}"
create_stack "Leisure" "${LEISURE_APPS[@]}"
create_stack "Social" "${SOCIAL_APPS[@]}"
create_stack "Tools" "${TOOLS_APPS[@]}"
create_stack "Utility" "${UTILITY_APPS[@]}"

killall Dock
echo "Dock stacks setup complete"
