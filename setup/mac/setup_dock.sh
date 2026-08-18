defaults write com.apple.dock persistent-apps -array
defaults write com.apple.dock persistent-others -array
dockutil --add "/System/Applications/System Settings.app" --no-restart
dockutil --add "/Applications/iTerm.app" --no-restart
dockutil --add "/Applications/Google Chrome.app" --no-restart
defaults write com.apple.dock show-recents -bool false
defaults write com.apple.dock orientation -string right
defaults write com.apple.dock autohide -bool true
killall Dock
