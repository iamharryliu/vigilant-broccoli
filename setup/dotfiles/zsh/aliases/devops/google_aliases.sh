# Google Cloud
alias gconsole='chrome "https://console.cloud.google.com/"'
alias gce='chrome "https://console.cloud.google.com/compute/"'
sshgceec2() {
    ssh -i ~/.ssh/google-ec2 "$GOOGLE_EC2_HOST_ADDRESS"
}

# Analytics
alias ganalytics='chrome "https://analytics.google.com/analytics/"'
alias gcaptcha='chrome "https://www.google.com/recaptcha/admin/"'

# Google Workspace APIs
alias gam="~/bin/gam/gam"
alias gyb="~/bin/gyb/gyb"
