import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { FlyioCommand } from '@vigilant-broccoli/ci';

const execAsync = promisify(exec);

const AUTH_ERROR_STRINGS = ['no access token', 'not logged in', 'unauthorized'];

interface FlyApp {
  name: string;
  status: string;
}

export async function GET() {
  try {
    const { stdout } = await execAsync(FlyioCommand.listApps);
    const apps = JSON.parse(stdout);
    const formattedApps: FlyApp[] = apps.map(
      (app: { Name: string; Status: string }) => ({
        name: app.Name,
        status: app.Status,
      }),
    );
    return NextResponse.json({ success: true, apps: formattedApps });
  } catch (error) {
    console.error('Error fetching Fly.io apps:', error);
    const stderr = (error as { stderr?: string }).stderr ?? '';
    const authRequired = AUTH_ERROR_STRINGS.some(s => stderr.includes(s));
    return NextResponse.json(
      { success: false, error: 'Failed to fetch Fly.io apps', authRequired },
      { status: authRequired ? 401 : 500 },
    );
  }
}
