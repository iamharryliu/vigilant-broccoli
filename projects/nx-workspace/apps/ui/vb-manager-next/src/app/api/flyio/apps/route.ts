import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface FlyApp {
  name: string;
  owner: string;
  status: string;
  latestDeploy: string | null;
}

export async function GET() {
  try {
    // Get list of Fly.io apps using flyctl
    const { stdout } = await execAsync('flyctl apps list --json');

    const apps = JSON.parse(stdout);

    // Transform the data to match our interface
    const formattedApps: FlyApp[] = apps.map((app: any) => ({
      name: app.Name || app.name || '',
      owner: app.Organization?.Slug || app.organization || 'personal',
      status: app.Status || app.status || 'unknown',
      latestDeploy: app.Deployed ? new Date(app.Deployed).toISOString() : null,
    }));

    return NextResponse.json({
      success: true,
      apps: formattedApps,
    });
  } catch (error) {
    console.error('Error fetching Fly.io apps:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch Fly.io apps',
      },
      { status: 500 }
    );
  }
}
