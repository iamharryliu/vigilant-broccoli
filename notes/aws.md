# AWS

## CLI

CLI requires AWS user access key, secrey access key, region.

### AWS

```
brew install awscli
aws configure
```

### Serverless

```
npm install -g serverless
serverless config credentials --provider aws --key [access-key] --secret [secret-access-key]
```

## EC2

```
chmod 400 [pemfile]
ssh -i [pemfile] [ec2-user]@[ec2-ip-address]
```

## Lambda

```
# package.json
"scripts": {
	...
	"build": "rimraf dist && tsc"
	...
}
```

```
import serverless from 'serverless-http';


	...express code...


export const handler = serverless(app);
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

```
npm i rimraf serverless-http
npm run build && serverless deploy
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
- [EC2 Server](https://www.youtube.com/watch?v=T-Pum2TraX4)
- [Node on Ubuntu](https://www.freecodecamp.org/news/how-to-install-node-js-on-ubuntu/)
- [Serverless API](https://dev.to/aws-builders/creating-a-serverless-api-using-aws-lambda-and-nodejs-with-typescript-and-expressjs-4kfk)
