import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile } from 'fs/promises';
import { homedir } from 'os';
import { join } from 'path';

const execAsync = promisify(exec);

export interface AwsProfile {
  name: string;
  region: string | null;
  ssoAccountId: string | null;
  ssoRoleName: string | null;
  isSso: boolean;
  identity: { accountId: string; arn: string; userId: string } | null;
  ssoExpired: boolean;
}

const parseAwsConfig = (content: string): AwsProfile[] => {
  const profiles: AwsProfile[] = [];
  const sectionRegex = /^\[(?:profile\s+([^\]]+)|default)\]/;
  let current: (Partial<AwsProfile> & { name: string; isSso: boolean }) | null =
    null;

  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    const sectionMatch = trimmed.match(sectionRegex);

    if (sectionMatch) {
      if (current) profiles.push(buildProfile(current));
      current = {
        name: (sectionMatch[1] ?? 'default').trim(),
        region: null,
        isSso: false,
        ssoRoleName: null,
      };
    } else if (current && trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').trim();
      if (key.trim() === 'region') current.region = value;
      if (key.trim() === 'sso_start_url' || key.trim() === 'sso_session')
        current.isSso = true;
      if (key.trim() === 'sso_account_id') current.ssoAccountId = value;
      if (key.trim() === 'sso_role_name') current.ssoRoleName = value;
    }
  }

  if (current) profiles.push(buildProfile(current));
  return profiles;
};

const buildProfile = (
  raw: Partial<AwsProfile> & { name: string; isSso: boolean },
): AwsProfile => ({
  name: raw.name,
  region: raw.region ?? null,
  ssoAccountId: raw.ssoAccountId ?? null,
  ssoRoleName: raw.ssoRoleName ?? null,
  isSso: raw.isSso,
  identity: null,
  ssoExpired: false,
});

const fetchIdentity = async (
  profile: AwsProfile,
): Promise<{ identity: AwsProfile['identity']; ssoExpired: boolean }> => {
  try {
    const { stdout } = await execAsync(
      `aws sts get-caller-identity --profile ${profile.name} --output json`,
      { timeout: 5000 },
    );
    const parsed = JSON.parse(stdout);
    return {
      identity: {
        accountId: parsed.Account,
        arn: parsed.Arn,
        userId: parsed.UserId,
      },
      ssoExpired: false,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const ssoExpired =
      msg.includes('Token has expired') ||
      msg.includes('SSO') ||
      msg.includes('not logged in') ||
      msg.includes('Error loading SSO');
    return { identity: null, ssoExpired: profile.isSso && ssoExpired };
  }
};

export async function GET() {
  try {
    const configPath = join(homedir(), '.aws', 'config');
    const content = await readFile(configPath, 'utf-8');
    const profiles = parseAwsConfig(content);

    const enriched = await Promise.all(
      profiles.map(async p => {
        const { identity, ssoExpired } = await fetchIdentity(p);
        return { ...p, identity, ssoExpired };
      }),
    );

    return NextResponse.json({ profiles: enriched });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch AWS profiles' },
      { status: 500 },
    );
  }
}
