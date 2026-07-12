export interface AppSecretsConfig {
  flyAppName: string;
  appPath: string;
  vaultPath: string;
  excludeEnvVars?: string[];
}

export interface SecretsMapping {
  [projectName: string]: AppSecretsConfig;
}

const COMMON_VAULT_PATH = '/kv/data/secrets';

const COMMON_EXCLUDED_VARS = ['PORT', 'HOST', 'NODE_ENV'];

export const secretsMapping: SecretsMapping = {
  'vb-express': {
    flyAppName: 'staging-vb-express',
    appPath: './apps/api/vb-express',
    vaultPath: COMMON_VAULT_PATH,
    excludeEnvVars: COMMON_EXCLUDED_VARS,
  },
  'llm-service': {
    flyAppName: 'staging-vb-llm-service',
    appPath: './apps/api/llm-service',
    vaultPath: COMMON_VAULT_PATH,
    excludeEnvVars: COMMON_EXCLUDED_VARS,
  },
  'email-service': {
    flyAppName: 'staging-vb-email-service',
    appPath: './apps/api/email-service',
    vaultPath: COMMON_VAULT_PATH,
    excludeEnvVars: COMMON_EXCLUDED_VARS,
  },
  'email-subscription-service': {
    flyAppName: 'staging-email-subscription-service',
    appPath: './apps/api/email-subscription-service',
    vaultPath: COMMON_VAULT_PATH,
    excludeEnvVars: COMMON_EXCLUDED_VARS,
  },
  'bucket-service': {
    flyAppName: 'staging-vb-storage-service',
    appPath: './apps/api/bucket-service',
    vaultPath: COMMON_VAULT_PATH,
    excludeEnvVars: COMMON_EXCLUDED_VARS,
  },
  'vb-manager-next-mobile': {
    flyAppName: 'staging-vb-manager-next-mobile',
    appPath: './apps/vb-manager-next-mobile',
    vaultPath: COMMON_VAULT_PATH,
    excludeEnvVars: [
      ...COMMON_EXCLUDED_VARS,
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    ],
  },
};
