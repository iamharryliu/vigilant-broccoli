import { NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const GCP_PROJECT = 'vigilant-broccoli';
const VAULT_TOKEN_SECRET = 'VB_VM_VAULT_ROOT_TOKEN';

export async function GET() {
  try {
    const { stdout } = await execAsync(
      `gcloud secrets versions access latest --secret=${VAULT_TOKEN_SECRET} --project=${GCP_PROJECT}`,
    );

    return NextResponse.json({ success: true, token: stdout.trim() });
  } catch (error) {
    console.error('Error fetching vault root token:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vault root token' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}
