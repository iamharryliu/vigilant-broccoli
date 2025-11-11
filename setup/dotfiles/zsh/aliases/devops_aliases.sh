alias openmail="code /var/mail/$(whoami)"
alias clearmail="echo '' > /var/mail/$(whoami)"
load_aliases ~/shell-aliases/devops/

alias cronguru="chrome 'https://crontab.guru/'"

alias tfinit="terraform init"
alias tfplan="terraform plan"
alias tfapply="terraform apply"
alias tfdestroy="terraform destroy"

alias tfapplydev="terraform apply -var-file=dev.tfvars"
alias tfdestroydev="terraform destroy -var-file=dev.tfvars"

alias tfapplyprod="terraform apply -var-file=prod.tfvars"
alias tfdestroyprod="terraform destroy -var-file=prod.tfvars"

alias tfoutput="terraform output"

alias openlocalvault="open 'https://127.0.0.1:8200'"