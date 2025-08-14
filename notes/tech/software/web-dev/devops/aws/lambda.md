# Lambda

## Serverless CLI

```
npm install -g serverless
serverless config credentials --provider aws --key [access-key] --secret [secret-access-key]
```

## Setup and Deploy

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

## References

- [Serverless API](https://dev.to/aws-builders/creating-a-serverless-api-using-aws-lambda-and-nodejs-with-typescript-and-expressjs-4kfk)
