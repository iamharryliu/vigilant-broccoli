# AWS

## Lambda

```
npm install -g serverless
```

```
npm i serverless-http
serverless config credentials --provider aws --key [access-key] --secret [secret-access-key]
serverless deploy
```

```
# serverless.yaml
service: nodejs-aws-lambda
provider:
  name: aws
  runtime: nodejs18.x
functions:
  app:
    handler: dist/app.handler
    events:
      - http: ANY /
      - http: ANY /{proxy+}
```

## S3

### Permissions

```
{
	"Version": "2012-10-17",
	"Statement": [
		{
			"Sid": "PublicReadGetObject",
			"Effect": "Allow",
			"Principal": "*",
			"Action": "s3:GetObject",
			"Resource": "arn:aws:s3:::bucketname/*"
		}
	]
}
```

## References

- [IAM User](https://www.youtube.com/watch?v=HuE-QhrmE1c)
