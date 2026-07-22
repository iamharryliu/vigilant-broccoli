# Cheatsheet

Useful infra-level CLI commands, runnable via `pnpm run <script>`.

```
📦 REPOSITORY
  open:repo                   Open GitHub repo
  open:repo:actions           Open GitHub Actions
  npm:packages                Open npm packages page
  cheatsheet                  Print this cheatsheet

⚙️  SETUP
  local:install:machine-setup Run machine setup installer (mac/linux)
  format                      Format all files with Prettier
  format:commit               Format given files with Prettier (pass paths)
  cloud:login                 Login to GCP and GitHub CLI
  gcp:login                   Login to GCP and set project
  gh:login                    Login to GitHub CLI
  npm:login                   Login to npm
  oracle:config               Edit OCI config

🏗️  TERRAFORM
  tf:plan                     Load vault env and run terraform plan
  tf:import                   Load vault env and run terraform import <address> <id>
  tf:apply                    Load vault env, apply terraform, and run post-apply
  tf:post-apply               Run post-apply script
  tf:output                   Show terraform outputs

☁️  OCI
  oci:vm:ssh                  SSH into OCI VM (RabbitMQ)
  oci:vm:sync-socket-token    Sync socket-server SENDER_TOKEN with Vault (run after rotation)
  oci:gitea:ssh               SSH into Gitea VM
  oci:gitea:backup:local      Dump Gitea to a local zip
  oci:gitea:backup:cloud      Dump Gitea straight to GCS (timestamped)
  oci:gitea:restore:local <zip>  Restore Gitea from a local dump zip
  oci:gitea:restore:cloud [gs://]  Restore from GCS (default: latest backup)

💻 CODE SERVER
  oci:code-server:open        Open code.harryliu.dev
  oci:code-server:password    Copy code-server password to clipboard
  oci:code-server:ssh         SSH into code-server VM
  oci:code-server:logs        Follow code-server container logs
  oci:code-server:logs:cloud-init  Follow VM provisioning log
  oci:code-server:reset       Rebuild containers + volumes (fresh environment)
  oci:code-server:replace     Replace the VM via terraform (fresh host)

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

🔑 SECRETS
  secret-rotation:all         Run all scripted rotations, then dispatch ci-rotate-secrets workflow
  secret-rotation:flyio       Rotate Fly.io token
  secret-rotation:gitea       Rotate Gitea CI token (scoped read:repository)
  secret-rotation:profile-deploy-key  Rotate profile repo deploy key, store in Vault
  secret-rotation:resend      Rotate Resend API key (single-key swap, pushes to fly app)
  secret-rotation:rabbitmq    Rotate RabbitMQ password, push connection string to fly consumers

🐳 LOCAL
  local:docker:up             Start local Docker Compose services
  local:docker:down           Stop local Docker Compose services
  local:docker:restart        Restart local Docker Compose services
  local:docker:reload         Reload local Docker Compose services
  vb-manager-next:start       Start vb-manager-next via PM2
  vb-manager-next:reload      Reload vb-manager-next via PM2
  vb-manager-next:delete      Delete vb-manager-next PM2 process
  vb-manager-next:logs        Tail vb-manager-next PM2 logs
  vb-manager-next:status      Show PM2 process status
  health-check                Run health check script

🤖 AGENTIC — DEV SANDBOX (attended; you drive the persistent container)
  agentic:dev-sandbox:up      Fetch tokens from Vault into the current shell session (never written to disk), then build + start contained Claude sandbox
                               (export SANDBOX_VAULT_ENV_VARS=NAME1,NAME2 before running to also inject those Vault secret keys)
  agentic:dev-sandbox:cli     Open an interactive Claude session in a persistent tmux session in the sandbox repo clone (auto mode, sonnet; --model <m> to override)
  agentic:dev-sandbox:shell   Open an interactive bash shell in the sandbox (dotfiles loaded)
  agentic:dev-sandbox:logs    Follow sandbox provisioning logs
  agentic:dev-sandbox:down    Stop the sandbox
  agentic:dev-sandbox:reset   Destroy sandbox volume and rebuild fresh

🚀 AGENTIC — TASKS (unattended; ephemeral containers, no human in the loop)
  agentic:task:solve <id...>  Headlessly solve TODO.md item(s) in parallel ephemeral sandbox containers; each opens a PR (sonnet; --model <m> to override)
                               (or --prompt "<task>" to solve a free-text task instead of TODO ids, e.g. "add a /health route to vb-express")
  agentic:task:create <desc>  Headlessly research and add a TODO.md entry for <desc> in an ephemeral sandbox container, then open a PR (sonnet; --model <m> to override)
  agentic:pr:fix <pr>         Headlessly fix a PR's failing CI in an ephemeral sandbox container (checks out the branch, feeds the failing logs to the agent, runs pre-commit, pushes the fix); accepts a PR number or URL (sonnet; --model <m> to override)
  agentic:pr:update <pr> <instruction>  Headlessly apply a free-text change to an existing PR's branch in an ephemeral sandbox container (checks out the branch, runs the agent on your instruction, runs pre-commit, pushes the update); accepts a PR number or URL (sonnet; --model <m> to override)

🏠 HOMELAB
  homelab:up                  Start homelab services and Tailscale
  homelab:down                Stop homelab services and Tailscale
  homelab:restart             Restart homelab services
  homelab:logs                Tail homelab service logs
  homelab:ps                  List homelab service status
  homelab:pull                Pull latest homelab images

🐙 GITHUB
  gh:actions:deploy           Trigger deploy workflow
  gh:actions:health-check     Trigger ci-health-check workflow
  gh:actions:kill-services    Trigger kill-services workflow
  gh:actions:rotate-secrets   Trigger ci-rotate-secrets workflow
  gh:actions:run-tests        Trigger all post-deploy test workflows
  gh:actions:replace-code-server  Trigger code-server VM replace workflow
  gh:actions:security-cloudflare-access  Trigger Cloudflare Access security check workflow

🔍 AUDIT
  audit                       Run vulnerability audit tree

⬆️  MIGRATE
  nx:migrate                  nx migrate latest
  nx:migrate:run              nx migrate --run-migrations
```
