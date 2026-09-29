source $HOME/vigilant-broccoli/setup/dotfiles/common/directory_variables.sh
source $HOME/vigilant-broccoli/setup/dotfiles/common/aliases/aliases.sh

load_aliases() {
  local dir="$1"
  find "$dir" -name "*.sh" -not -name "aliases.sh" | while read -r script; do
    source "$script"
  done
}

BASE_DIR=$DOTFILES_DIR/macos/aliases
for SUB_DIR in devops; do
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

# Homebrew
alias brewinit="brew bundle install --file=$MAC_SETUP_DIR/Brewfile"
alias brewup="brew update && brew upgrade && brew cleanup --prune=all"
# `brew bundle install --cleanup` is disabled in Homebrew 7 and `brew bundle cleanup` is only a
# dry run without --force, so sync spells out both halves. --no-npm (here and in brewdump) keeps
# `brew bundle` off global npm packages, which are tracked in npmfile instead.
alias brewsync="brew update && brew bundle install --file=$MAC_SETUP_DIR/Brewfile && brew bundle cleanup --force --no-npm --file=$MAC_SETUP_DIR/Brewfile && brew cleanup --prune=all"
alias brewdump="brew bundle dump --force --no-npm --file=$MAC_SETUP_DIR/Brewfile"
alias pushbrew="cdvb && git add $MAC_SETUP_DIR/Brewfile && gc feat brew 'Update Brewfile.' && gpush"

# npm global
# npmfile is authoritative, mirroring the Brewfile: npminit installs what it lists and npmsync
# removes what it does not, so a stray `npm i -g` gets pruned instead of absorbed by npmdump.
# Both readers share _npmglobals so they can never disagree about what counts as installed.
# npmdump shipped as an alias in earlier revisions; zsh refuses to define a function whose name
# is a live alias, so a shell predating that change cannot re-source this file without the unalias.
unalias npmdump npmsync 2>/dev/null || true

_npmglobals() {
  npm list -g --depth=0 --json \
    | python3 -c 'import json,sys; pkgs=json.load(sys.stdin).get("dependencies",{}); [print(k) for k in pkgs if k not in ("npm","corepack")]'
}

alias npminit="xargs npm install -g < $MAC_SETUP_DIR/npmfile"

# Redirecting straight at npmfile would truncate it before npm runs, leaving it empty on failure.
npmdump() {
  local tmpfile
  tmpfile=$(mktemp) || return 1
  if _npmglobals > "$tmpfile"; then
    mv "$tmpfile" "$MAC_SETUP_DIR/npmfile"
  else
    rm -f "$tmpfile"
    return 1
  fi
}

npmsync() {
  [ -r "$MAC_SETUP_DIR/npmfile" ] || { echo "npmfile not found at $MAC_SETUP_DIR/npmfile" >&2; return 1; }
  local installed extras
  installed=$(_npmglobals) || return 1
  extras=$(comm -23 <(printf '%s\n' "$installed" | LC_ALL=C sort) <(LC_ALL=C sort "$MAC_SETUP_DIR/npmfile"))
  if [ -z "$extras" ]; then
    echo "npmfile is in sync; no extra global packages."
    return 0
  fi
  echo "Uninstalling globals not in npmfile:"
  printf '%s\n' "$extras" | sed 's/^/  /'
  printf '%s\n' "$extras" | xargs npm uninstall -g
}
alias pushnpm="cdvb && git add $MAC_SETUP_DIR/npmfile && gc feat npm 'Update npmfile.' && gpush"
alias depsdump="brewdump && npmdump"
alias pushdeps="depsdump && cdvb && git add $MAC_SETUP_DIR/Brewfile $MAC_SETUP_DIR/npmfile && gc feat deps 'Update Brewfile and npmfile.' && gpush"

# Desktop Setup
alias setupdock=". $MAC_SETUP_DIR/setup_dock.sh"
alias setupdockstacks=". $MAC_SETUP_DIR/setup_dock_stacks.sh"
alias setupmac=". $MAC_SETUP_DIR/setup_macos_preferences.sh"
alias toggledarkmode='osascript -e "tell application \"System Events\" to tell appearance preferences to set dark mode to not dark mode"'
alias changewallpaper="$MAC_SETUP_DIR/change_wallpaper.sh"
