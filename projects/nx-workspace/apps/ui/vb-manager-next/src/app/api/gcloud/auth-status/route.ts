import { NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface GcloudAccount {
  account: string;
  status: string;
}

interface GcloudAuthStatus {
  activeAccount: string | null;
  accounts: GcloudAccount[];
  currentProject: string | null;
}

export async function GET() {
  try {
    const [accountsResult, projectResult] = await Promise.all([
      execAsync('gcloud auth list --format="value(account,status)"'),
      execAsync('gcloud config get-value project 2>/dev/null').catch(
        () => ({ stdout: '' }),
      ),
    ]);

    const accounts: GcloudAccount[] = accountsResult.stdout
      .trim()
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        const parts = line.split('\t');
        const account = parts[0]?.trim() || '';
        const status = parts[1]?.trim() || '';
        // Status is '*' for active account, empty for inactive
        return {
          account,
          status: status === '*' ? 'ACTIVE' : 'INACTIVE',
        };
      });

    const activeAccount =
      accounts.find(acc => acc.status === 'ACTIVE')?.account || null;
    const currentProject = projectResult.stdout.trim() || null;

    const status: GcloudAuthStatus = {
      activeAccount,
      accounts,
      currentProject,
    };

    return NextResponse.json(status);
  } catch (error) {
    console.error('Error fetching gcloud auth status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gcloud auth status' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}
