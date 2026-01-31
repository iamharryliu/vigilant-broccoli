import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface PM2Process {
  pm_id: number;
  name: string;
  status: 'online' | 'stopped' | 'errored' | 'stopping' | 'launching';
  cpu: number;
  memory: number;
  restarts: number;
  uptime: number;
}

export async function GET() {
  try {
    const { stdout } = await execAsync('pm2 jlist');
    const processes = JSON.parse(stdout);

    const pm2Processes: PM2Process[] = processes.map((proc: any) => {
      const pmUptime = proc.pm2_env?.pm_uptime || 0;
      const uptimeDuration = pmUptime > 0 ? Date.now() - pmUptime : 0;

      return {
        pm_id: proc.pm_id,
        name: proc.name,
        status: proc.pm2_env?.status || 'stopped',
        cpu: proc.monit?.cpu || 0,
        memory: proc.monit?.memory || 0,
        restarts: proc.pm2_env?.restart_time || 0,
        uptime: uptimeDuration,
      };
    });

    return NextResponse.json(pm2Processes);
  } catch (error) {
    console.error('Error fetching PM2 processes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch PM2 processes' },
      { status: 500 }
    );
  }
}
