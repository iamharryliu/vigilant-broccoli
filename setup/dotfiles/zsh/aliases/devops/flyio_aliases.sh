alias flydashboard='chrome "https://fly.io/dashboard"'
alias flyBilling='chrome "https://fly.io/dashboard/personal/billing"'

# Apps
alias flyls='fly apps list'
# Create and Destroy
alias flylaunch='fly launch'
alias flydeploy='fly deploy --ha=false'
alias flyopen='fly apps open --app'
function flyrestart() {
    if [[ $# -eq 0 ]]; then
        flyctl apps restart
    else
        flyctl apps restart "$1"
    fi
}
alias flyadestroy='fly apps destroy'
# Machines
alias flymstart='flyctl machine start'
alias flymstop='flyctl machine stop '
alias flymdestroy='flyctl machine destroy'
# Logs
function flylogs() {
    if [[ $# -eq 0 ]]; then
        flyctl logs
    else
        flyctl logs --app "$1"
    fi
}
function flymonitor() {
    if [ -z "$1" ]; then
        echo "Usage: fly-monitor <app_name>"
        return 1
    fi
    open "https://fly.io/apps/$1/monitoring"
}
# SSH
function flyssh() {
    if [[ $# -eq 0 ]]; then
        flyctl ssh console
    else
        flyctl ssh console --app "$1"
    fi
}
function flyrssh() {
    if [[ $# -eq 0 ]]; then
        flyrestart
        flyssh
    else
        flyrestart "$1"
        flyssh "$1"
    fi
}
# Secrets
alias deployflyiosecrets='cd $PROJECTS_DIR/secrets-manager && python flyio_secrets_manager.py'
# Postgres
alias flysqlconn='flyctl postgres connect --app'
alias flysqlproxy='flyctl proxy 5432 --app'
alias connectsql='flyctl postgres connect --app testsql'
alias servesql='flyctl proxy 5432 --app testsql'
# Token
alias flycreatetoken='flyctl tokens create deploy --app'
