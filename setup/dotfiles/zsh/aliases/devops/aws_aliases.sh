alias awsauto="aws --cli-auto-prompt"
alias startec2="aws ec2 start-instances --instance-ids $ec2_instance"
alias stopec2="aws ec2 stop-instances --instance-ids $ec2_instance"
alias sshec2="ssh -i ~/certs/ec2-instance.pem $ec2_instance_username_ip_address"
# Billing
alias openAWSBilling='chrome "https://us-east-1.console.aws.amazon.com/costmanagement/home?region=us-east-1#/home"'
