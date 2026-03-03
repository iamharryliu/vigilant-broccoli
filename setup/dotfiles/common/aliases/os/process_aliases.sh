killport() {
  [ -z "$1" ] && echo "Usage: killport <port>" && return 1
  local pids=$(lsof -ti :$1)
  [ -n "$pids" ] && echo "$pids" | xargs kill -9
}
