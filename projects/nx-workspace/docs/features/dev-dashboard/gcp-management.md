# GCP Management

## Overview

- Dev dashboard card in `vb-manager-next`
- Reads auth state via `gcloud` CLI

## Features

- Lists authenticated accounts; active account highlighted green
- Reauth detection — shows yellow `⚠️ Reauth` badge with copy button for `gcloud auth login && gcloud auth application-default login`
- Switch active account
- Lists all GCP projects; current project highlighted green
- Switch active project
- Expand per project for console quick-links: Dashboard, Secrets, Buckets, GCE, Cloud SQL, Credentials
- Polls every 30s

## API

- `GET /api/gcloud/auth-status` — accounts + active account + current project
- `GET /api/gcloud/projects` — list all projects
- `GET /api/gcloud/reauth-needed` — check if active account needs reauth
- `POST /api/gcloud/set-account` — switch active account
- `POST /api/gcloud/set-project` — switch active project
