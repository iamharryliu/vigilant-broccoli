import { NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { readFile } from 'fs/promises';
import { homedir } from 'os';
import { join } from 'path';

const TF_HOST = 'app.terraform.io';
const TF_ORGANIZATION = 'vigilant-broccoli';
const TF_WORKSPACE = 'vigilant-broccoli-infrastructure';

interface TerraformAuthStatus {
  loggedIn: boolean;
  organization: string;
  workspace: string;
  username: string | null;
  email: string | null;
}

const fetchAccountDetails = async (
  token: string,
): Promise<{ username: string | null; email: string | null }> => {
  try {
    const response = await fetch(`https://${TF_HOST}/api/v2/account/details`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.api+json',
      },
    });
    if (!response.ok) return { username: null, email: null };
    const { data } = await response.json();
    return {
      username: data?.attributes?.username ?? null,
      email: data?.attributes?.email ?? null,
    };
  } catch {
    return { username: null, email: null };
  }
};

export async function GET() {
  try {
    const credentialsPath = join(
      homedir(),
      '.terraform.d',
      'credentials.tfrc.json',
    );
    const token = await readFile(credentialsPath, 'utf-8')
      .then(
        content => JSON.parse(content)?.credentials?.[TF_HOST]?.token ?? null,
      )
      .catch(() => null);

    const { username, email } = token
      ? await fetchAccountDetails(token)
      : { username: null, email: null };

    const status: TerraformAuthStatus = {
      loggedIn: Boolean(token),
      organization: TF_ORGANIZATION,
      workspace: TF_WORKSPACE,
      username,
      email,
    };

    return NextResponse.json(status);
  } catch (error) {
    console.error('Error fetching Terraform auth status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Terraform auth status' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}
