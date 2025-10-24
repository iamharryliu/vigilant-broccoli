# Terraform


```
terraform init
terraform plan
terraform apply
terraform destroy

terraform refresh
terraform output

ssh ubuntu@$(terraform output -raw instance_public_ip)    
ssh ec2-user@$(terraform output -raw instance_public_ip)    
```