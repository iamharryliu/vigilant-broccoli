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

echo "Setting wallpaper to: $(basename "$WALLPAPER_PATH")"

osascript -e "tell application \"System Events\" to tell every desktop to set picture to \"$WALLPAPER_PATH\""

echo "Wallpaper changed successfully!"
