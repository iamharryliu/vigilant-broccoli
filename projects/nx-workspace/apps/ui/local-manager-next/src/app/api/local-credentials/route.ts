import { NextRequest, NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import {
  LOCAL_CREDENTIAL_SERVICE,
  LocalCredentialService,
} from '../../constants/local-credentials';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const execFileAsync = promisify(execFile);

const KUBECTL_BASE_ARGS = ['--context', 'k3d-vb-local', '-n', 'local-platform'];

// Mirrors the local:k3s:grafana:password and local:k3s:headlamp:token root
// scripts; the service name is matched against this map, never passed through.
const READ_CREDENTIAL: Record<LocalCredentialService, () => Promise<string>> = {
  [LOCAL_CREDENTIAL_SERVICE.GRAFANA]: async () => {
    const { stdout } = await execFileAsync('kubectl', [
      ...KUBECTL_BASE_ARGS,
      'get',
      'secret',
      'grafana',
      '-o',
      'jsonpath={.data.admin-password}',
    ]);
    return Buffer.from(stdout.trim(), 'base64').toString('utf-8');
  },
  [LOCAL_CREDENTIAL_SERVICE.HEADLAMP]: async () => {
    const { stdout } = await execFileAsync('kubectl', [
      ...KUBECTL_BASE_ARGS,
      'create',
      'token',
      'headlamp',
      '--duration=24h',
    ]);
    return stdout.trim();
  },
};

const isService = (value: string | null): value is LocalCredentialService =>
  Object.values(LOCAL_CREDENTIAL_SERVICE).includes(
    value as LocalCredentialService,
  );

export async function GET(request: NextRequest) {
  const service = request.nextUrl.searchParams.get('service');
  if (!isService(service)) {
    return NextResponse.json(
      { error: 'Unknown service' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  try {
    return NextResponse.json({ value: await READ_CREDENTIAL[service]() });
  } catch {
    return NextResponse.json(
      { error: 'Failed to read credential from the local k3s cluster' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}
