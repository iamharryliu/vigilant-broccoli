import { runCliInPty, runCliJson, tryRunCli } from '../cli/cli.utils';
import {
  FLYCTL_CLI,
  FLYIO_AUTH_ERROR_STRINGS,
  FLYIO_LOGIN_FAILURE,
  FlyioCommand,
  FlyioLoginFailure,
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
const LOGIN_TIMEOUT_MS = 3 * 60 * 1000;
const AUTH_URL_PATTERN = /https:\/\/fly\.io\/app\/auth\/cli\/\S+/;

export interface FlyioLoginResult {
  success: boolean;
  failure: FlyioLoginFailure | null;
  authUrl: string | null;
}

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
const waitForAuthToken = async (): Promise<boolean> => {
  for (let attempt = 0; attempt < WAIT_FOR_AUTH_ATTEMPTS; attempt++) {
    if (await tryRunCli(FLYCTL_CLI, FlyioCommand.authToken)) return true;
    await sleep(WAIT_FOR_AUTH_INTERVAL_MS);
  }
  return false;
};

const login = async (): Promise<FlyioLoginResult> => {
  const { output, failed, timedOut } = await runCliInPty(
    FLYCTL_CLI,
    FlyioCommand.authLogin,
    { timeoutMs: LOGIN_TIMEOUT_MS },
  );
  const authUrl = output.match(AUTH_URL_PATTERN)?.[0] ?? null;

  if (failed) {
    return {
      success: false,
      failure: timedOut
        ? FLYIO_LOGIN_FAILURE.timedOut
        : FLYIO_LOGIN_FAILURE.failed,
      authUrl,
    };
  }
  if (!(await waitForAuthToken())) {
    return {
      success: false,
      failure: FLYIO_LOGIN_FAILURE.tokenMissing,
      authUrl,
    };
  }
  return { success: true, failure: null, authUrl };
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
