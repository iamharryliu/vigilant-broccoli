export const PM2_CLI = 'pm2';

export const PM2_ACTION = {
  START: 'start',
  STOP: 'stop',
  RESTART: 'restart',
  DELETE: 'delete',
} as const;

export type Pm2Action = (typeof PM2_ACTION)[keyof typeof PM2_ACTION];

// Restarting goes through `reload` so a running process is replaced without downtime.
const PM2_ACTION_SUBCOMMAND: Record<Pm2Action, string> = {
  [PM2_ACTION.START]: 'start',
  [PM2_ACTION.STOP]: 'stop',
  [PM2_ACTION.RESTART]: 'reload',
  [PM2_ACTION.DELETE]: 'delete',
};

export const Pm2Command = {
  listProcesses: ['jlist'],
  processAction: (action: Pm2Action, processId: string) => [
    PM2_ACTION_SUBCOMMAND[action],
    processId,
  ],
} as const;

const PM2_PROCESS_ID_PATTERN = /^[\w.-]+$/;

export const isValidPm2ProcessId = (processId: string): boolean =>
  PM2_PROCESS_ID_PATTERN.test(processId);
