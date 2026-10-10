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
  repo-stats                  Regenerate the managed repo-stats line in README.md and about.md
  repo-stats:check            Fail if a managed repo-stats copy (README, about, resume) is stale

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
  gitea:restore:local <zip>   Restore Gitea from a local dump zip
  gitea:restore:cloud [gs://]  Restore from GCS (default: latest backup)

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
  secret-rotation:calendar-sa  Replace the Google Calendar service-account key, sync it to Vault, reload vb-manager-next
  rabbitmq:password           Copy RabbitMQ admin password to clipboard (login user: admin)

🐳 LOCAL
  local:docker:up             Start local Docker Compose services
  local:docker:down           Stop local Docker Compose services
  local:docker:restart        Restart local Docker Compose services
  local:docker:reload         Reload local Docker Compose services
  immich:docker:up            Start the standalone Immich Docker Compose stack
  immich:docker:down          Stop the standalone Immich Docker Compose stack
  immich:docker:restart       Restart the standalone Immich Docker Compose stack
  immich:docker:reload        Reload the standalone Immich Docker Compose stack
  immich:docker:logs          Tail the standalone Immich Docker Compose logs
  vb-manager-next:start       Start vb-manager-next via PM2 and save the process list
  vb-manager-next:reload      Reload vb-manager-next via PM2 and save the process list
  vb-manager-next:delete      Delete vb-manager-next PM2 process
  vb-manager-next:logs        Tail vb-manager-next PM2 logs
  vb-manager-next:status      Show PM2 process status
  deploy:local-services       Bring up local Docker services + reload vb-manager-next
  health-check                Run health check script
  dldjmusic                   Download DJ music from Spotify playlists (secrets pulled from Vault)

🤖 AGENTIC — DEV SANDBOX (attended; you drive the persistent container)
  agentic:dev-sandbox:up      Fetch tokens from Vault into the current shell session (never written to disk), then build + start contained agent sandbox
                               (export SANDBOX_VAULT_ENV_VARS=NAME1,NAME2 before running to also inject those Vault secret keys)
  agentic:dev-sandbox:cli     Open an interactive Claude session in a persistent tmux session in the sandbox repo clone (auto mode, sonnet; --model <m> to override)
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
  agentic-pr-create-todo <desc>  Headlessly refine <desc> into a repo-informed task prompt and add a TODO.md entry in an ephemeral sandbox container, then open a PR (sonnet; --model <m> to override)
  agentic-pr-create-todo-audit  Headlessly re-verify TODO.md rows against the codebase in an ephemeral sandbox container — deletes resolved rows, corrects drifted paths/line numbers/counts — then open a PR; opens none if every row still holds (sonnet; --model <m> to override)
  agentic-pr-create-prune  Headlessly sweep the repo for dead code, unused dependencies, broken doc links/anchors, orphaned docs/scripts/workflows and cheatsheet drift in an ephemeral sandbox container, remove only items grep shows have zero references, then open one capped PR listing the evidence and skipped candidates; opens none if nothing is provably dead (sonnet; --model <m> to override)
  agentic-pr-create-rnd "<question>"    Headlessly research a concise R&D note (alternatives table + recommendation + sample) under docs/rnd/ in an ephemeral sandbox container, then open a PR (sonnet; --model <m> to override)
  GitHub Actions: manual-agentic-pr-update selects operation=change|fix-ci|resolve-conflicts; instruction is required for change, optional for fix-ci, blank for resolve-conflicts
  agentic-pr-update <pr> <instruction>  Headlessly apply a free-text change to an existing PR's branch in an ephemeral sandbox container (checks out the branch, runs the agent on your instruction, runs pre-commit, pushes the update, and opens separate follow-up PRs for independent work it surfaces); accepts a PR number or URL (sonnet; --model <m> to override)
                                (--with-ci-logs feeds the PR's failing check summary and failed-step logs to the agent, e.g. agentic-pr-update --with-ci-logs 149 "fix the failing checks")
  agentic-pr-update-fix-ci <pr> [instruction]  Fix a PR's failing CI in an ephemeral sandbox: feeds its failing check summary and failed-step logs to the agent, runs pre-commit and pushes the fix; accepts a PR number or URL (sonnet; --model <m> to override)
  agentic-pr-update-resolve-conflicts <pr>  Merge origin/main into a PR branch, resolve conflicts, run pre-commit and push the update in an ephemeral sandbox; accepts a PR number or URL (sonnet; --model <m> to override)

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

⬆️  MIGRATE
  nx:migrate                  nx migrate latest
  nx:migrate:run              nx migrate --run-migrations
```
