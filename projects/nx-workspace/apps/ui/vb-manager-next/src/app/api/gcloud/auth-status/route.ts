import { NextResponse } from 'next/server';
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
    // Get list of authenticated accounts
    const { stdout: accountsOutput } = await execAsync('gcloud auth list --format="value(account,status)"');

    const accounts: GcloudAccount[] = accountsOutput
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
          status: status === '*' ? 'ACTIVE' : 'INACTIVE'
        };
      });

    const activeAccount = accounts.find(acc => acc.status === 'ACTIVE')?.account || null;

    // Get current project
    let currentProject: string | null = null;
    try {
      const { stdout: projectOutput } = await execAsync('gcloud config get-value project 2>/dev/null');
      currentProject = projectOutput.trim() || null;
    } catch {
      // If no project is set, that's okay
      currentProject = null;
    }

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
      { status: 500 }
    );
  }
}
