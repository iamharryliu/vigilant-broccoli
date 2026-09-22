import { runCli, runCliJson } from '../cli/cli.utils';
import { PM2_CLI, Pm2Action, Pm2Command } from './pm2.consts';

export const PM2_PROCESS_STATUS = {
  ONLINE: 'online',
  STOPPED: 'stopped',
  ERRORED: 'errored',
  STOPPING: 'stopping',
  LAUNCHING: 'launching',
} as const;

export type Pm2ProcessStatus =
  (typeof PM2_PROCESS_STATUS)[keyof typeof PM2_PROCESS_STATUS];

export interface Pm2Process {
  pm_id: number;
  name: string;
  status: Pm2ProcessStatus;
  cpu: number;
  memory: number;
  restarts: number;
  uptime: number;
}

interface Pm2ListEntry {
  pm_id: number;
  name: string;
  pm2_env?: {
    status?: Pm2ProcessStatus;
    restart_time?: number;
    pm_uptime?: number;
  };
  monit?: { cpu?: number; memory?: number };
}

const NO_UPTIME = 0;

const toProcess = (entry: Pm2ListEntry): Pm2Process => {
  const startedAt = entry.pm2_env?.pm_uptime ?? NO_UPTIME;
  return {
    pm_id: entry.pm_id,
    name: entry.name,
    status: entry.pm2_env?.status ?? PM2_PROCESS_STATUS.STOPPED,
    cpu: entry.monit?.cpu ?? 0,
    memory: entry.monit?.memory ?? 0,
    restarts: entry.pm2_env?.restart_time ?? 0,
    uptime: startedAt > NO_UPTIME ? Date.now() - startedAt : NO_UPTIME,
  };
};

const listProcesses = async (): Promise<Pm2Process[]> => {
  const entries = await runCliJson<Pm2ListEntry[]>(
    PM2_CLI,
    Pm2Command.listProcesses,
  );
  return entries.map(toProcess);
};

const runProcessAction = async (
  action: Pm2Action,
  processId: string,
): Promise<void> => {
  await runCli(PM2_CLI, Pm2Command.processAction(action, processId));
};

export const Pm2Service = {
  listProcesses,
  runProcessAction,
};
