# vigilant-broccoli

<div>
<a href="https://github.com/iamharryliu/vigilant-broccoli">
<img src="https://i.pinimg.com/564x/b7/62/38/b762386c0bbb20dec77c2632f73d28a8.jpg" alt="broccoli" width="200"/>
</a>
</div>

## Table of Contents

- [Development](#development)
- [Commands](#commands)
- [CI Status](#ci-status)
- [Stack](#stack)
- [Click here](https://iamharryliu.github.io/vigilant-broccoli/) for more.

## Development

### Commands

View [cheatsheet](./docs/cheatsheet.md) for useful infra-level CLI commands.

```
pnpm cheatsheet
pnpm local:install:machine-setup
```

## CI Status

[![ci-health-check](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/ci-health-check.yml/badge.svg)](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/ci-health-check.yml)\
[![ci-pr-check](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/ci-pr-check.yml/badge.svg)](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/ci-pr-check.yml)\
[![ci-rotate-secrets](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/ci-rotate-secrets.yml/badge.svg)](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/ci-rotate-secrets.yml)\
[![cron-backup](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/cron-backup.yml/badge.svg)](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/cron-backup.yml)\
[![cron-cleanup-workflow-runs](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/cron-cleanup-workflow-runs.yml/badge.svg)](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/cron-cleanup-workflow-runs.yml)\
[![cron-deploy-journal](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/cron-deploy-journal.yml/badge.svg)](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/cron-deploy-journal.yml)\
[![cron-upptime](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/cron-upptime.yml/badge.svg)](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/cron-upptime.yml)\
[![cron-upptime-response-time](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/cron-upptime-response-time.yml/badge.svg)](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/cron-upptime-response-time.yml)\
[![deploy](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/deploy.yml/badge.svg)](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/deploy.yml)\
[![deploy-github-profile](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/deploy-github-profile.yml/badge.svg)](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/deploy-github-profile.yml)\
[![manual-deploy-app](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/manual-deploy-app.yml/badge.svg)](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/manual-deploy-app.yml)\
[![manual-kill-services](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/manual-kill-services.yml/badge.svg)](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/manual-kill-services.yml)\
[![manual-replace-code-server](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/manual-replace-code-server.yml/badge.svg)](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/manual-replace-code-server.yml)\
[![manual-run-tests](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/manual-run-tests.yml/badge.svg)](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/manual-run-tests.yml)\
[![notify-complete](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/notify-complete.yml/badge.svg)](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/notify-complete.yml)\
[![test-e2e-email-subscription-service](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/test-e2e-email-subscription-service.yml/badge.svg)](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/test-e2e-email-subscription-service.yml)\
[![test-e2e-llm](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/test-e2e-llm.yml/badge.svg)](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/test-e2e-llm.yml)\
[![test-e2e-rabbitmq](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/test-e2e-rabbitmq.yml/badge.svg)](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/test-e2e-rabbitmq.yml)\
[![test-e2e-socket-server-socketio](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/test-e2e-socket-server-socketio.yml/badge.svg)](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/test-e2e-socket-server-socketio.yml)\
[![test-e2e-storage-service](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/test-e2e-storage-service.yml/badge.svg)](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/test-e2e-storage-service.yml)\
[![test-e2e-twilio](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/test-e2e-twilio.yml/badge.svg)](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/test-e2e-twilio.yml)\
[![test-security-api](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/test-security-api.yml/badge.svg)](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/test-security-api.yml)\
[![test-security-cloudflare-access](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/test-security-cloudflare-access.yml/badge.svg)](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/test-security-cloudflare-access.yml)\
[![test-security-llm](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/test-security-llm.yml/badge.svg)](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/test-security-llm.yml)\
[![test-security-socket-server](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/test-security-socket-server.yml/badge.svg)](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/test-security-socket-server.yml)\
[![test-security-storage-service](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/test-security-storage-service.yml/badge.svg)](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/test-security-storage-service.yml)\
[![test-smoke-email-service](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/test-smoke-email-service.yml/badge.svg)](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/test-smoke-email-service.yml)\
[![test-smoke-gcp-secret-manager](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/test-smoke-gcp-secret-manager.yml/badge.svg)](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/test-smoke-gcp-secret-manager.yml)\
[![test-smoke-vault-service](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/test-smoke-vault-service.yml/badge.svg)](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/test-smoke-vault-service.yml)

## Stack

- Cloud Providers
  - Google Cloud Platform
  - Oracle Cloud Infrastructure
  - Cloudflare
  - Vercel
  - Fly.io
  - AWS
  - GitHub
- Infrastructure as Code
  - Terraform
  - Packer
- Containers / Orchestration
  - Docker
  - Docker Compose
- Networking
  - Caddy
  - Nginx
  - Tailscale
  - WireGuard
  - cloudflared
- Secrets Management
  - HashiCorp Vault
  - Google Secret Manager
  - Bitwarden
- Process Management
  - PM2
- Monitoring / Observability
  - Grafana
  - Loki
  - Promtail
  - Upptime
- Self-Hosted Services
  - Gitea
  - code-server
  - Immich
  - Adminer
  - Watchtower
  - Claude Code
- CI/CD
  - GitHub Actions
- Databases
  - PostgreSQL
  - SQLite
  - MongoDB
- Caching / Messaging
  - Redis
  - RabbitMQ
- CMS
  - Sanity
- Backend as a Service
  - Supabase
- Object Storage
  - AWS S3
  - Google Cloud Storage
  - Cloudflare R2
- Auth
  - Better Auth
- AI / LLM
  - Anthropic
  - OpenAI
  - DeepSeek
  - xAI (Grok)
  - Google Gemini
- Payments
  - Stripe
- Communications
  - Slack
  - Twilio
  - Resend
- Third-Party APIs
  - Google OAuth
  - Google Workspace APIs (Tasks, Calendar)
  - Google Analytics
  - Google reCAPTCHA
  - OpenWeatherMap
  - ElevenLabs
- Container Registry
  - Docker Hub
- Package Registries
  - npm
- Package Managers
  - pnpm
- Monorepo Tooling
  - Nx
- Languages
  - TypeScript
  - JavaScript
  - Bash / Shell
  - Python
  - HCL (Terraform)
  - YAML
- Build Tools
  - Vite
  - Webpack
  - esbuild
  - SWC
  - Rollup
  - Next.js
  - Angular CLI
  - Sanity CLI
- Backend Frameworks
  - Fastify
  - Express
  - Socket.IO
  - Slack Bolt
- Frontend Frameworks
  - React
  - Next.js
  - Angular
- Styling
  - Tailwind CSS
  - Font Awesome
- UI Libraries
  - Radix Themes
  - lucide-react
  - Leaflet / react-leaflet
  - recharts
  - FullCalendar
  - React Router
  - dnd-kit
  - react-markdown
  - fuse.js
  - styled-components
  - marked
- Utility Libraries
  - Zod
  - Nodemailer
  - isomorphic-dompurify
- Testing
  - Vitest
  - Jest
  - Playwright
- Linting / Formatting
  - ESLint
  - Prettier
