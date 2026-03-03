source $HOME/vigilant-broccoli/setup/dotfiles/common/directory_variables.sh
source $HOME/vigilant-broccoli/setup/dotfiles/common/aliases/aliases.sh

load_aliases() {
  local dir="$1"
  find "$dir" -name "*.sh" -not -name "aliases.sh" | while read -r script; do
    source "$script"
  done
}

BASE_DIR=$DOTFILES_DIR/macos/aliases
for SUB_DIR in os devops network; do
  load_aliases "$BASE_DIR/$SUB_DIR"
done

alias cpsshpubkey='cat ~/.ssh/id_rsa.pub| pbcopy'

alarm() {
  if [ $# -lt 2 ]; then
    echo "Usage: alarm <minutes> <message>"
    return 1
  fi

  local minutes=$1
  shift
  local message="$*"

  (
    echo "Alarm set for $minutes minutes..."
    sleep $((minutes * 60))
    say "$message"
  ) &
}

alertinterval() {
  if [ -z "$1" ]; then
    echo "Usage: alertinterval <cron-interval|off>"
    echo "Example: alertinterval '*/15' (every 15 minutes)"
    echo "         alertinterval '0' (every hour)"
    echo "         alertinterval off (remove the alert)"
    return 1
  fi

  if [ "$1" = "off" ]; then
    crontab -l 2>/dev/null | grep -v 'say "the time is now' | crontab -
    echo "🛑 Alert cron job removed"
    return 0
  fi

  CRON_LINE="$1 * * * * /bin/bash -c 'say \"the time is now \$(date +\"\\%I:\\%M \\%p\")\"'"

  ( crontab -l 2>/dev/null | grep -v 'say "the time is now' ; echo "$CRON_LINE" ) | crontab -
  echo "✅ Cron updated: $CRON_LINE"
}

alias brewinit="brew bundle --file $MAC_SETUP_DIR/Brewfile"
alias setupdock=". $MAC_SETUP_DIR/setup_dock.sh"
alias setupmac=". $MAC_SETUP_DIR/setup_macos_preferences.sh"
alias toggledarkmode='osascript -e "tell application \"System Events\" to tell appearance preferences to set dark mode to not dark mode"'
