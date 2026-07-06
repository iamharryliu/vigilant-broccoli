import { execSync } from 'child_process';

const DEFAULT_KEEP = 10;
const MAX_DELETE_BATCH_SIZE = 20;
const MAX_STALE_BATCHES = 3;

interface WranglerDeployment {
  Id: string;
}

function listDeploymentIds(projectName: string): string[] {
  const output = execSync(
    `npx wrangler pages deployment list --project-name ${projectName} --json`,
    { stdio: ['ignore', 'pipe', 'inherit'] },
  ).toString();
  const deployments: WranglerDeployment[] = JSON.parse(output || '[]');
  return deployments.map(deployment => deployment.Id);
}

function deleteDeployments(projectName: string, ids: string[]): void {
  if (ids.length === 0) return;
  execSync(
    `xargs -P ${MAX_DELETE_BATCH_SIZE} -I {} sh -c 'npx wrangler pages deployment delete {} --project-name ${projectName} --force 2>&1 || true'`,
    { input: ids.join('\n'), stdio: ['pipe', 'inherit', 'inherit'] },
  );
}

function pruneDeployments(projectName: string, keep: number): void {
  let ids = listDeploymentIds(projectName);
  console.log(
    `${projectName}: ${ids.length} deployment(s) found (list may be capped to a single page), keeping ${Math.min(keep, ids.length)}`,
  );

  let staleBatches = 0;
  while (ids.length > keep) {
    const batch = ids.slice(keep, keep + MAX_DELETE_BATCH_SIZE);
    console.log(
      `${projectName}: deleting batch of ${batch.length} (${ids.length} listed beyond keep)`,
    );
    deleteDeployments(projectName, batch);

    ids = listDeploymentIds(projectName);
    const batchIdSet = new Set(batch);
    const stillPresent = ids.filter(id => batchIdSet.has(id)).length;
    staleBatches = stillPresent === batch.length ? staleBatches + 1 : 0;
    if (staleBatches >= MAX_STALE_BATCHES) {
      console.log(
        `${projectName}: last batch made no progress (${stillPresent}/${batch.length} still present), stopping prune`,
      );
      break;
    }
  }

  console.log(`${projectName}: prune complete`);
}

function main() {
  const [projectName, keepArg] = process.argv.slice(2);
  const keep = keepArg ? parseInt(keepArg, 10) : DEFAULT_KEEP;

  if (!projectName) {
    console.error(
      'Usage: npx tsx scripts/prune-wrangler-deployments.ts <project-name> [keep]',
    );
    process.exit(1);
  }

  pruneDeployments(projectName, keep);
}

main();
