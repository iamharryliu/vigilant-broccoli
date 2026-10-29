# Cheatsheet

Useful infra-level CLI commands, runnable via `pnpm run <script>`.

```
📦 REPOSITORY
  postinstall                 Runs after root `pnpm i`: installs projects/nx-workspace dependencies (not meant to be run directly)
  open:repo                   Open GitHub repo
  open:repo:actions           Open GitHub Actions
  npm:packages                Open npm packages page
  cheatsheet                  Print this cheatsheet
  cheatsheet:tmux-nvim        Print the tmux/nvim keybinding cheatsheet
  cheatsheet:aliases          Print the shell alias cheatsheet
  dockerhub:descriptions      Push every Docker Hub repo's description and overview from the pages-index image registry (Vault DOCKERHUB_TOKEN)
  repo-stats                  Regenerate the managed repo-stats line in README.md and about.md
  repo-stats:check            Fail if a managed repo-stats copy (README, about, resume) is stale
  deps:align-pins             Align app/lib dependency ranges with the nx-workspace root (40-edit cap); run `pnpm -C projects/nx-workspace install --lockfile-only` after
  deps:align-pins:check       Report app/lib dependency pin drift without editing
  screenshot:setup            Install workspace Chromium and OS dependencies (Linux requires sudo)
  screenshot:themes <url>...  Screenshot local pages in light and dark at phone and desktop widths (gitignored output)

📈 UPTIME
  upptime:config:render <dir> Render managed monitoring files locally (empty external directory)
  upptime:history:export <bundle> [ref] Export history-only Git commits to a new bundle
  upptime:history:import <bundle> [owner/repo] Import history into an uninitialized monitoring dataset

⚙️  SETUP
  local:install:machine-setup Run machine setup installer (mac/linux)
  local:start-mission-control-helper  Open Hammerspoon and Karabiner-Elements (fallback if login items fail)
  format                      Format all files with Prettier
  format:commit               Format given files with Prettier (pass paths)
  cloud:login                 Check GCP/AWS/GitHub/npm/Fly login status, login where needed
  gcp:login                   Login to GCP and set project
  gh:login                    Login to GitHub CLI
  npm:login                   Login to npm
  aws:login                   Login to AWS SSO (AdministratorAccess-841376026547)
  fly:login                   Login to Fly.io CLI
  oracle:config               Edit OCI config

🏗️  TERRAFORM
  tf:plan                     Load vault env and run terraform plan
  tf:import                   Load vault env and run terraform import <address> <id>
  tf:apply                    Load vault env, apply terraform, and run post-apply
  tf:post-apply               Run post-apply script
  oci:config:sync-local       Refresh ~/.oci/config + key from Vault (after a rotation)
  tf:output                   Show terraform outputs
  tf:unlock                   Load vault env and force-unlock the HCP Terraform workspace

☁️  OCI
  oci:vm:ssh                  SSH into OCI VM (RabbitMQ)
  oci:vm:sync-socket-token    Sync socket-server SENDER_TOKEN with Vault (run after rotation)
  gitea:ssh                   SSH into Gitea VM
  gitea:backup:local          Dump Gitea to a local zip
  gitea:backup:cloud          Dump Gitea straight to GCS (timestamped)
  gitea:restore [zip|gs://]   Restore Gitea from a local dump zip or GCS (default: latest GCS backup)

💻 CODE SERVER
  code-server:open            Open code.harryliu.dev
  code-server:password        Copy code-server password to clipboard
  code-server:ssh             SSH into code-server VM
  code-server:logs            Follow code-server container logs
  code-server:logs:cloud-init  Follow VM provisioning log
  code-server:reset           Rebuild containers + volumes (fresh environment)
  code-server:replace         Replace the VM via terraform (fresh host)

📁 SEAFILE
  seafile:open                Open drive.harryliu.dev
  seafile:password            Copy Seafile admin password to clipboard
  seafile:ssh                 SSH into Seafile VM
  seafile:logs                Follow Seafile container logs
  seafile:logs:cloud-init     Follow VM provisioning log
  seafile:reset               Rebuild containers + volumes (fresh environment)
  seafile:replace             Replace the VM via terraform (fresh host)

🖼️  IMMICH
  immich:open                 Open images.harryliu.dev
  immich:ssh                  SSH into Immich VM
  immich:logs                 Follow Immich server container logs
  immich:logs:cloud-init      Follow VM provisioning log
  immich:reset                Rebuild containers + volumes (fresh environment)
  immich:replace              Replace the VM via terraform (fresh host)

📈 GRAFANA (observability VM)
  grafana:open                Open grafana.harryliu.dev
  grafana:password            Copy Grafana admin password to clipboard
  grafana:ssh                 SSH into Grafana/Loki VM
  grafana:dashboards:push     Sync grafana-dashboards/*.json to the VM
  grafana:logs                Follow Grafana container logs
  grafana:logs:loki           Follow Loki container logs
  grafana:logs:cloud-init     Follow VM provisioning log
  grafana:reset               Rebuild containers + volumes (fresh environment)
  grafana:replace             Replace the VM via terraform (fresh host)

🎬 JELLYFIN (homelab Pi)
  jellyfin:provision          Run the Ansible playbook against the Pi (extra args pass through, e.g. --tags jellyfin)
  jellyfin:provision:check    Dry-run the playbook (--check --diff)
  jellyfin:ssh                SSH into the Pi using the inventory address
  jellyfin:open               Open the Jellyfin web UI
  jellyfin:status             Show the compose unit and container status
  jellyfin:logs               Follow Jellyfin container logs
  jellyfin:docker:up          Start the Jellyfin stack
  jellyfin:docker:down        Stop the Jellyfin stack
  jellyfin:docker:restart     Restart the Jellyfin stack

🚚 LOG SHIPPER (fly -> loki)
  logs:shipper:deploy         Create/update the vb-log-shipper fly app (secrets from Vault)
  logs:shipper:status         Show the vb-log-shipper app status
  logs:shipper:logs           Follow the vb-log-shipper app logs

🖥️  GCP VM
  gcp:vm:image:build          Build GCP VM Packer image (init + build)
  gcp:vm:ssh                  SSH into GCP VM via IAP
  gcp:vm:status               Get GCP VM status
  gcp:vm:stop                 Stop GCP VM
  gcp:vm:start                Start GCP VM
  gcp:vm:post-init            Run Vault post-init script
  gcp:vm:regen-cert           Regenerate cert and update WireGuard
  gcp:vm:update-wg            Update WireGuard endpoint

🔐 VAULT
  gcp:vm:vault:test-local-connection  Test local Vault connection
  gcp:vm:vault:unseal         Unseal Vault
  gcp:vm:vault:seal           Seal Vault
  gcp:vm:vault:save-secrets-local     Save Vault secrets locally
  gcp:vm:vault:set-secrets    Set secrets in Vault
  vault:store-promotion-key <pem>  Store the production-promotion GitHub App key in Vault

🔑 SECRETS
  secret-rotation:all         Run the local rotations, dispatch ci-rotate-secrets, then rotate the OCI key
  secret-rotation:flyio       Rotate Fly.io token
  secret-rotation:gitea       Rotate Gitea CI token (scoped read:repository)
  secret-rotation:profile-deploy-key  Rotate profile repo deploy key, store in Vault
  secret-rotation:tf-cloud    Rotate HCP Terraform token (self-succession)
  secret-rotation:resend      Rotate Resend API key (single-key swap, pushes to fly app)
  secret-rotation:rabbitmq    Rotate RabbitMQ password, push connection string to fly consumers
  secret-rotation:twilio      Rotate Twilio auth token (two-phase secondary-token promotion)
  secret-rotation:oci         Rotate the OCI API key (local-only); refreshes ~/.oci, ~5min propagation wait
  secret-rotation:calendar-sa  Replace the Google Calendar service-account key, sync it to Vault, reload local-manager-next
  rabbitmq:password           Copy RabbitMQ admin password to clipboard (login user: admin)

☸️  LOCAL K3S (k3d cluster: proxy, Grafana, Loki, Prometheus, Alloy, Headlamp, Argo CD)
  local:k3s:up                Create the local k3d (k3s in Docker) cluster
  local:k3s:down              Delete the local k3d cluster and its data
  local:k3s:start             Start the stopped local k3d cluster
  local:k3s:stop              Stop the local k3d cluster, keeping its state
  local:k3s:apply             Bootstrap: apply the working tree, the mkcert TLS secret and the Argo CD Application
  local:k3s:status            Show nodes, platform workloads, Argo CD sync state and Helm releases
  local:k3s:ui                Open k9s on the local cluster's platform namespace
  local:k3s:grafana:password  Copy the local Grafana admin password and open Grafana
  local:k3s:grafana:logs      Tail local Grafana logs
  local:k3s:headlamp:token    Copy a 24h Headlamp login token and open Headlamp
  local:k3s:alloy:logs        Tail local Alloy (log collector) logs
  local:k3s:loki:logs         Tail local Loki logs
  local:k3s:traefik:logs      Tail local Traefik (ingress) logs
  local:k3s:argocd:password   Copy the Argo CD admin password and open Argo CD
  local:k3s:argocd:pause      Stop Argo CD auto-sync so working-tree applies stick
  local:k3s:argocd:resume     Re-enable Argo CD auto-sync from main

🐳 LOCAL
  immich:docker:up            Start the standalone Immich Docker Compose stack
  immich:docker:down          Stop the standalone Immich Docker Compose stack
  immich:docker:restart       Restart the standalone Immich Docker Compose stack
  immich:docker:reload        Reload the standalone Immich Docker Compose stack
  immich:docker:logs          Tail the standalone Immich Docker Compose logs
  job-hunt:serve  Run job-hunt-next with next dev on port 3000 against this repo's resume and career notes and ~/Desktop/Job Applications
  job-hunt:docker:up  Build job-hunt-next and start its container with the Claude token from Vault and this repo's resume and career notes mounted
  job-hunt:docker:down  Stop the job-hunt-next container
  job-hunt:docker:logs  Tail the job-hunt-next container logs
  local-manager-next:start       Start local-manager-next via PM2 and save the process list
  event-calendars:sync        Sync every event calendar with sources from Facebook to Google Calendar (exits non-zero on failure, 3 when Facebook login is required; logs to ~/.vb-manager/event-calendars-sync.log)
  deploy:local-manager        Pull latest (ff-only), then reload local-manager-next via PM2 and save the process list
  local-manager-next:delete      Delete local-manager-next PM2 process
  local-manager-next:logs        Tail local-manager-next PM2 logs
  local-manager-next:status      Show PM2 process status
  deploy:local-services       Bring up the local k3s cluster + reload local-manager-next
  health-check                Run health check script
  dldjmusic                   Download DJ music from Spotify playlists (secrets pulled from Vault)

🤖 AGENTIC — DEV SANDBOX (attended; you drive the persistent container)
  agentic:dev-sandbox:up      Fetch tokens from Vault into the current shell session (never written to disk), then build + start contained agent sandbox
                               (export SANDBOX_VAULT_ENV_VARS=NAME1,NAME2 before running to also inject those Vault secret keys)
  agentic:dev-sandbox:claude:auto  Open Claude in a persistent claude-auto tmux session (automatic approval review; forwards CLI arguments)
  agentic:dev-sandbox:codex:auto  Open Codex in a persistent codex-auto tmux session (automatic approval review; forwards CLI arguments)
  agentic:dev-sandbox:claude:yolo  Open Claude in a persistent claude-yolo tmux session (permission checks bypassed; forwards CLI arguments)
  agentic:dev-sandbox:codex:yolo  Open Codex in a persistent codex-yolo tmux session (permission checks bypassed; forwards CLI arguments)
  agentic:dev-sandbox:shell   Open an interactive bash shell in the sandbox (dotfiles loaded)
  agentic:dev-sandbox:logs    Follow sandbox provisioning logs
  agentic:dev-sandbox:down    Stop the sandbox
  agentic:dev-sandbox:reset   Destroy sandbox volume and rebuild fresh
  agentic:dev-sandbox:refresh-github-token  Mint a fresh 1-hour GitHub App installation token (GH_TOKEN, from AGENT_GH_APP_ID/
                               AGENT_GH_APP_PRIVATE_KEY — never stored in Vault, re-minted every call) and recreate the running sandbox
                               container with it; no input needed. Use this when git push/gh calls in the sandbox start failing with auth
                               errors after ~1h

🚀 AGENTIC — TASKS (unattended; ephemeral containers, no human in the loop)
  agentic-pr-create <id...>  Headlessly solve TODO.md item(s) in parallel ephemeral sandbox containers, one run per id; each opens a PR, or several when the request splits into increments (sonnet; --model <m> to override, or --agent codex [--codex-model <m>])
                               (or --prompt "<task>" to solve a free-text task instead of TODO ids, e.g. "add a /health route to vb-express"; TODO ids named in the task are resolved the same way)
  agentic-pr-create --agent ollama --prompt "<task>"  Use native host Ollama/Qwen in Docker; retain a preview checkout without publishing (--local shorthand, --ollama-model <tag>, --publish to open PRs)
  agentic-pr-create --vm (<id...> | --prompt "<task>")  Solve in detached tmux sessions, one worktree each, in the code-server container on the OCI VM instead of local Docker; add `--agent codex [--codex-model <m>] [--codex-signed-in]` for Codex (default Claude); without a Vault token it uses the `codex login` made on the VM
  agentic-pr-create-todo <desc>  Headlessly refine <desc> into a repo-informed task prompt and add a TODO.md entry in an ephemeral sandbox container, then open a PR (sonnet; --model <m> to override)
  agentic-pr-create-todo-audit  Headlessly re-verify TODO.md rows against the codebase in an ephemeral sandbox container — deletes resolved rows, corrects drifted paths/quoted snippets/counts — then open a PR; opens none if every row still holds (sonnet; --model <m> to override)
  agentic-pr-create-audit  Headlessly audit docs/, every CONTEXT.md and README.md for passages about legacy implementations that no longer apply (removed apps/scripts/workflows/env vars, "previously/migrated from/no longer" backstory) and for current claims the tree contradicts (commands, script names, env vars, file paths, Swagger specs vs routes), plus misplaced leaf consumer details per docs/agent-support.md documentation placement, in an ephemeral sandbox container, remove or rewrite to the current state only what grep verification supports, then open one PR of at most 15 files listing each removal and the skipped candidates for a re-run; opens none if nothing qualifies (opus; --model <m> to override)
  agentic-pr-create-comment-audit  Headlessly sweep the repo for redundant comments and generator scaffolding in an ephemeral sandbox container, remove them with comment-only edits (keeping reasons, constraints, traps, TODO/FIXME, lint directives and sole-body comments), then open one capped PR listing skipped candidates; opens none if every comment is justified (sonnet; --model <m> to override)
  agentic-pr-create-context-audit  Headlessly slim every CONTEXT.md, shared skill body, Doc Map and required-reading doc by replacing restated rules with links to their owner compressing incident narratives and repairing leaf documentation ownership within the existing scope, never losing rules, workarounds, recovery steps or exact error strings, in an ephemeral sandbox container, then open one PR of at most 15 files citing where each removed fact is retained; opens none if nothing can be slimmed safely (opus; --model <m> to override)
  agentic-pr-create-free-tier-audit  Headlessly verify every cloud service in use has a ## Free Tier section and a free-tier-infrastructure.md row in an ephemeral sandbox container, adding or correcting entries only from verifiable sources, then open one capped PR listing evidence and skipped candidates; opens none if everything is current (sonnet; --model <m> to override)
  agentic-pr-create-inventory-audit  Headlessly check docs/fork-identity-inventory.md and the Secret Inventory in docs/infrastructure/secret-management.md against the accounts, domains and secret references used in code, Terraform and workflows (candidates from scripts/ci/inventory-drift.sh), fix missing or stale rows without touching secret values in an ephemeral sandbox container, then open one PR of at most 2 files; opens none if the inventories match (sonnet; --model <m> to override)
  agentic-pr-create-prune  Headlessly sweep the repo for dead code, unused dependencies, broken doc links/anchors, orphaned docs/scripts/workflows and cheatsheet drift in an ephemeral sandbox container, remove only items grep shows have zero references, then open one capped PR listing the evidence and skipped candidates; opens none if nothing is provably dead (sonnet; --model <m> to override)
  agentic-pr-create-readmes  Headlessly refresh every README.md against docs/app-readme-pattern.md and the current code, plus the generated repo counts, in an ephemeral sandbox container, then open one PR of at most 20 files listing the evidence and skipped candidates; opens none if nothing drifted (sonnet; --model <m> to override)
  agentic-pr-create-url-audit  Headlessly verify every public URL has synchronized Upptime entries, pages-index cards and browser quick links per environment and demo in an ephemeral sandbox container, fix drift, then open one capped PR (15 files) listing the evidence and skipped candidates; opens none if consistent (sonnet; --model <m> to override)
  agentic-pr-create-rnd "<question>"    Headlessly research a concise R&D note (alternatives table + recommendation + sample) under docs/rnd/ in an ephemeral sandbox container, then open a PR (sonnet; --model <m> to override)
  GitHub Actions: manual-agentic-pr-update selects operation=change|fix-ci|resolve-conflicts; instruction is required for change, optional for fix-ci, blank for resolve-conflicts
  agentic-pr-update [--vm [--agent codex] [--codex-model <m>] [--codex-signed-in]] [--operation <op>] <pr> <instruction>  Headlessly apply a free-text change to an existing PR's branch in an ephemeral sandbox container or detached code-server VM session (checks out the branch, runs the agent on your instruction, runs pre-commit, pushes the update, and opens separate follow-up PRs for independent work it surfaces); accepts a PR number or URL (sonnet; --model <m> to override)
                                (--operation fix-ci [<instruction>] fixes a PR's failing CI from its check logs; --operation resolve-conflicts merges origin/main and resolves conflicts, taking no instruction)
                                (--with-ci-logs, or the Actions with_ci_logs input, waits up to 10 minutes for running checks, then feeds the PR's failing check summary and failed-step logs to the agent; a plain change still lists non-passing check names, e.g. agentic-pr-update --with-ci-logs 149 "fix the failing checks")

🐙 GITHUB
  gh:actions:deploy           Trigger deploy workflow
  gh:actions:health-check     Trigger ci-health-check workflow
  gh:actions:kill-services    Trigger kill-services workflow
  gh:actions:promote-production  Trigger manual-promote-production (fast-forward production to main)
  gh:actions:rotate-secrets   Trigger ci-rotate-secrets workflow
  gh:actions:run-tests        Trigger all post-deploy test workflows
  gh:actions:replace-code-server  Trigger code-server VM replace workflow
  gh:actions:refresh-code-server-github-token  Mint a 1-hour GitHub App token and drop it on the code-server VM
  gh:actions:security-cloudflare-access  Trigger Cloudflare Access security check workflow

🔍 AUDIT
  audit                       Run vulnerability audit tree

🏗️  NX WORKSPACE
  nx <command> [args...]      Run Nx in projects/nx-workspace (e.g. pnpm nx serve <app>)

⬆️  MIGRATE
  nx:migrate                  nx migrate latest
  nx:migrate:run              nx migrate --run-migrations
```

Local agent commands (Codex `$name`, Claude `/name`):

- `local-session-status` — One read-only snapshot of known dispatches.
- `local-session-retry-publish [session]` — After a reported token refresh, notify the single known publishing-blocked idle agent or an explicitly selected session. See [usage and limitations](../setup/dotfiles/agent-skills/local-session-retry-publish/SKILL.md).
