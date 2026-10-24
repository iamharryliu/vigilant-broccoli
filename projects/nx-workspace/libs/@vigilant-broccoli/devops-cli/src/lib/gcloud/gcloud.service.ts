import { request } from 'https';
import {
  copyToClipboard,
  probeCli,
  runCli,
  toLines,
  tryRunCli,
} from '../cli/cli.utils';
import {
  GCLOUD_ACCOUNT_STATUS,
  GCLOUD_ACTIVE_STATUS_MARKER,
  GCLOUD_CLI,
  GcloudCommand,
  NO_ACTIVE_ACCOUNT_ERROR,
  REAUTH_ERROR_STRINGS,
  REAUTH_HINT,
  REAUTH_PROBE_TIMEOUT_MS,
  VAULT_APPROLE_LOGIN_URL,
  VAULT_OPS_ROLE_ID_SECRET,
  VAULT_OPS_SECRET_ID_SECRET,
  VAULT_TOKEN_GCP_PROJECT,
} from './gcloud.consts';

export type GcloudAccountStatus =
  (typeof GCLOUD_ACCOUNT_STATUS)[keyof typeof GCLOUD_ACCOUNT_STATUS];

export interface GcloudAccount {
  account: string;
  status: GcloudAccountStatus;
}

export interface GcloudAuthStatus {
  activeAccount: string | null;
  accounts: GcloudAccount[];
  currentProject: string | null;
}

export interface GcloudProject {
  projectId: string;
  name: string;
  projectNumber: string;
}

export interface GcloudReauthStatus {
  needsReauth: boolean;
  activeAccount: string | null;
  error?: string;
}

const FIELD_SEPARATOR = '\t';

const parseAccount = (line: string): GcloudAccount => {
  const [account = '', status = ''] = line.split(FIELD_SEPARATOR);
  return {
    account: account.trim(),
    status:
      status.trim() === GCLOUD_ACTIVE_STATUS_MARKER
        ? GCLOUD_ACCOUNT_STATUS.ACTIVE
        : GCLOUD_ACCOUNT_STATUS.INACTIVE,
  };
};

const getAuthStatus = async (): Promise<GcloudAuthStatus> => {
  const [authOutput, projectOutput] = await Promise.all([
    runCli(GCLOUD_CLI, GcloudCommand.listAuth).then(({ stdout }) => stdout),
    tryRunCli(GCLOUD_CLI, GcloudCommand.getProject),
  ]);

  const accounts = toLines(authOutput).map(parseAccount);

  return {
    accounts,
    activeAccount:
      accounts.find(a => a.status === GCLOUD_ACCOUNT_STATUS.ACTIVE)?.account ??
      null,
    currentProject: projectOutput?.trim() || null,
  };
};

const listProjects = async (): Promise<GcloudProject[]> => {
  const { stdout } = await runCli(GCLOUD_CLI, GcloudCommand.listProjects);
  return toLines(stdout).map(line => {
    const [projectId = '', name = '', projectNumber = ''] =
      line.split(FIELD_SEPARATOR);
    return {
      projectId: projectId.trim(),
      name: name.trim(),
      projectNumber: projectNumber.trim(),
    };
  });
};

const getReauthStatus = async (): Promise<GcloudReauthStatus> => {
  const activeAccount =
    (await tryRunCli(GCLOUD_CLI, GcloudCommand.getAccount))?.trim() || null;

  if (!activeAccount) {
    return {
      needsReauth: true,
      activeAccount: null,
      error: NO_ACTIVE_ACCOUNT_ERROR,
    };
  }

  const { output, failed } = await probeCli(
    GCLOUD_CLI,
    GcloudCommand.probeProjects,
    { timeoutMs: REAUTH_PROBE_TIMEOUT_MS },
  );
  const needsReauth =
    failed || REAUTH_ERROR_STRINGS.some(s => output.includes(s));

  return {
    needsReauth,
    activeAccount,
    error: needsReauth ? REAUTH_HINT : undefined,
  };
};

const setAccount = async (account: string): Promise<void> => {
  await runCli(GCLOUD_CLI, GcloudCommand.setAccount(account));
};

const setProject = async (projectId: string): Promise<void> => {
  await runCli(GCLOUD_CLI, GcloudCommand.setProject(projectId));
};

const accessVaultSecret = async (name: string): Promise<string> => {
  const { stdout } = await runCli(
    GCLOUD_CLI,
    GcloudCommand.accessSecret(name, VAULT_TOKEN_GCP_PROJECT),
  );
  return stdout.trim();
};

// The body goes over stdin of the request, never argv. Vault's cert is
// self-signed and the host is a WireGuard-only address.
const loginWithVaultOpsAppRole = (body: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const req = request(
      VAULT_APPROLE_LOGIN_URL,
      { method: 'POST', rejectUnauthorized: false },
      res => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => {
          const token = JSON.parse(data)?.auth?.client_token;
          if (token) resolve(token);
          else reject(new Error('Vault AppRole login returned no token'));
        });
      },
    );
    req.on('error', reject);
    req.end(body);
  });

const copyVaultTokenToClipboard = async (): Promise<void> => {
  const [role_id, secret_id] = await Promise.all([
    accessVaultSecret(VAULT_OPS_ROLE_ID_SECRET),
    accessVaultSecret(VAULT_OPS_SECRET_ID_SECRET),
  ]);
  await copyToClipboard(
    await loginWithVaultOpsAppRole(JSON.stringify({ role_id, secret_id })),
  );
};

export const GcloudService = {
  getAuthStatus,
  listProjects,
  getReauthStatus,
  setAccount,
  setProject,
  copyVaultTokenToClipboard,
};
