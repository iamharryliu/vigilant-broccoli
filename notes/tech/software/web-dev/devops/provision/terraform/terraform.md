# Terraform

- [Terraform State Management](./terraform-state-management.md)

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

## Migrating Old Infra

- Use `import` blocks (not `terraform import`) to bring existing/manually-created infra under management — declarative, plannable, diffable in a PR.

```
import {
  to = aws_s3_bucket.my_bucket
  id = "my-company-bucket"
}
```

- `terraform plan -generate-config-out=generated.tf` scaffolds the resource block from the imported state.

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
