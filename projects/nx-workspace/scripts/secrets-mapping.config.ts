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
    flyAppName: 'vb-express',
    appPath: './apps/api/vb-express',
    vaultPath: COMMON_VAULT_PATH,
    excludeEnvVars: COMMON_EXCLUDED_VARS,
  },
  'personal-website-backend': {
    flyAppName: 'harryliu-personal-website-backend',
    appPath: './apps/personal-website/personal-website-backend',
    vaultPath: COMMON_VAULT_PATH,
    excludeEnvVars: COMMON_EXCLUDED_VARS,
  },
};
