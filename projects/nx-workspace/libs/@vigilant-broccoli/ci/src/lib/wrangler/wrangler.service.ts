import { ShellUtils } from '@vigilant-broccoli/common-node';

interface WranglerProject {
  name: string;
  domains: string[];
}

interface WranglerProjectJson {
  'Project Name': string;
  'Project Domains': string;
}

const LOG_PREFIX = '[wrangler]';
const MAX_STALE_BATCHES = 3;

const WranglerCommand = {
  login: 'wrangler login',
  listPagesProjects: 'wrangler pages project list --json',
  deletePagesProject: (projectName: string) =>
    `wrangler pages project delete ${projectName} --yes`,
  countDeployments: (projectName: string) =>
    `wrangler pages deployment list --project-name ${projectName} --json | jq length`,
  deleteAllDeploymentsBatch: (projectName: string) =>
    `wrangler pages deployment list --project-name ${projectName} --json` +
    ` | jq -r '.[].Id'` +
    ` | xargs -P 20 -I {} sh -c 'wrangler pages deployment delete {} --project-name ${projectName} --force 2>&1 || true'`,
};

const runCount = async (projectName: string): Promise<number> =>
  parseInt(
    ((await ShellUtils.runShellCommand(
      WranglerCommand.countDeployments(projectName),
      true,
    )) as string) || '0',
    10,
  );

async function listPagesProjects(): Promise<WranglerProject[]> {
  const output = await ShellUtils.runShellCommand(
    WranglerCommand.listPagesProjects,
    true,
  );
  const parsed: WranglerProjectJson[] = JSON.parse((output as string) || '[]');
  return parsed.map(p => ({
    name: p['Project Name'],
    domains: p['Project Domains'].split(',').map(d => d.trim()),
  }));
}

async function deleteAllDeployments(projectName: string): Promise<void> {
  let remaining = await runCount(projectName);
  console.log(`${LOG_PREFIX} ${projectName}: ${remaining} deployments found`);

  let batch = 1;
  let staleBatches = 0;
  while (remaining > 1) {
    console.log(
      `${LOG_PREFIX} ${projectName}: deleting batch ${batch} (${remaining} remaining)`,
    );
    await ShellUtils.runShellCommand(
      WranglerCommand.deleteAllDeploymentsBatch(projectName),
    );
    const prev = remaining;
    remaining = await runCount(projectName);
    staleBatches = remaining >= prev ? staleBatches + 1 : 0;
    if (staleBatches >= MAX_STALE_BATCHES) {
      console.log(
        `${LOG_PREFIX} ${projectName}: count stuck at ${remaining}, proceeding with project delete`,
      );
      break;
    }
    batch++;
  }
  console.log(`${LOG_PREFIX} ${projectName}: deployments cleared`);
}

async function deletePagesProject(projectName: string): Promise<void> {
  console.log(`${LOG_PREFIX} deleting project ${projectName}`);
  await deleteAllDeployments(projectName);
  await ShellUtils.runShellCommand(
    WranglerCommand.deletePagesProject(projectName),
  );
  console.log(`${LOG_PREFIX} project ${projectName} deleted`);
}

async function login(): Promise<void> {
  await ShellUtils.runShellCommand(WranglerCommand.login);
}

export const WranglerService = {
  listPagesProjects,
  deleteAllDeployments,
  deletePagesProject,
  login,
};
