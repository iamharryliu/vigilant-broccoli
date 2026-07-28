import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { createTtlCache } from '../../../utils/ttl-cache.utils';

interface ReauthStatus {
  needsReauth: boolean;
  activeAccount: string | null;
  error?: string;
}

const REAUTH_CACHE_TTL_MS = 5 * 60 * 1000;
const REAUTH_CHECK_TIMEOUT_MS = 2000;

function checkReauthStatus(): Promise<ReauthStatus> {
  return new Promise<ReauthStatus>(resolve => {
    exec(
      'gcloud config get-value account 2>/dev/null',
      (error, accountOutput) => {
        const activeAccount = accountOutput?.trim() || null;

        if (!activeAccount) {
          resolve({
            needsReauth: true,
            activeAccount: null,
            error: 'No active account configured',
          });
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

            resolve({
              needsReauth,
              activeAccount,
              error: needsReauth
                ? 'Run: gcloud auth login && gcloud auth application-default login'
                : undefined,
            });
          },
        );

        const timeout = setTimeout(() => {
          child.kill();
          resolve({
            needsReauth: true,
            activeAccount,
            error:
              'Run: gcloud auth login && gcloud auth application-default login',
          });
        }, REAUTH_CHECK_TIMEOUT_MS);

        child.on('close', () => clearTimeout(timeout));
      },
    );
  });
}

const getCachedReauthStatus = createTtlCache(
  REAUTH_CACHE_TTL_MS,
  checkReauthStatus,
);

export async function GET(request: NextRequest) {
  const forceFresh = request.nextUrl.searchParams.get('fresh') === '1';
  const status = await getCachedReauthStatus(forceFresh);
  return NextResponse.json(status);
}
