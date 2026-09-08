export interface AppSecretsConfig {
  flyAppBaseName: string;
  appPath: string;
  vaultPath: string;
  excludeEnvVars?: string[];
  privateOnly?: boolean;
}

export interface SecretsMapping {
  [projectName: string]: AppSecretsConfig;
}

const COMMON_VAULT_PATH = '/kv/data/secrets';

const COMMON_EXCLUDED_VARS = ['PORT', 'HOST', 'NODE_ENV'];

export const secretsMapping: SecretsMapping = {
  'vb-express': {
    flyAppBaseName: 'vb-express',
    appPath: './apps/api/vb-express',
    vaultPath: COMMON_VAULT_PATH,
    excludeEnvVars: COMMON_EXCLUDED_VARS,
  },
  'llm-service': {
    flyAppBaseName: 'llm-service',
    appPath: './apps/api/llm-service',
    vaultPath: COMMON_VAULT_PATH,
    excludeEnvVars: COMMON_EXCLUDED_VARS,
    privateOnly: true,
  },
  'email-service': {
    flyAppBaseName: 'vb-email-service',
    appPath: './apps/api/email-service',
    vaultPath: COMMON_VAULT_PATH,
    excludeEnvVars: COMMON_EXCLUDED_VARS,
    privateOnly: true,
  },
  'email-subscription-service': {
    flyAppBaseName: 'email-subscription-service',
    appPath: './apps/api/email-subscription-service',
    vaultPath: COMMON_VAULT_PATH,
    excludeEnvVars: COMMON_EXCLUDED_VARS,
    privateOnly: true,
  },
  'bucket-service': {
    flyAppBaseName: 'storage-service',
    appPath: './apps/api/bucket-service',
    vaultPath: COMMON_VAULT_PATH,
    excludeEnvVars: COMMON_EXCLUDED_VARS,
    privateOnly: true,
  },
};
