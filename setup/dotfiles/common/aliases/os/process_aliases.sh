killport() {
  [ -z "$1" ] && echo "Usage: killport <port>" && return 1
  lsof -ti :$1 | xargs -r kill -9
}
