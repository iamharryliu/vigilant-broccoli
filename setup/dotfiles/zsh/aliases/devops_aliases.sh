alias pingtest='ping google.com'

# Open Mail
alias openmail="code /var/mail/$(whoami)"
alias emptymail="echo '' > /var/mail/$(whoami)"

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

# Node
alias initnpm='rm -rf node_modules package-lock.json && npm i'
alias initnpmserve='initnpm && npm run serve'
alias mynpmpackages='open -a "Google Chrome" "https://www.npmjs.com/settings/prettydamntired/packages"'
alias installall='npm run install-all'

# Postgres
alias startbrewsql='brew services start postgresql'
alias stopbrewsql='brew services stop postgresql'
alias sqlstatus='pg_isready -h localhost -p 5432'

# MongoDB
alias mongodashboard='open -a "Google Chrome" "https://cloud.mongodb.com/v2/"'

# AWS
alias awsauto="aws --cli-auto-prompt"
alias startec2="aws ec2 start-instances --instance-ids $ec2_instance"
alias stopec2="aws ec2 stop-instances --instance-ids $ec2_instance"
alias sshec2="ssh -i ~/certs/ec2-instance.pem $ec2_instance_username_ip_address"

# Wrangler
alias wranglerls='npx wrangler pages project list'
alias wranglerdeploy='npx wrangler pages deploy'
alias wranglerdelete='npx wrangler pages delete'
# R2
alias r2ls='npx wrangler r2 bucket list'
alias r2create='npx wrangler r2 bucket create'
alias r2delete='npx wrangler r2 bucket delete'
function r2clear() {
    aws s3 rm "s3://$1" --endpoint-url "https://$CLOUDFLARE_ID.r2.cloudflarestorage.com" --recursive
}

# FlyIO
alias flydashboard='open -a "Google Chrome" "https://fly.io/dashboard"'
alias flyscalecount='flyctl scale count'
alias flylogs='flyctl logs --app'

alias flyls='fly apps list'
alias flydeploy='fly deploy --ha=false'
alias flyopen='fly apps open --app'
alias flydestroy='fly apps destroy'
alias flystatus='flyctl status --app'
alias flymachinestatus='flyctl machine status'
alias flystartmachine='flyctl machine start --app'
alias flystopmachine='flyctl machine stop --app'
alias flyrestartmachine='flyctl machine restart --app'
alias flyset='~/shell-aliases/set_fly_secret.sh'
alias flyunset='~/shell-aliases/unset_fly_secret.sh'
alias flysecretsls='flyctl secrets list'
function flymonitor() {
    if [ -z "$1" ]; then
        echo "Usage: fly-monitor <app_name>"
        return 1
    fi
    open "https://fly.io/apps/$1/monitoring"
}
alias flyssh='if [ "$#" -eq 1 ]; then fly ssh console --app $1; else fly ssh console; fi'
alias flycreatetoken='flyctl tokens create deploy --app'
# Postgres
alias flysqlconn='flyctl postgres connect --app'
alias flysqlproxy='flyctl proxy 5432 --app'
alias flysqlconntest='flyctl postgres connect --app testsql'
alias flysqlstarttest='flyctl proxy 5432 --app testsql'


# NX
alias nxbuild="cdnx && nx build --skip-nx-cache"
alias nxdeploy="cdnx && nx deploy --skip-nx-cache"
alias nxbuildall="cdnx nx run-many -t=build"
alias nxdeployall="cdnx nx run-many -t=deploy"

# Analytics
alias openanalytics='open -a "Google Chrome" "https://analytics.google.com/analytics/web/#/p433700665/reports/reportinghub"'
