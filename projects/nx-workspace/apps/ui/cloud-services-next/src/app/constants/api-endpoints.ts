import { withBasePath } from '../app.const';

export const API_ENDPOINTS = {
  GCLOUD_AUTH_STATUS: withBasePath('/api/gcloud/auth-status'),
  GCLOUD_REAUTH_NEEDED: withBasePath('/api/gcloud/reauth-needed'),
  GCLOUD_PROJECTS: withBasePath('/api/gcloud/projects'),
  GCLOUD_SET_PROJECT: withBasePath('/api/gcloud/set-project'),
  GCLOUD_SET_ACCOUNT: withBasePath('/api/gcloud/set-account'),
  GCLOUD_VAULT_TOKEN: withBasePath('/api/gcloud/vault-token'),

  RENDER_SERVICES: withBasePath('/api/render/services'),

  VERCEL_PROJECTS: withBasePath('/api/vercel/projects'),

  FLYIO_APPS: withBasePath('/api/flyio/apps'),
  FLYIO_AUTH_LOGIN: withBasePath('/api/flyio/auth/login'),

  WRANGLER_PAGES: withBasePath('/api/wrangler/pages'),
  WRANGLER_LOGIN: withBasePath('/api/wrangler/login'),

  TERRAFORM_STATUS: withBasePath('/api/terraform/status'),

  GITHUB_PAGES: withBasePath('/api/github/pages'),

  AWS_PROFILES: withBasePath('/api/aws/profiles'),
} as const;
