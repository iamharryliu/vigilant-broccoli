import { runCliInPty, runCliJson, tryRunCli } from '../cli/cli.utils';
import {
  RENDER_AUTH_ERROR_STRINGS,
  RENDER_CLI,
  RENDER_LOGIN_FAILURE,
  RenderCommand,
  RenderLoginFailure,
} from './render.consts';

export interface RenderService {
  id: string;
  name: string;
  type: string;
  suspended: string;
  dashboardUrl: string;
  url: string | null;
}

interface RenderServiceJson {
  id: string;
  name: string;
  type: string;
  suspended?: string | null;
  dashboardUrl: string;
  serviceDetails?: { url?: string | null };
}

const WAIT_FOR_AUTH_ATTEMPTS = 10;
const WAIT_FOR_AUTH_INTERVAL_MS = 500;
const LOGIN_TIMEOUT_MS = 3 * 60 * 1000;
const AUTH_URL_PATTERN = /https:\/\/dashboard\.render\.com\/cli\/login\S*/;
const NOT_SUSPENDED = 'not_suspended';

export interface RenderLoginResult {
  success: boolean;
  failure: RenderLoginFailure | null;
  authUrl: string | null;
}

const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

const listServices = async (): Promise<RenderService[]> => {
  const services = await runCliJson<RenderServiceJson[]>(
    RENDER_CLI,
    RenderCommand.listServices,
  );
  return services
    .map(service => ({
      id: service.id,
      name: service.name,
      type: service.type,
      suspended: service.suspended ?? NOT_SUSPENDED,
      dashboardUrl: service.dashboardUrl,
      url: service.serviceDetails?.url ?? null,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

const waitForAuthToken = async (): Promise<boolean> => {
  for (let attempt = 0; attempt < WAIT_FOR_AUTH_ATTEMPTS; attempt++) {
    if (await tryRunCli(RENDER_CLI, RenderCommand.whoami)) return true;
    await sleep(WAIT_FOR_AUTH_INTERVAL_MS);
  }
  return false;
};

const login = async (): Promise<RenderLoginResult> => {
  const { output, failed, timedOut } = await runCliInPty(
    RENDER_CLI,
    RenderCommand.login,
    { timeoutMs: LOGIN_TIMEOUT_MS },
  );
  const authUrl = output.match(AUTH_URL_PATTERN)?.[0] ?? null;

  if (failed) {
    return {
      success: false,
      failure: timedOut
        ? RENDER_LOGIN_FAILURE.timedOut
        : RENDER_LOGIN_FAILURE.failed,
      authUrl,
    };
  }
  if (!(await waitForAuthToken())) {
    return {
      success: false,
      failure: RENDER_LOGIN_FAILURE.tokenMissing,
      authUrl,
    };
  }
  return { success: true, failure: null, authUrl };
};

const isAuthError = (error: unknown): boolean => {
  const { stderr = '' } = (error ?? {}) as { stderr?: string };
  return RENDER_AUTH_ERROR_STRINGS.some(value =>
    stderr.toLowerCase().includes(value),
  );
};

export const RenderCliService = { listServices, login, isAuthError };
