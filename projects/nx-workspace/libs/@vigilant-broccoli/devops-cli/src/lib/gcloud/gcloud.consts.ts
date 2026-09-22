export const GCLOUD_CLI = 'gcloud';

export const GcloudCommand = {
  listAuth: ['auth', 'list', '--format=value(account,status)'],
  getAccount: ['config', 'get-value', 'account'],
  getProject: ['config', 'get-value', 'project'],
  listProjects: [
    'projects',
    'list',
    '--format=value(projectId,name,projectNumber)',
  ],
  probeProjects: ['projects', 'list', '--limit=1'],
  setAccount: (account: string) => ['config', 'set', 'account', account],
  setProject: (projectId: string) => ['config', 'set', 'project', projectId],
  accessSecret: (secret: string, project: string) => [
    'secrets',
    'versions',
    'access',
    'latest',
    `--secret=${secret}`,
    `--project=${project}`,
  ],
} as const;

// gcloud accounts are email addresses, service accounts included.
const GCLOUD_ACCOUNT_PATTERN = /^[\w.+-]+@[\w.-]+$/;
// Plain ids plus the `domain.com:project` form legacy domain-scoped projects use.
const GCLOUD_PROJECT_ID_PATTERN = /^[\w.:-]+$/;

export const isValidGcloudAccount = (account: string): boolean =>
  GCLOUD_ACCOUNT_PATTERN.test(account);

export const isValidGcloudProjectId = (projectId: string): boolean =>
  GCLOUD_PROJECT_ID_PATTERN.test(projectId);

export const GCLOUD_ACTIVE_STATUS_MARKER = '*';
export const GCLOUD_ACCOUNT_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;

export const REAUTH_PROBE_TIMEOUT_MS = 2000;
export const REAUTH_COMMAND =
  'gcloud auth login && gcloud auth application-default login';
export const REAUTH_HINT = `Run: ${REAUTH_COMMAND}`;
export const NO_ACTIVE_ACCOUNT_ERROR = 'No active account configured';
export const REAUTH_ERROR_STRINGS = [
  'Reauthentication',
  'cannot prompt during non-interactive',
  'Please enter your password',
  'invalid_grant',
] as const;

export const VAULT_TOKEN_GCP_PROJECT = 'vigilant-broccoli';
export const VAULT_TOKEN_SECRET = 'VB_VM_VAULT_ROOT_TOKEN';
