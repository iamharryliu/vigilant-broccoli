import { ShellUtils } from '@vigilant-broccoli/common-node';

interface WranglerProject {
  name: string;
  domains: string[];
}

interface WranglerProjectJson {
  'Project Name': string;
  'Project Domains': string;
}

interface WranglerDeploymentJson {
  Id: string;
}

const LOG_PREFIX = '[wrangler]';
const MAX_STALE_BATCHES = 3;
const MAX_DELETE_BATCH_SIZE = 20;
const DEFAULT_KEEP_DEPLOYMENTS = 10;

const WranglerCommand = {
  login: 'wrangler login',
  listPagesProjects: 'wrangler pages project list --json',
  listDeployments: (projectName: string) =>
    `wrangler pages deployment list --project-name ${projectName} --json`,
  deletePagesProject: (projectName: string) =>
    `wrangler pages project delete ${projectName} --yes`,
  countDeployments: (projectName: string) =>
    `wrangler pages deployment list --project-name ${projectName} --json | jq length`,
  deleteAllDeploymentsBatch: (projectName: string) =>
    `wrangler pages deployment list --project-name ${projectName} --json` +
    ` | jq -r '.[].Id'` +
    ` | xargs -P 20 -I {} sh -c 'wrangler pages deployment delete {} --project-name ${projectName} --force 2>&1 || true'`,
  deleteDeploymentsBatch: (projectName: string, ids: string[]) =>
    `printf '%s\\n' ${ids.join(' ')}` +
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

async function listDeploymentIds(projectName: string): Promise<string[]> {
  const output = await ShellUtils.runShellCommand(
    WranglerCommand.listDeployments(projectName),
    true,
  );
  const parsed: WranglerDeploymentJson[] = JSON.parse(
    (output as string) || '[]',
  );
  return parsed.map(deployment => deployment.Id);
}

async function pruneDeployments(
  projectName: string,
  keep = DEFAULT_KEEP_DEPLOYMENTS,
): Promise<void> {
  let ids = await listDeploymentIds(projectName);
  console.log(
    `${LOG_PREFIX} ${projectName}: ${ids.length} deployment(s) found (list may be capped to a single page), keeping ${Math.min(keep, ids.length)}`,
  );

  let staleBatches = 0;
  while (ids.length > keep) {
    const batch = ids.slice(keep, keep + MAX_DELETE_BATCH_SIZE);
    console.log(
      `${LOG_PREFIX} ${projectName}: deleting batch of ${batch.length} (${ids.length} listed beyond keep)`,
    );
    await ShellUtils.runShellCommand(
      WranglerCommand.deleteDeploymentsBatch(projectName, batch),
    );

    ids = await listDeploymentIds(projectName);
    const batchIdSet = new Set(batch);
    const stillPresent = ids.filter(id => batchIdSet.has(id)).length;
    staleBatches = stillPresent === batch.length ? staleBatches + 1 : 0;
    if (staleBatches >= MAX_STALE_BATCHES) {
      console.log(
        `${LOG_PREFIX} ${projectName}: last batch made no progress (${stillPresent}/${batch.length} still present), stopping prune`,
      );
      break;
    }
  }

  console.log(`${LOG_PREFIX} ${projectName}: prune complete`);
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
  pruneDeployments,
  deleteAllDeployments,
  deletePagesProject,
  login,
};
