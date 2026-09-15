# The IAM user whose long-lived access key Terraform and the aws CLI authenticate
# with (TF_AWS_ACCESS_KEY_ID / TF_AWS_SECRET_ACCESS_KEY in Vault). The user and
# its policy attachments are managed here; the access key deliberately is not,
# since an aws_iam_access_key resource would put the secret in Terraform Cloud
# state. AdministratorAccess covers iam:CreateAccessKey/DeleteAccessKey, so the
# key can be rotated from the CLI without ever opening the console.
#
# One AWS-managed policy rather than the four that used to be attached
# (IAMFullAccess, a custom ec2:*, a dead S3/DynamoDB backend policy from before
# state moved to Terraform Cloud, and an inline k8s leftover). That set was
# already equivalent to administrator -- iam:* lets the user attach
# AdministratorAccess to itself -- while still being too narrow to manage
# anything outside EC2 and IAM. This states the same power plainly and covers
# the whole account.
#
# The tradeoff is deliberate: the Vault-held key is now the account's most
# valuable credential. Break-glass if it is ever lost or deleted is
# TF_VAR_aws_profile=AdministratorAccess-841376026547, which swaps the provider
# onto SSO -- the one thing this user cannot bootstrap for itself.

locals {
  terraform_iam_user = "terraform-testing"
}

resource "aws_iam_user" "terraform" {
  name = local.terraform_iam_user

  # Dropping this resource from config would otherwise destroy the user and with
  # it the access key Terraform authenticates with.
  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_iam_user_policy_attachment" "terraform_admin" {
  user       = aws_iam_user.terraform.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
}

# Makes Terraform authoritative over the full attachment set rather than only
# the attachments it declares -- this is what detaches the superseded policies.
resource "aws_iam_user_policy_attachments_exclusive" "terraform" {
  user_name   = aws_iam_user.terraform.name
  policy_arns = [aws_iam_user_policy_attachment.terraform_admin.policy_arn]
}

# Same idea for inline policies, of which there should be none.
resource "aws_iam_user_policies_exclusive" "terraform" {
  user_name    = aws_iam_user.terraform.name
  policy_names = []
}
