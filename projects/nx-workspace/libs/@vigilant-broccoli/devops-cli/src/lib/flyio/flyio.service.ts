import { runCliJson, runCliToCompletion, tryRunCli } from '../cli/cli.utils';
import {
  FLYCTL_CLI,
  FLYIO_AUTH_ERROR_STRINGS,
  FlyioCommand,
} from './flyio.consts';

export interface FlyApp {
  name: string;
  status: string;
}

interface FlyAppJson {
  Name: string;
  Status: string;
}

const WAIT_FOR_AUTH_ATTEMPTS = 10;
const WAIT_FOR_AUTH_INTERVAL_MS = 500;

const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

const listApps = async (): Promise<FlyApp[]> => {
  const apps = await runCliJson<FlyAppJson[]>(
    FLYCTL_CLI,
    FlyioCommand.listApps,
  );
  return apps.map(app => ({ name: app.Name, status: app.Status }));
};

// `flyctl auth login` returns before the token lands on disk.
const waitForAuthToken = async (): Promise<void> => {
  for (let attempt = 0; attempt < WAIT_FOR_AUTH_ATTEMPTS; attempt++) {
    if (await tryRunCli(FLYCTL_CLI, FlyioCommand.authToken)) return;
    await sleep(WAIT_FOR_AUTH_INTERVAL_MS);
  }
  throw new Error('Auth token not available after login');
};

const login = async (): Promise<void> => {
  await runCliToCompletion(FLYCTL_CLI, FlyioCommand.authLogin);
  await waitForAuthToken();
};

const isAuthError = (error: unknown): boolean => {
  const { stderr = '' } = (error ?? {}) as { stderr?: string };
  return FLYIO_AUTH_ERROR_STRINGS.some(s => stderr.includes(s));
};

export const FlyioService = {
  listApps,
  login,
  isAuthError,
};
