# Google Cloud
alias gconsole='chrome "https://console.cloud.google.com/"'
alias gce='chrome "https://console.cloud.google.com/compute/"'
sshvbinstance() {
    gcloud compute ssh --zone "us-east1-b" "vb-free-vm" --project "vigilant-broccoli"
}

# Analytics
alias ganalytics='chrome "https://analytics.google.com/analytics/"'
alias gcaptcha='chrome "https://www.google.com/recaptcha/admin/"'

# Google Workspace APIs
alias gam="~/bin/gam/gam"
alias gyb="~/bin/gyb/gyb"
