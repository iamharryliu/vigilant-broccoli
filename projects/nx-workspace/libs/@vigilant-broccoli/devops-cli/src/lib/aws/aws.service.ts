import { readFile } from 'fs/promises';
import { homedir } from 'os';
import { join } from 'path';
import { runCli } from '../cli/cli.utils';
import {
  AWS_CLI,
  AWS_CONFIG_FILE_SEGMENTS,
  AWS_CONFIG_KEY,
  AWS_IDENTITY_TIMEOUT_MS,
  AwsCommand,
  SSO_EXPIRED_ERROR_STRINGS,
} from './aws.consts';

export interface AwsIdentity {
  accountId: string;
  arn: string;
  userId: string;
}

export interface AwsProfile {
  name: string;
  region: string | null;
  ssoAccountId: string | null;
  ssoRoleName: string | null;
  isSso: boolean;
  identity: AwsIdentity | null;
  ssoExpired: boolean;
}

interface CallerIdentityJson {
  Account: string;
  Arn: string;
  UserId: string;
}

type ProfileDraft = Partial<AwsProfile> & { name: string; isSso: boolean };

const DEFAULT_PROFILE_NAME = 'default';
// `[default]` carries no `profile` prefix; `[sso-session ...]` is not a profile.
const PROFILE_SECTION_PATTERN = /^\[(?:profile\s+([^\]]+)|default)\]/;
const COMMENT_PREFIX = '#';
const KEY_VALUE_SEPARATOR = '=';

const buildProfile = (draft: ProfileDraft): AwsProfile => ({
  name: draft.name,
  region: draft.region ?? null,
  ssoAccountId: draft.ssoAccountId ?? null,
  ssoRoleName: draft.ssoRoleName ?? null,
  isSso: draft.isSso,
  identity: null,
  ssoExpired: false,
});

const applyConfigEntry = (draft: ProfileDraft, line: string): void => {
  const [rawKey, ...valueParts] = line.split(KEY_VALUE_SEPARATOR);
  const key = rawKey.trim();
  const value = valueParts.join(KEY_VALUE_SEPARATOR).trim();

  if (key === AWS_CONFIG_KEY.REGION) draft.region = value;
  if (
    key === AWS_CONFIG_KEY.SSO_START_URL ||
    key === AWS_CONFIG_KEY.SSO_SESSION
  )
    draft.isSso = true;
  if (key === AWS_CONFIG_KEY.SSO_ACCOUNT_ID) draft.ssoAccountId = value;
  if (key === AWS_CONFIG_KEY.SSO_ROLE_NAME) draft.ssoRoleName = value;
};

const parseAwsConfig = (content: string): AwsProfile[] => {
  const profiles: AwsProfile[] = [];
  let current: ProfileDraft | null = null;

  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    const sectionMatch = trimmed.match(PROFILE_SECTION_PATTERN);

    if (sectionMatch) {
      if (current) profiles.push(buildProfile(current));
      current = {
        name: (sectionMatch[1] ?? DEFAULT_PROFILE_NAME).trim(),
        region: null,
        isSso: false,
        ssoRoleName: null,
      };
    } else if (current && trimmed && !trimmed.startsWith(COMMENT_PREFIX)) {
      applyConfigEntry(current, trimmed);
    }
  }

  if (current) profiles.push(buildProfile(current));
  return profiles;
};

const fetchIdentity = async (
  profile: AwsProfile,
): Promise<Pick<AwsProfile, 'identity' | 'ssoExpired'>> => {
  try {
    const { stdout } = await runCli(
      AWS_CLI,
      AwsCommand.getCallerIdentity(profile.name),
      { timeoutMs: AWS_IDENTITY_TIMEOUT_MS },
    );
    const parsed: CallerIdentityJson = JSON.parse(stdout);
    return {
      identity: {
        accountId: parsed.Account,
        arn: parsed.Arn,
        userId: parsed.UserId,
      },
      ssoExpired: false,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const ssoExpired = SSO_EXPIRED_ERROR_STRINGS.some(s => message.includes(s));
    return { identity: null, ssoExpired: profile.isSso && ssoExpired };
  }
};

const listProfiles = async (): Promise<AwsProfile[]> => {
  const configPath = join(homedir(), ...AWS_CONFIG_FILE_SEGMENTS);
  const profiles = parseAwsConfig(await readFile(configPath, 'utf-8'));

  return Promise.all(
    profiles.map(async profile => ({
      ...profile,
      ...(await fetchIdentity(profile)),
    })),
  );
};

export const AwsService = {
  listProfiles,
};
