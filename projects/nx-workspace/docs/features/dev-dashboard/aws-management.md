# AWS Management

## Overview

- Dev dashboard card in `vb-manager-next`
- Reads profiles from `~/.aws/config`
- Fetches identity via `aws sts get-caller-identity` per profile (parallel, 5s timeout)

## Features

- Lists all profiles (`[default]` and `[profile ...]` sections; ignores `[sso-session ...]`)
- SSO detection via `sso_session` or `sso_start_url` keys — shows blue `SSO` badge
- SSO expiry detection via `sts` error messages — shows yellow `⚠️ SSO Expired` badge
- Expand per profile to see: region, `sso_account_id`, `sso_role_name`, ARN
- Console quick-links per profile: IAM, S3, EC2, RDS, Secrets (region-aware)
- `export AWS_PROFILE` copy button on each profile row
- Polls every 30s

## API

- `GET /api/aws/profiles` — parse config + enrich with STS identity
