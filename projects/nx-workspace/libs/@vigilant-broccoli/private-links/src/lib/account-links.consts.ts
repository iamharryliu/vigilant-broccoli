// URLs that embed an account, org, project or workspace id, so they stay out
// of @vigilant-broccoli/public-links.
export const CLOUDFLARE_ACCOUNT_LINK = {
  DASHBOARD: {
    NAME: 'Cloudflare Dashboard',
    URL: 'https://dash.cloudflare.com/26d066ec62c4d27b8da5e9aebac17293/home/domains',
  },
  BILLING: {
    NAME: 'Cloudflare Billing',
    URL: 'https://dash.cloudflare.com/26d066ec62c4d27b8da5e9aebac17293/billing',
  },
  USAGE: {
    NAME: 'Cloudflare Usage',
    URL: 'https://dash.cloudflare.com/26d066ec62c4d27b8da5e9aebac17293/billing/billable-usage',
  },
  DOMAINS: {
    NAME: 'VB - Cloudflare Domains',
    URL: 'https://dash.cloudflare.com/26d066ec62c4d27b8da5e9aebac17293/registrar/domains',
  },
  WORKERS_AND_PAGES: {
    NAME: 'VB - Cloudflare Workers and Pages',
    URL: 'https://dash.cloudflare.com/26d066ec62c4d27b8da5e9aebac17293/workers-and-pages',
  },
  R2_BUCKETS: {
    NAME: 'VB - Cloudflare R2 Buckets',
    URL: 'https://dash.cloudflare.com/26d066ec62c4d27b8da5e9aebac17293/r2/overview',
  },
} as const;

export const FLYIO_ACCOUNT_LINK = {
  USAGE: {
    NAME: 'Fly.io Usage',
    URL: 'https://fly.io/dashboard/harry-560/billing/cost-explorer',
  },
  STATUS: {
    NAME: 'Fly.io Status',
    URL: 'https://fly.io/dashboard/harry-560/status',
  },
} as const;

export const GCP_PROJECT_LINK = {
  DASHBOARD: {
    NAME: 'GCP Dashboard',
    URL: 'https://console.cloud.google.com/home/dashboard?project=vigilant-broccoli',
  },
  BILLING: {
    NAME: 'VB - GCP Billing',
    URL: 'https://console.cloud.google.com/billing/017A09-73DEB3-7A8E42/reports?inv=1&invt=Ab2jMQ&project=vigilant-broccoli',
  },
  COMPUTE_INSTANCES: {
    NAME: 'VB - GCE Instances',
    URL: 'https://console.cloud.google.com/compute/instances?inv=1&invt=Ab2jIQ&project=vigilant-broccoli',
  },
} as const;

export const TERRAFORM_ORG_LINK = {
  DASHBOARD: {
    NAME: 'Terraform Dashboard',
    URL: 'https://app.terraform.io/app/vigilant-broccoli/workspaces',
  },
  BILLING: {
    NAME: 'Terraform Billing',
    URL: 'https://app.terraform.io/app/vigilant-broccoli/settings/billing',
  },
  USAGE: {
    NAME: 'Terraform Usage',
    URL: 'https://app.terraform.io/app/vigilant-broccoli/usage',
  },
} as const;

export const ROBOFLOW_WORKSPACE_LINK = {
  BILLING: {
    NAME: 'Roboflow Billing',
    URL: 'https://app.roboflow.com/vigilantbroccoli/settings/plan',
  },
  USAGE: {
    NAME: 'Roboflow Usage',
    URL: 'https://app.roboflow.com/vigilantbroccoli/settings/usage',
  },
} as const;

export const SLACK_WORKSPACE_LINK = {
  OK_IN_SLACK_DEMO: {
    NAME: 'OK-IN Slack Demo',
    URL: 'https://app.slack.com/client/T0C9JSXB8UR/D0C9XA53B8E',
  },
} as const;

export const NPM_USER_LINK = {
  PACKAGES: {
    NAME: 'VB - NPM Packages (prettydamntired)',
    URL: 'https://www.npmjs.com/settings/prettydamntired/packages',
  },
  TOKENS: {
    NAME: 'VB - NPM Tokens (prettydamntired)',
    URL: 'https://www.npmjs.com/settings/prettydamntired/tokens',
  },
} as const;

export const SUPABASE_PROJECT_LINK = {
  ORGANIZATION: {
    NAME: 'Supabase Organization (vigilant-broccoli)',
    URL: 'https://supabase.com/dashboard/org/jqyyytkbstihvvbalofm',
  },
  PROJECT: {
    NAME: 'Supabase Project (vigilant-broccoli)',
    URL: 'https://supabase.com/dashboard/project/jrdosjjgmsoodpjmjqxx',
  },
  AUTH_URL_CONFIGURATION: {
    NAME: 'Supabase Auth URL Configuration (vigilant-broccoli)',
    URL: 'https://supabase.com/dashboard/project/jrdosjjgmsoodpjmjqxx/auth/url-configuration',
  },
} as const;

export const SANITY_ORG_LINK = {
  APPLICATIONS: {
    NAME: 'Sanity Applications',
    URL: 'https://www.sanity.io/@ogjQYJiGp/applications',
  },
} as const;
