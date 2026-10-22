import { NextResponse } from 'next/server';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';
import {
  PREVIEW_DEPLOYMENTS_ERROR_STATUS,
  getPreviewDeployments,
} from '@vigilant-broccoli/github-workspace-js';

export const dynamic = 'force-dynamic';

// Optional and read-only: unset, GitHub allows 60 calls per hour per IP.
// Read once, so an unset token warns at startup rather than on every request.
const GITHUB_TOKEN = getEnvironmentVariable('GITHUB_TOKEN');

export async function GET() {
  const result = await getPreviewDeployments(GITHUB_TOKEN);
  return result.ok
    ? NextResponse.json(result)
    : NextResponse.json(result, {
        status: PREVIEW_DEPLOYMENTS_ERROR_STATUS[result.error],
      });
}
