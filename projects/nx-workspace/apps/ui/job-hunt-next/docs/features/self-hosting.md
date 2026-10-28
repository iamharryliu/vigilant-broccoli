# Self-Hosting

Run the job-hunt-next resume and cover-letter tailoring app from the `iamharryliu/job-hunt-next` image.

## Table of Contents

- [Run from Registry](#run-from-registry)
- [Environment Variables](#environment-variables)
- [Run from Source](#run-from-source)
- [Using Files with Other Names](#using-files-with-other-names)
- [Embedding and Request Checks](#embedding-and-request-checks)
- [Nuances](#nuances)

## Run from Registry

The image is `linux/amd64` only (arm64 hosts such as Apple Silicon run it under emulation), listens on port 3000 and runs as the non-root `node` user. Run `claude setup-token` first; runs bill that Claude subscription.

```
docker run -d --name job-hunt-next --init --restart unless-stopped \
  --platform linux/amd64 \
  -p 127.0.0.1:4300:3000 \
  -e CLAUDE_CODE_OAUTH_TOKEN=<token> \
  -v "$HOME/Desktop/Job Applications:/data" \
  -v job-hunt-career:/career \
  -v job-hunt-state:/state \
  iamharryliu/job-hunt-next:latest
```

Open `http://localhost:4300` and fill in the resume's name, email and contact details and the career experience before the first run. Mount a folder at `/career` instead of the `job-hunt-career` volume to use your own `career-experience.md` and `resume.json`; the volume starts from the sample profile.

## Environment Variables

| Variable                   | Required | Description                                                                   |
| -------------------------- | -------- | ----------------------------------------------------------------------------- |
| `CLAUDE_CODE_OAUTH_TOKEN`  | Yes      | Token from `claude setup-token` that the Claude Code runs authenticate with.  |
| `JOB_HUNT_FRAME_ANCESTORS` | No       | CSP `frame-ancestors` sources allowed to embed the app; defaults to `'self'`. |
| `JOB_HUNT_MODEL`           | No       | Claude model for runs; defaults to `sonnet`.                                  |

## Run from Source

- `nx run job-hunt-next:docker:up` builds the app and skill workdir, then `docker compose up -d --build` with `docker-compose.yml`. `docker:down` and `docker:logs` wrap compose; in this repo `pnpm job-hunt:docker:up` loads `CLAUDE_CODE_OAUTH_TOKEN` from Vault first and runs the `repo-files` configuration, which layers `docker-compose.repo-files.yml` to mount the resume lib's `resume.json` and `notes/personal/personal-software-career-experience.md` read-write
- Copy `.env.example` to `.env` next to the compose file to set `JOB_APPLICATIONS_DIR` (host folder for application folders, default `~/Desktop/Job Applications`), `CAREER_DIR` (host folder holding `career-experience.md` and `resume.json`; unset, a `career` volume starts from the sample profile), `JOB_HUNT_PORT` (host port, default 4300), `JOB_HUNT_MODEL` and `JOB_HUNT_FRAME_ANCESTORS`. In this repo `docker-compose.repo-files.yml` adds `https://manager.vigilant-broccoli.app` to the frame ancestors
- The image (`node:24-bookworm-slim`) adds Claude Code, `@playwright/test` with Chromium and its system libraries, the skill workdir and the standalone Next.js server
- `deploy` (on every push to `main` that affects the app or its libs) and `deploy:production` push the image to Docker Hub through `deploy-container`, tagged `latest` and the commit SHA. `deploy-container` first runs `check-personal-data`, which fails if the resume lib's owner email or phone appears in the build output the image copies

## Using Files with Other Names

`CAREER_DIR` expects the two default file names. To mount files kept elsewhere, add a `docker-compose.override.yml` next to the compose file:

```yaml
services:
  job-hunt:
    environment:
      - CAREER_EXPERIENCE_PATH=/career-files/career-experience.md
      - RESUME_PATH=/career-files/resume.json
    volumes:
      - /path/to/my-career.md:/career-files/career-experience.md
      - /path/to/my-resume.json:/career-files/resume.json
```

The run's `--add-dir` covers the directories of both paths.

## Embedding and Request Checks

- `src/proxy.ts` sends `Content-Security-Policy: frame-ancestors <JOB_HUNT_FRAME_ANCESTORS>` on every page and refuses `POST`/`PUT`/`PATCH`/`DELETE` under `/api/` with 403 when `Sec-Fetch-Site` is not `same-origin` or `Origin` differs from the host (`X-Forwarded-Host` behind a proxy). The app has no login, so this is what stops another site's page from clearing a career file or starting a run; requests without either header (curl) pass
- In this repo the container is served at `https://job-hunt.vigilant-broccoli.app` by the local k3s ingress (`infrastructure/local`), which local-manager-next's Job Hunt page embeds. Requests from inside the iframe are same-origin to that host, so they pass

## Nuances

- No personal data is baked in: the build replaces the resume lib's `resume.json` with `templates/resume.json` in both bundles and excludes it from file tracing, and the Dockerfile copies only build output and `templates/`. The user's files arrive through the mounts.
- The app has no login; publish the port on `127.0.0.1` or put an authenticating proxy in front of it.
