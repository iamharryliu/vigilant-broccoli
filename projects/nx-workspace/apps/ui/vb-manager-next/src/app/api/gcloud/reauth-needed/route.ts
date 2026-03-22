import { NextResponse } from 'next/server';
import { exec } from 'child_process';

interface ReauthStatus {
  needsReauth: boolean;
  activeAccount: string | null;
  error?: string;
}

export async function GET() {
  return new Promise<NextResponse>(resolve => {
    exec(
      'gcloud config get-value account 2>/dev/null',
      (error, accountOutput) => {
        const activeAccount = accountOutput?.trim() || null;

        if (!activeAccount) {
          resolve(
            NextResponse.json({
              needsReauth: true,
              activeAccount: null,
              error: 'No active account configured',
            }),
          );
          return;
        }

        const child = exec(
          'gcloud projects list --limit=1 2>&1',
          (execError, stdout, stderr) => {
            const output = (stdout || '') + (stderr || '');
            const needsReauth =
              output.includes('Reauthentication') ||
              output.includes('cannot prompt during non-interactive') ||
              output.includes('Please enter your password') ||
              output.includes('invalid_grant') ||
              execError?.code === 1;

            const status: ReauthStatus = {
              needsReauth,
              activeAccount,
              error: needsReauth
                ? 'Run: gcloud auth login && gcloud auth application-default login'
                : undefined,
            };

            resolve(NextResponse.json(status));
          },
        );

        const timeout = setTimeout(() => {
          child.kill();
          resolve(
            NextResponse.json({
              needsReauth: true,
              activeAccount,
              error:
                'Run: gcloud auth login && gcloud auth application-default login',
            }),
          );
        }, 2000);

        child.on('close', () => clearTimeout(timeout));
      },
    );
  });
}
