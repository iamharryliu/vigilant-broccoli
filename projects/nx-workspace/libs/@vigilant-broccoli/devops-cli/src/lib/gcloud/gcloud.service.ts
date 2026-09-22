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
  VAULT_TOKEN_GCP_PROJECT,
  VAULT_TOKEN_SECRET,
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

const copyVaultTokenToClipboard = async (): Promise<void> => {
  const { stdout } = await runCli(
    GCLOUD_CLI,
    GcloudCommand.accessSecret(VAULT_TOKEN_SECRET, VAULT_TOKEN_GCP_PROJECT),
  );
  await copyToClipboard(stdout);
};

export const GcloudService = {
  getAuthStatus,
  listProjects,
  getReauthStatus,
  setAccount,
  setProject,
  copyVaultTokenToClipboard,
};
