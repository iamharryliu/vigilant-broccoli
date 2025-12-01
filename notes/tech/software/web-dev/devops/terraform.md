# Terraform

## Commands

```
terraform init
terraform init -upgrade
terraform init -migrate-state # Migrate to remote state handler.

terraform plan
terraform apply
terraform destroy
terraform ACTION -auto-approve

terraform fmt

terraform refresh
terraform output

ssh ubuntu@$(terraform output -raw instance_public_ip)
ssh ec2-user@$(terraform output -raw instance_public_ip)

# Comments
# This is a single-line comment using a hash
// This is a single-line comment using double slashes
resource "aws_s3_bucket" "my_bucket" {
  bucket = "my-company-bucket"  # Inline comment after code
}
/*
This is a multi-line comment
that spans multiple lines.
Useful for longer explanations.
*/
```

## Environment Handling

```
# Handle by variable files.
terraform COMMAND -var-file="dev.tfvars"
terraform apply -var-file="dev.tfvars"

# Handle by folder structure.
terraform/
  ├── modules/
  │   ├── vpc/
  │   └── ec2/
  ├── envs/
  │   ├── dev/
  │   │   ├── main.tf
  │   │   ├── variables.tf
  │   │   └── dev.tfvars
  │   └── prod/
  │       ├── main.tf
  │       ├── variables.tf
  │       └── prod.tfvars
  └── provider.tf
cd envs/dev
terraform init
```

## State Management

- Terraform State Manager

```

terraform {
  cloud {
    organization = "ORGANIZATION"

    workspaces {
      name = "NAME"
    }
  }
}

terraform {
  cloud {
    organization = "ORGANIZATION"

    workspaces {
      tags = ["TAG"]
    }
  }
}


terraform {
  backend "s3" {
    profile        = "PROFILE_NAME"
    bucket         = "BUCKET_NAME"
    key            = "BUCKET_PATH"
    region         = "REGION"
    use_lockfile   = true
    encrypt        = true
  }
}
```


- Review:
  - force_destroy
  - deletion_protection
  - lifecycle
  - `ssl: { rejectUnauthorized: false }`
