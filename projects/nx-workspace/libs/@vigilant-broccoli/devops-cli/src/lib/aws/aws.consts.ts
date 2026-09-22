export const AWS_CLI = 'aws';

export const AwsCommand = {
  getCallerIdentity: (profile: string) => [
    'sts',
    'get-caller-identity',
    '--profile',
    profile,
    '--output',
    'json',
  ],
} as const;

export const AWS_CONFIG_FILE_SEGMENTS = ['.aws', 'config'] as const;
export const AWS_IDENTITY_TIMEOUT_MS = 5000;

export const AWS_CONFIG_KEY = {
  REGION: 'region',
  SSO_START_URL: 'sso_start_url',
  SSO_SESSION: 'sso_session',
  SSO_ACCOUNT_ID: 'sso_account_id',
  SSO_ROLE_NAME: 'sso_role_name',
} as const;

export const SSO_EXPIRED_ERROR_STRINGS = [
  'Token has expired',
  'SSO',
  'not logged in',
  'Error loading SSO',
] as const;
