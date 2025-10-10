# AWS

- [EC2](./ec2.md)
- [Lambda](./lambda.md)
- [S3](./s3.md)

## CLI

CLI requires AWS user access key, secrey access key, region.

### AWS CLI

Setup and Configuration

```
brew install awscli
aws configure
```

Commands

```
aws iam list-users
```

## References

- [IAM User](https://www.youtube.com/watch?v=HuE-QhrmE1c)
- [Deploy an App](https://www.youtube.com/watch?v=lczXbbUG3DE)

| Term           | Description                                                                                                                                                      |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Security Group | A virtual firewall for your EC2 instances (and other resources like RDS, Lambda in VPCs, etc.). It controls what traffic is allowed in and out of your resource. |
