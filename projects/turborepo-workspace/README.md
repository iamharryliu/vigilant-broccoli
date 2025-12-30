# Turborepo Workspace

A monorepo workspace using Turborepo and pnpm for managing multiple applications.

## Apps

### cms-next
A modern Content Management System built with Next.js 15, Radix UI themes, Tailwind CSS, and BetterAuth.

📖 [View cms-next documentation](./apps/cms-next/README.md)

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm 9+
- PostgreSQL (for cms-next)
- (Optional) HashiCorp Vault for secrets management

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cd apps/cms-next
cp .env.example .env
# Edit .env with your configuration
```

### Development

**Run all apps:**
```bash
pnpm dev
```

**Run specific app:**
```bash
pnpm dev:cms
```

**Run with secrets from Vault:**
```bash
# Set Vault credentials
export VAULT_ADDR=https://10.0.1.1:8200
export VAULT_TOKEN=your-vault-token

# Run all apps with secrets
pnpm dev:secrets

# Run specific app with secrets
pnpm dev:cms:secrets
```

## Scripts

- `pnpm dev` - Start all apps in development mode
- `pnpm dev:secrets` - Start all apps with secrets from Vault
- `pnpm dev:cms` - Start only cms-next
- `pnpm dev:cms:secrets` - Start cms-next with secrets from Vault
- `pnpm build` - Build all apps
- `pnpm lint` - Lint all apps

## Secrets Management

This workspace includes a `fetch-secrets.ts` script that loads secrets from HashiCorp Vault before starting your applications.

### How to use

**Option A: Using .env file (Recommended)**

1. Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your Vault credentials:
   ```bash
   VAULT_ADDR=https://10.0.1.1:8200
   VAULT_TOKEN=your-vault-token
   ```

3. Run apps with `:secrets` suffix:
   ```bash
   pnpm dev:cms:secrets
   ```

**Option B: Using environment variables**

1. Export Vault credentials:
   ```bash
   export VAULT_ADDR=https://10.0.1.1:8200
   export VAULT_TOKEN=your-vault-token
   ```

2. Run apps with `:secrets` suffix:
   ```bash
   pnpm dev:cms:secrets
   ```

**Note:** The script uses `dotenv` to automatically load Vault credentials from the root `.env` file if it exists. Environment variables take precedence over `.env` file values.

### Vault Setup Example

```bash
vault kv put kv/secrets \
  DATABASE_URL="postgresql://user:pass@localhost:5432/db" \
  BETTER_AUTH_SECRET="your-secret-key" \
  GOOGLE_AUTH_PROVIDER_CLIENT_ID="your-client-id" \
  GOOGLE_AUTH_PROVIDER_CLIENT_SECRET="your-client-secret"
```

## Workspace Structure

```
turborepo-workspace/
├── apps/
│   └── cms-next/           # CMS Next.js application
├── packages/               # Shared packages (future)
├── scripts/
│   └── fetch-secrets.ts    # Vault secrets fetcher
├── pnpm-workspace.yaml     # pnpm workspace config
├── turbo.json              # Turborepo config
├── package.json            # Root package.json
└── README.md               # This file
```

## Adding New Apps

1. Create a new directory in `apps/`
2. Initialize your app (Next.js, React, etc.)
3. The workspace will automatically detect it via `pnpm-workspace.yaml`

## Package Manager

This workspace uses **pnpm** for faster installs and better disk space efficiency.

- Workspaces are defined in `pnpm-workspace.yaml`
- Node linker is set to "hoisted" for better compatibility (see `.npmrc`)

## Build System

This workspace uses **Turborepo** for intelligent build orchestration:

- Caches build outputs for faster rebuilds
- Runs tasks in parallel when possible
- Configured in `turbo.json`

## License

MIT
