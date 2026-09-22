# DevOps CLI Lib

## Overview

- `@vigilant-broccoli/devops-cli` (`libs/@vigilant-broccoli/devops-cli`) wraps every devops CLI the dev dashboard drives
- Replaces the per-route `child_process` shell-outs the `vb-manager-next` API routes used to carry
- Routes own HTTP concerns (request parsing, status codes, error payloads); the lib owns commands, parsing, and typed results

## Features

- Shared runner (`cli.utils.ts`) — `execFile` based, so arguments never reach a shell; `runCli`, `runCliJson`, `tryRunCli` (null on failure), `probeCli` (merged output + exit status), `runCliToCompletion`, `startDetachedCli`, `copyToClipboard`
- Per-CLI modules pair a `*Command` consts file (argv arrays + input validators) with a `*Service` returning parsed, typed results:
  - `AwsService` — profiles from `~/.aws/config` enriched with `aws sts get-caller-identity`
  - `GcloudService` — auth status, projects, reauth probe, active account/project switching, Vault root token to clipboard
  - `DockerService` — compose-project and standalone container status, start/stop/remove
  - `Pm2Service` — process list, start/stop/restart/delete
  - `FlyioService` — app list, `flyctl auth login`, auth-error detection
  - `VercelService` — projects plus the current team slug
  - `WranglerService` — Pages project list, deployment prune/teardown, project delete, login
  - `TailscaleService` — local tailnet IPs
  - `WireguardService` — configured tunnels and their live interface state
- Input validators (`isValidGcloudAccount`, `isValidGcloudProjectId`, `isValidDockerName`, `isValidPm2ProcessId`) live beside the commands they guard

## Consumers

- `vb-manager-next` API routes under `/api/{aws,gcloud,docker,pm2,flyio,vercel,wrangler,tailscale,wireguard}`
