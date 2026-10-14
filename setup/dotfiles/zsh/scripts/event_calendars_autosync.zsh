# Starts the Facebook event-calendar sync at most once per day, never blocking the shell.
_vb_event_calendars_autosync() {
  local data_dir="${VB_MANAGER_DATA_DIR:-$HOME/.vb-manager}"
  local stamp_file="$data_dir/event-calendars-sync.stamp"
  local lock_file="$data_dir/event-calendars-sync.pid"
  local today pid

  today=$(date +%F) || return 0
  [[ -r "$stamp_file" && "$(<"$stamp_file")" == "$today" ]] && return 0

  if [[ -r "$lock_file" ]]; then
    pid=$(<"$lock_file")
    [[ "$pid" == <-> ]] && ps -p "$pid" -o command= 2>/dev/null | grep -q sync-event-calendars && return 0
  fi

  mkdir -p "$data_dir" 2>/dev/null || return 0
  # Stamp before starting so an expired Facebook login is not retried by every new terminal.
  print -r -- "$today" >| "$stamp_file" 2>/dev/null
  (cd "$REPO_DIR" && nohup pnpm event-calendars:sync </dev/null >/dev/null 2>&1 &) >/dev/null 2>&1
  return 0
}

if [[ -o interactive ]]; then
  _vb_event_calendars_autosync
fi
unfunction _vb_event_calendars_autosync 2>/dev/null
