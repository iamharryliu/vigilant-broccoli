import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const execAsync = promisify(exec);

export interface LocalService {
  pid: number;
  name: string;
  port: number;
  protocol: 'TCP' | 'UDP';
}

export async function GET() {
  try {
    const { stdout } = await execAsync('lsof -iTCP -sTCP:LISTEN -n -P', {
      shell: '/bin/zsh',
    }).catch(err => ({ stdout: (err.stdout as string) ?? '' }));

    const services: LocalService[] = [];
    const seen = new Set<string>();

    for (const line of stdout.trim().split('\n')) {
      if (!line) continue;

      const parts = line.split(/\s+/);
      const name = parts[0];
      const pid = parseInt(parts[1], 10);
      // Match *:PORT (all-interfaces wildcard on macOS) or 0.0.0.0:PORT (Linux)
      const addrPart = parts.find(p => /^(\*|0\.0\.0\.0):\d+$/.test(p)) ?? '';

      if (!addrPart) continue;
      const match = addrPart.match(/:(\d+)$/);
      if (!match) continue;

      const port = parseInt(match[1], 10);
      const protocol = line.includes('UDP') ? 'UDP' : 'TCP';
      const key = `${port}-${protocol}`;

      if (seen.has(key) || isNaN(pid) || isNaN(port)) continue;
      seen.add(key);

      services.push({ pid, name, port, protocol });
    }

    services.sort((a, b) => a.port - b.port);

    return NextResponse.json(services);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch local services' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}
