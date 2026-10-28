# Self-Hosting

Run the code-server image with this repo's toolchain, GitHub token handling and a web terminal from `iamharryliu/vb-code-server`.

## Table of Contents

- [Run from Registry](#run-from-registry)
- [Browser Verification](#browser-verification)
- [Environment Variables](#environment-variables)
- [Web Terminal](#web-terminal)
- [GitHub Token](#github-token)
- [Nuances](#nuances)

## Run from Registry

The image is `linux/arm64` only (built natively for an Ampere A1 VM) and extends `lscr.io/linuxserver/code-server`, so it serves code-server on that image's port 8443 and takes its variables. Mount `/config` to keep the home directory.

```
docker run -d --name code-server \
  -p 8443:8443 \
  -e PUID=1000 -e PGID=1000 \
  -e PASSWORD=<password> \
  -e SUDO_PASSWORD=<password> \
  -v code_server_config:/config \
  iamharryliu/vb-code-server:latest
```

The image adds Node.js 24, pnpm, Claude Code, Codex, `gh`, the Google Cloud CLI, `pre-commit` and tmux. Codex has no baked-in credential: sign in from the terminal with `codex login --device-auth`; the login lives in the `/config` volume.

## Browser Verification

The image bakes in Chromium’s OS libraries using the exact Playwright version in the workspace lockfile and its [distro-aware dependency installer](https://playwright.dev/docs/browsers#install-system-dependencies). The Ubuntu-derived ARM64 base is supported by Playwright; no Ubuntu package list is shared with the Debian agent sandbox. Lockfile changes trigger an image rebuild so Playwright dependency updates reach recreated containers.

After installing workspace dependencies, run `pnpm -C projects/nx-workspace exec playwright install chromium` as the terminal user (`abc`), then `pnpm screenshot:themes -- http://localhost:<port>`. Browser downloads stay in `/config/.cache/ms-playwright` on the persistent home volume, accessible to that user. The image installs only OS libraries, not a root-owned browser cache or global Playwright CLI. Re-run the browser install after Playwright upgrades.

For an older image or another supported Linux host, `pnpm screenshot:setup` installs both the browser and OS libraries using workspace Playwright; apt requires sudo. Do not run the whole command as root, which would put the browser in root’s cache. Screenshot invocations never install packages automatically. See the [manual verification guide](../../../../docs/app-development/ui/ui-app-pattern.md#manual-verification).

Rebuilding alone does not update an already running container. After merge, the image workflow publishes the ARM64 image and the VM’s update timer can recreate code-server within 15 minutes. Schedule that rollout around live tmux sessions; do not trigger replacement merely to run browser checks. Existing Debian agent-sandbox images are outside this provisioning change and need `pnpm screenshot:setup` with apt privileges separately.

The [browser verification record](./browser-verification/verification.md) includes the matching-host runtime check, isolated #1319 lifecycle assertions and reviewed screenshots, with image-build limitations stated separately.

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `CF_ACCESS_AUD` | No | Cloudflare Access application AUD the web terminal checks in each JWT; required to start the web terminal. |
| `CF_ACCESS_TEAM_DOMAIN` | No | Cloudflare Access team domain the web terminal fetches signing keys from; required to start the web terminal. |
| `CLAUDE_CODE_OAUTH_TOKEN` | No | Token from `claude setup-token` for Claude Code in the terminal. |
| `DEFAULT_WORKSPACE` | No | Folder code-server opens, from the base image. |
| `GH_TOKEN_FILE` | No | Path of the GitHub token file `gh-token` reads; defaults to `/run/secrets/gh-token.json`. |
| `PASSWORD` | Yes | code-server login password, from the base image. |
| `PGID`, `PUID` | No | Group and user ids of the `abc` account that owns `/config`, from the base image. |
| `SUDO_PASSWORD` | No | Password for `sudo` in the terminal, from the base image. |
| `TERMINAL_CWD` | No | Directory new web terminal sessions start in; defaults to `$TERMINAL_HOME/vigilant-broccoli`. |
| `TERMINAL_HOME` | No | Home directory of web terminal sessions; defaults to `/config`. |
| `TERMINAL_PORT` | No | Port the web terminal listens on; defaults to `7681`. |
| `TERMINAL_TMUX_SESSION` | No | tmux session name the terminal attaches to; defaults to `web`. |

## Web Terminal

A mobile-friendly tmux terminal runs as an s6 service beside code-server on `TERMINAL_PORT`. It verifies the Cloudflare Access JWT on every request, so it needs a reverse proxy behind Cloudflare Access; do not publish its port on the host.

## GitHub Token

`gh` is shadowed by a wrapper that reads an installation token from `GH_TOKEN_FILE` (a JSON file with `token` and `expires_at`), so `gh` and git's `gh auth git-credential` helper carry it. Mount the file read-only at `/run/secrets/gh-token.json`. A `GH_TOKEN` already in the environment wins.

## Nuances

- With `CF_ACCESS_TEAM_DOMAIN` or `CF_ACCESS_AUD` unset, the web terminal does not start (it fails closed) while code-server runs normally.
- An expired or missing token file makes `gh` run unauthenticated after printing why.
