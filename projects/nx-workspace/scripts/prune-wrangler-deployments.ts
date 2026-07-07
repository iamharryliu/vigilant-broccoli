import { execSync } from 'child_process';

const DEFAULT_KEEP = 10;
const MAX_PARALLEL_DELETES = 20;

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
    `xargs -P ${MAX_PARALLEL_DELETES} -I {} sh -c 'npx wrangler pages deployment delete {} --project-name ${projectName} --force 2>&1 || true'`,
    { input: ids.join('\n'), stdio: ['pipe', 'inherit', 'inherit'] },
  );
}

function pruneDeployments(projectName: string, keep: number): void {
  const ids = listDeploymentIds(projectName);
  const idsToDelete = ids.slice(keep);

  console.log(
    `${projectName}: ${ids.length} deployment(s) listed (list is capped to a single page), keeping ${Math.min(keep, ids.length)}, deleting ${idsToDelete.length} this run`,
  );

  deleteDeployments(projectName, idsToDelete);

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
