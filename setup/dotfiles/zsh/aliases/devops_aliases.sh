# Open Mail
alias openmail="code /var/mail/$(whoami)"
alias clearmail="echo '' > /var/mail/$(whoami)"

# Port
killport() {
  if [ -z "$1" ]; then
    echo "Usage: killport <port>"
    return 1
  fi

  local port="$1"
  local pid=$(lsof -t -i :$port)

  if [ -z "$pid" ]; then
    echo "No process found on port $port"
  else
    echo "Killing process $pid running on port $port"
    kill -9 "$pid"
  fi
}

dir=~/shell-aliases/devops/
find "$dir" -name "*.sh" | while read -r script; do
  source "$script"
done
