import { NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const GCP_PROJECT = 'vigilant-broccoli';
const VAULT_TOKEN_SECRET = 'VB_VM_VAULT_ROOT_TOKEN';
const COPY_VAULT_TOKEN_COMMAND = `gcloud secrets versions access latest --secret=${VAULT_TOKEN_SECRET} --project=${GCP_PROJECT} | pbcopy`;

export async function POST() {
  try {
    await execAsync(COPY_VAULT_TOKEN_COMMAND);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error copying vault root token:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to copy vault root token' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}
