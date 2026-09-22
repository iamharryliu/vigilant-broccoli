import { ShellUtils } from '@vigilant-broccoli/common-node';
import { runCli, runCliJson, startDetachedCli } from '../cli/cli.utils';

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

const WRANGLER_CLI = 'wrangler';
const LOG_PREFIX = '[wrangler]';
const MAX_STALE_BATCHES = 3;
const DEFAULT_KEEP_DEPLOYMENTS = 10;
const DELETE_CONCURRENCY = 4;
const BATCH_DELAY_MS = 2000;

const WranglerCommand = {
  login: ['login'],
  listPagesProjects: ['pages', 'project', 'list', '--json'],
  listDeployments: (projectName: string) => [
    'pages',
    'deployment',
    'list',
    '--project-name',
    projectName,
    '--json',
  ],
  deletePagesProject: (projectName: string) => [
    'pages',
    'project',
    'delete',
    projectName,
    '--yes',
  ],
  deleteDeploymentsBatch: (projectName: string, ids: string[]) =>
    `printf '%s\\n' ${ids.join(' ')}` +
    ` | xargs -P ${DELETE_CONCURRENCY} -I {} sh -c '${WRANGLER_CLI} pages deployment delete {} --project-name ${projectName} --force 2>&1 || true'`,
};

const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

async function listPagesProjects(): Promise<WranglerProject[]> {
  const parsed = await runCliJson<WranglerProjectJson[] | null>(
    WRANGLER_CLI,
    WranglerCommand.listPagesProjects,
  );
  return (parsed ?? []).map(p => ({
    name: p['Project Name'],
    domains: p['Project Domains'].split(',').map(d => d.trim()),
  }));
}

async function listDeploymentIds(projectName: string): Promise<string[]> {
  const parsed = await runCliJson<WranglerDeploymentJson[] | null>(
    WRANGLER_CLI,
    WranglerCommand.listDeployments(projectName),
  );
  return (parsed ?? []).map(deployment => deployment.Id);
}

async function pruneDeployments(
  projectName: string,
  keep = DEFAULT_KEEP_DEPLOYMENTS,
): Promise<void> {
  const ids = await listDeploymentIds(projectName);
  const idsToDelete = ids.slice(keep);

  console.log(
    `${LOG_PREFIX} ${projectName}: ${ids.length} deployment(s) listed (list is capped to a single page), keeping ${Math.min(keep, ids.length)}, deleting ${idsToDelete.length} this run`,
  );

  if (idsToDelete.length > 0) {
    await ShellUtils.runShellCommand(
      WranglerCommand.deleteDeploymentsBatch(projectName, idsToDelete),
    );
  }

  console.log(`${LOG_PREFIX} ${projectName}: prune complete`);
}

async function deleteAllDeployments(projectName: string): Promise<void> {
  let ids = await listDeploymentIds(projectName);
  console.log(
    `${LOG_PREFIX} ${projectName}: ${ids.length} deployment(s) found (list is capped to a single page)`,
  );

  let batch = 1;
  let staleBatches = 0;
  while (ids.length > 1) {
    console.log(
      `${LOG_PREFIX} ${projectName}: deleting batch ${batch} (${ids.length} listed)`,
    );
    await ShellUtils.runShellCommand(
      WranglerCommand.deleteDeploymentsBatch(projectName, ids),
    );
    const prevIds = new Set(ids);
    ids = await listDeploymentIds(projectName);
    const anyDeleted =
      ids.some(id => !prevIds.has(id)) || ids.length < prevIds.size;
    staleBatches = anyDeleted ? 0 : staleBatches + 1;
    if (staleBatches >= MAX_STALE_BATCHES) {
      throw new Error(
        `${projectName}: no deployments removed after ${MAX_STALE_BATCHES} batches, likely rate-limited by Cloudflare`,
      );
    }
    batch++;
    await sleep(BATCH_DELAY_MS);
  }
  console.log(`${LOG_PREFIX} ${projectName}: deployments cleared`);
}

async function deletePagesProject(projectName: string): Promise<void> {
  console.log(`${LOG_PREFIX} deleting project ${projectName}`);
  await deleteAllDeployments(projectName);
  await runCli(WRANGLER_CLI, WranglerCommand.deletePagesProject(projectName));
  console.log(`${LOG_PREFIX} project ${projectName} deleted`);
}

function login(): void {
  startDetachedCli(WRANGLER_CLI, WranglerCommand.login);
}

export const WranglerService = {
  listPagesProjects,
  pruneDeployments,
  deleteAllDeployments,
  deletePagesProject,
  login,
};
