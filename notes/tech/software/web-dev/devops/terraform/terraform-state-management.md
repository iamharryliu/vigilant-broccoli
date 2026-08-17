# Terraform State Management

```
# TerraformStateManager
{
	"Version": "2012-10-17",
	"Statement": [
		{
			"Sid": "FullS3Access",
			"Effect": "Allow",
			"Action": "s3:*",
			"Resource": [
				"arn:aws:s3:::mycompany-terraform-states-*",
			]
		}
	]
}
```
