# AWS

- [EC2](./ec2.md)
- [Lambda](./lambda.md)
- [S3](./s3.md)

```
brew install awscli
aws configure

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

## References

- [IAM User](https://www.youtube.com/watch?v=HuE-QhrmE1c)
- [Deploy an App](https://www.youtube.com/watch?v=lczXbbUG3DE)
