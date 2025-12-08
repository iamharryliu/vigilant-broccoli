import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface FlyApp {
  name: string;
  status: string;
}

export async function GET() {
  try {
    const { stdout } = await execAsync('flyctl apps list --json');

    const apps = JSON.parse(stdout);

    const formattedApps: FlyApp[] = apps.map(
      (app: { Name: string; Status: string }) => ({
        name: app.Name,
        status: app.Status,
      }),
    );

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
      { status: 500 },
    );
  }
}
