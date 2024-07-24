# Dock
defaults write com.apple.dock persistent-apps -array
defaults write com.apple.dock persistent-others -array
dockutil --add "/System/Applications/System Settings.app"
dockutil --add "/System/Applications/Utilities/Terminal.app"
dockutil --add "/Applications/Mail.app"
dockutil --add "/Applications/Google Chrome.app"
dockutil --add "/Applications/Visual Studio Code.app"
dockutil --add "/Applications/Obsidian.app"
dockutil --add "/Applications/Messages.app"
dockutil --add "/Applications/FaceTime.app"
dockutil --add "/Applications/WhatsApp.app"
dockutil --add "/Applications/Slack.app"
dockutil --add "/Applications/Spotify.app"
dockutil --add "/Applications/NordVPN.app"
dockutil --add "/Applications/AppCleaner.app"
defaults write com.apple.dock show-recents -bool false
defaults write com.apple.dock orientation -string right
defaults write com.apple.dock autohide -bool true
killall Dock

# Trackpad
defaults write -g com.apple.swipescrolldirection -bool false

# Hot Corners
defaults write com.apple.dock wvous-tl-corner -int 12
defaults write com.apple.dock wvous-tl-modifier -int 0
defaults write com.apple.dock wvous-tr-corner -int 2
defaults write com.apple.dock wvous-tr-modifier -int 0
defaults write com.apple.dock wvous-bl-corner -int 13
defaults write com.apple.dock wvous-bl-modifier -int 0
defaults write com.apple.dock wvous-br-corner -int 4
defaults write com.apple.dock wvous-br-modifier -int 0
