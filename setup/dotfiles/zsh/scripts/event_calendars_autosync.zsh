# Starts the Facebook event-calendar sync at most once per day, never blocking the shell.
_vb_event_calendars_autosync() {
  local data_dir="${VB_MANAGER_DATA_DIR:-$HOME/.vb-manager}"
  local stamp_file="$data_dir/event-calendars-sync.stamp"
  local attempt_file="$data_dir/event-calendars-sync.attempt"
  local lock_file="$data_dir/event-calendars-sync.pid"
  local log_file="$data_dir/event-calendars-sync.log"
  # Matches LOGIN_REQUIRED_EXIT_CODE in scripts/sync-event-calendars.ts.
  local login_required_exit_code=3
  local retry_interval_seconds=3600
  local today now last_attempt pid

  today=$(date +%F) || return 0
  [[ -r "$stamp_file" && "$(<"$stamp_file")" == "$today" ]] && return 0

  now=$(date +%s) || return 0
  if [[ -r "$attempt_file" ]]; then
    last_attempt=$(<"$attempt_file")
    [[ "$last_attempt" == <-> ]] && (( now - last_attempt < retry_interval_seconds )) && return 0
  fi

  if [[ -r "$lock_file" ]]; then
    pid=$(<"$lock_file")
    [[ "$pid" == <-> ]] && ps -p "$pid" -o command= 2>/dev/null | grep -q sync-event-calendars && return 0
  fi

  mkdir -p "$data_dir" 2>/dev/null || return 0
  # Stamp before starting so concurrent new terminals do not start a second run.
  print -r -- "$today" >| "$stamp_file" 2>/dev/null
  print -r -- "$now" >| "$attempt_file" 2>/dev/null
  # Any failure but an expired Facebook login clears the day stamp, so the next
  # new shell retries once the hourly attempt window has passed.
  (
    trap '' HUP
    cd "$REPO_DIR" && pnpm event-calendars:sync
    local exit_code=$?
    (( exit_code == 0 || exit_code == login_required_exit_code )) || rm -f "$stamp_file"
  ) </dev/null >>"$log_file" 2>&1 &!
  return 0
}

if [[ -o interactive ]]; then
  _vb_event_calendars_autosync
fi
unfunction _vb_event_calendars_autosync 2>/dev/null
