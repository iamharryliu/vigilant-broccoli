# GCP
gcloudlogin() {
    if [ -z "$1" ]; then
        echo "Usage: gcloudlogin <project>"
        echo "Example: gcloudlogin vigilant-broccoli"
        return 1
    fi
    gcloud auth login && gcloud config set project "$1" && gcloud auth application-default login
}

# Google Workspace APIs
alias gam="~/bin/gam/gam"
alias gyb="~/bin/gyb/gyb"
