import { execSync } from 'child_process';

const MAX_PARALLEL_DELETES = 20;
const PREVIEW_BRANCH_PREFIX = 'pr-';

interface WranglerDeployment {
  Id: string;
  Branch: string;
}

function listDeployments(projectName: string): WranglerDeployment[] {
  const output = execSync(
    `npx wrangler pages deployment list --project-name ${projectName} --json`,
    { stdio: ['ignore', 'pipe', 'inherit'] },
  ).toString();
  return JSON.parse(output || '[]');
}

// Previews are deployed under the Pages "branch" pr-<n>, so liveness is
// whether that PR is still open — not whether a branch exists. A merged PR's
// head branch often outlives it, and a preview stops being useful the moment
// the PR is closed.
function listLivePreviewBranches(): Set<string> {
  const output = execSync(
    'gh pr list --state open --limit 500 --json number --jq ".[].number"',
    { stdio: ['ignore', 'pipe', 'inherit'] },
  ).toString();
  return new Set(
    output
      .split('\n')
      .filter(Boolean)
      .map(number => `${PREVIEW_BRANCH_PREFIX}${number.trim()}`),
  );
}

// The list is newest-first, so the first deployment seen per open PR is the
// one serving its alias; everything else — superseded pushes to an open PR
// and every deployment of a closed one — is stale.
function staleDeploymentIds(
  deployments: WranglerDeployment[],
  liveBranches: Set<string>,
): string[] {
  const seenBranches = new Set<string>();
  return deployments
    .filter(({ Branch }) => {
      if (!liveBranches.has(Branch) || seenBranches.has(Branch)) return true;
      seenBranches.add(Branch);
      return false;
    })
    .map(({ Id }) => Id);
}

function deleteDeployments(projectName: string, ids: string[]): void {
  if (ids.length === 0) return;
  execSync(
    `xargs -P ${MAX_PARALLEL_DELETES} -I {} sh -c 'npx wrangler pages deployment delete {} --project-name ${projectName} --force 2>&1 || true'`,
    { input: ids.join('\n'), stdio: ['pipe', 'inherit', 'inherit'] },
  );
}

function main() {
  const [projectName] = process.argv.slice(2);

  if (!projectName) {
    console.error(
      'Usage: npx tsx scripts/prune-wrangler-preview-deployments.ts <project-name>',
    );
    process.exit(1);
  }

  const deployments = listDeployments(projectName);
  const idsToDelete = staleDeploymentIds(
    deployments,
    listLivePreviewBranches(),
  );

  console.log(
    `${projectName}: ${deployments.length} deployment(s) listed (list is capped to a single page), deleting ${idsToDelete.length} stale this run`,
  );

  deleteDeployments(projectName, idsToDelete);

  console.log(`${projectName}: preview prune complete`);
}

main();
