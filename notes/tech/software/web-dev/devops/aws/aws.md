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
