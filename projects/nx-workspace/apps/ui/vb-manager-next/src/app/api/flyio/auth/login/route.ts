import { NextResponse } from 'next/server';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import { FlyioCommand } from '@vigilant-broccoli/ci';

const execAsync = promisify(exec);

const WAIT_FOR_AUTH_ATTEMPTS = 10;
const WAIT_FOR_AUTH_INTERVAL_MS = 500;

const waitForAuth = async (): Promise<void> => {
  for (let i = 0; i < WAIT_FOR_AUTH_ATTEMPTS; i++) {
    try {
      await execAsync(FlyioCommand.authToken);
      return;
    } catch {
      await new Promise(resolve =>
        setTimeout(resolve, WAIT_FOR_AUTH_INTERVAL_MS),
      );
    }
  }
  throw new Error('Auth token not available after login');
};

export async function POST() {
  await new Promise<void>((resolve, reject) => {
    const [cmd, ...args] = FlyioCommand.authLogin.split(' ');
    const child = spawn(cmd, args, { stdio: 'ignore' });
    child.on('close', code => (code === 0 ? resolve() : reject(code)));
    child.on('error', reject);
  });
  await waitForAuth();
  return NextResponse.json({ success: true });
}
