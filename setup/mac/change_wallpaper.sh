#!/bin/zsh

WALLPAPERS_DIR="$HOME/vigilant-broccoli/personal/wallpapers"
BUILD_WALLPAPER="${0:A:h}/build_wallpaper.js"
APPLY_WALLPAPER_TO_ALL_SPACES="${0:A:h}/apply_wallpaper_to_all_spaces.js"
# The fill mode and background are rendered into the HEIC, so NSWorkspace only needs to fill.
NSWORKSPACE_FILL_SCALE_MODE=3

wallpapers=("$WALLPAPERS_DIR"/*)

select_wallpaper() {
    local i=1
    echo "Select $1 wallpaper:" >&2
    for wallpaper in "${wallpapers[@]}"; do
        echo "$i. $(basename "$wallpaper")" >&2
        i=$((i+1))
    done
    echo -n "Enter selection (1-${#wallpapers[@]}): " >&2
    read choice
    echo "${wallpapers[$choice]}"
}

select_fill_mode() {
    echo "Select $1 fill mode:" >&2
    echo "1. Fill Screen" >&2
    echo "2. Fit to Screen" >&2
    echo "3. Stretch to Fill Screen" >&2
    echo "4. Center" >&2
    echo -n "Enter selection (1-4): " >&2
    read choice
    case $choice in
        2) echo fit ;;
        3) echo stretch ;;
        4) echo center ;;
        *) echo fill ;;
    esac
}

echo "Select wallpaper type:"
echo "1. Single"
echo "2. Light/Dark (follows system appearance)"
echo -n "Enter selection (1-2): "
read type_choice

if [[ $type_choice == 2 ]]; then
    LIGHT_PATH="$(select_wallpaper light)"
    light_fill_mode="$(select_fill_mode light)"
    DARK_PATH="$(select_wallpaper dark)"
    dark_fill_mode="$(select_fill_mode dark)"
    wallpaper_kind=dynamic
    WALLPAPER_NAME="${${LIGHT_PATH:t}:r}-$light_fill_mode-${${DARK_PATH:t}:r}-$dark_fill_mode.heic"
    build_args=("$LIGHT_PATH" "$light_fill_mode" "$DARK_PATH" "$dark_fill_mode")
else
    WALLPAPER_PATH="$(select_wallpaper)"
    fill_mode="$(select_fill_mode)"
    WALLPAPER_NAME="${${WALLPAPER_PATH:t}:r}-$fill_mode.heic"
    build_args=("$WALLPAPER_PATH" "$fill_mode")
fi

DEST_PATH="$HOME/Pictures/$WALLPAPER_NAME"
osascript -l JavaScript "$BUILD_WALLPAPER" "$DEST_PATH" "${build_args[@]}" || exit 1

echo "Setting wallpaper to: $WALLPAPER_NAME"

osascript <<EOF
use framework "AppKit"
use scripting additions

set scalingMode to current application's NSNumber's numberWithUnsignedInteger:$NSWORKSPACE_FILL_SCALE_MODE
set dictObjects to {scalingMode}
set dictKeys to {current application's NSWorkspaceDesktopImageScalingKey}
set options to current application's NSDictionary's alloc's initWithObjects:dictObjects forKeys:dictKeys

set imageURL to current application's NSURL's fileURLWithPath:"$DEST_PATH"
set screens to current application's NSScreen's screens()
set workspace to current application's NSWorkspace's sharedWorkspace()

repeat with aScreen in screens
    workspace's setDesktopImageURL:imageURL forScreen:aScreen options:options |error|:(missing value)
end repeat
EOF

# WallpaperAgent persists the new entry asynchronously; copy it only once it exists.
sleep 2
osascript -l JavaScript "$APPLY_WALLPAPER_TO_ALL_SPACES" "$DEST_PATH" $wallpaper_kind || exit 1
killall WallpaperAgent

echo "Wallpaper changed successfully!"
