# AWS

- [EC2](./ec2.md)
- [Lambda](./lambda.md)
- [S3](./s3.md)

```
brew install awscli


aws configure
aws configure sso

aws sso login

vim ~/.aws/credentials

[default]
aws_access_key_id = aws_access_key_id
aws_secret_access_key = aws_secret_access_key

[PROFILE_NAME]
aws_access_key_id = aws_access_key_id
aws_secret_access_key = aws_secret_access_key+5ohcwpDH7fYiRCQN8OCxlar

aws sts get-caller-identity --profile PROFILE_NAME

aws iam list-users
```

| Term           | Description                                                                                                                                                      |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Security Group | A virtual firewall for your EC2 instances (and other resources like RDS, Lambda in VPCs, etc.). It controls what traffic is allowed in and out of your resource. |

## `~/.aws/config` vs `~/.aws/credentials`

|                | `credentials`               | `config`                                         |
| -------------- | --------------------------- | ------------------------------------------------ |
| Purpose        | Auth secrets (keys, tokens) | Settings & behavior (region, output, roles, SSO) |
| Profile header | `[profile-name]`            | `[profile profile-name]` (except `[default]`)    |
| SDK reads      | Always                      | Always                                           |

Precedence: env vars > `~/.aws/credentials` > `~/.aws/config`

## IAM credentials for automation

SSO (`aws sso login`) issues short-lived credentials, so anything non-interactive — Terraform, CI, a cron — has to re-auth. An IAM user with an access key is the long-lived alternative, and since env vars win the precedence order above, exporting `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` overrides any profile without touching `~/.aws`.

```
aws iam create-access-key --user-name USER_NAME --profile PROFILE_NAME

aws iam list-attached-user-policies --user-name USER_NAME
aws iam list-user-policies --user-name USER_NAME
```

Rotating means two keys at once: create the second, swap consumers over, verify, then delete the first — an IAM user can hold two access keys precisely to make that overlap possible.

## Free Tier

| Resource                           | Free tier                                                   |
| ---------------------------------- | ----------------------------------------------------------- |
| IAM users, groups, roles, policies | Always free, no cap                                         |
| IAM access keys                    | Always free; 2 per user (a hard limit, not a free-tier one) |
| IAM Identity Center (SSO)          | Always free                                                 |
