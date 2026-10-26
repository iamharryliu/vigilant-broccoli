# Docker Image

## Overview

- `nx run job-applications-next:docker:up` builds the app and skill workdir, then `docker compose up -d --build` with `docker-compose.yml`. `docker:down` and `docker:logs` wrap compose; in this repo `pnpm job-applications:docker:up` loads `CLAUDE_CODE_OAUTH_TOKEN` from Vault first and runs the `repo-files` configuration, which layers `docker-compose.repo-files.yml` to mount the resume lib's `resume.json` and `notes/personal/personal-software-career-experience.md` read-write
- The image (`node:24-bookworm-slim`) adds Claude Code, `@playwright/test` with Chromium and its system libraries, the skill workdir and the standalone Next.js server. It listens on 3000, published as `127.0.0.1:${JOB_APPLICATIONS_PORT:-4300}`
- No personal data is baked in: the build replaces the resume lib's `resume.json` with `templates/resume.json` in both bundles and excludes it from file tracing, and the Dockerfile copies only build output and `templates/`. The user's files arrive through the mounts

## Setup

1. Run `claude setup-token` and export `CLAUDE_CODE_OAUTH_TOKEN` in the shell that starts the container. Runs bill that Claude subscription
2. Optionally copy `.env.example` to `.env` next to the compose file and set:
   - `JOB_APPLICATIONS_DIR`: host folder for application folders, default `~/Desktop/Job Applications`
   - `CAREER_DIR`: host folder holding `career-experience.md` and `resume.json`. Unset, a `career` volume starts from the sample profile
   - `JOB_APPLICATIONS_MODEL`: Claude model for runs, default `sonnet`
   - `JOB_APPLICATIONS_PORT`: host port, default 4300
   - `JOB_APPLICATIONS_FRAME_ANCESTORS`: CSP `frame-ancestors` sources allowed to embed the app, default `'self'`. In this repo `docker-compose.repo-files.yml` adds `https://manager.vigilant-broccoli.app`
3. Run `nx run job-applications-next:docker:up` from `projects/nx-workspace` and open `http://localhost:4300`
4. Fill in the resume's name, email and contact details in the Resume section and the career experience in the Career experience section before the first run

## Using files with other names

`CAREER_DIR` expects the two default file names. To mount files kept elsewhere, add a `docker-compose.override.yml` next to the compose file:

```yaml
services:
  job-applications:
    environment:
      - CAREER_EXPERIENCE_PATH=/career-files/career-experience.md
      - RESUME_PATH=/career-files/resume.json
    volumes:
      - /path/to/my-career.md:/career-files/career-experience.md
      - /path/to/my-resume.json:/career-files/resume.json
```

The run's `--add-dir` covers the directories of both paths.

## Embedding and request checks

- `src/proxy.ts` sends `Content-Security-Policy: frame-ancestors <JOB_APPLICATIONS_FRAME_ANCESTORS>` on every page and refuses `POST`/`PUT`/`PATCH`/`DELETE` under `/api/` with 403 when `Sec-Fetch-Site` is not `same-origin` or `Origin` differs from the host (`X-Forwarded-Host` behind a proxy). The app has no login, so this is what stops another site's page from clearing a career file or starting a run; requests without either header (curl) pass
- In this repo the container is served at `https://job-hunt.vigilant-broccoli.app` by the local k3s ingress (`infrastructure/local`), which vb-manager-next's Job Hunt page embeds. Requests from inside the iframe are same-origin to that host, so they pass
