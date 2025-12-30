# CMS Next

**Note:** Run these commands from `apps/cms-next/` directory

```bash
# Install dependencies (from root)
cd ../..
pnpm install
cd apps/cms-next

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Start PostgreSQL database
docker-compose up -d

# Run database migrations
pnpm db:migrate

# Development
pnpm dev                    # Run without secrets
pnpm dev:secrets            # Run with Vault secrets

# Build
pnpm build

# Production
pnpm start
```
