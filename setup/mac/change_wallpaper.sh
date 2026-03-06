#!/bin/zsh

WALLPAPERS_DIR="$HOME/vigilant-broccoli/wallpapers"

echo "Select wallpaper:"
wallpapers=("$WALLPAPERS_DIR"/*)
i=1
for wallpaper in "${wallpapers[@]}"; do
    echo "$i. $(basename "$wallpaper")"
    i=$((i+1))
done
echo -n "Enter selection (1-${#wallpapers[@]}): "
read wallpaper_choice

WALLPAPER_PATH="${wallpapers[$wallpaper_choice]}"
WALLPAPER_NAME="$(basename "$WALLPAPER_PATH")"
DEST_PATH="$HOME/Pictures/$WALLPAPER_NAME"

echo "Select fill mode:"
echo "1. Fill Screen"
echo "2. Fit to Screen"
echo "3. Stretch to Fill Screen"
echo "4. Center"
echo -n "Enter selection (1-4): "
read fill_choice

case $fill_choice in
    1) scale_mode=3 ;;
    2) scale_mode=0 ;;
    3) scale_mode=1 ;;
    4) scale_mode=2 ;;
    *) scale_mode=3 ;;
esac

echo "Setting wallpaper to: $WALLPAPER_NAME"

cp "$WALLPAPER_PATH" "$DEST_PATH"

osascript <<EOF
use framework "AppKit"
use scripting additions

set scalingMode to current application's NSNumber's numberWithUnsignedInteger:$scale_mode
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

echo "Wallpaper changed successfully!"
