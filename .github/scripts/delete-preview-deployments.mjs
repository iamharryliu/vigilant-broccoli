import {
  PREVIEW_ENVIRONMENT_PATTERN,
  githubApi,
  githubApiPaginated,
} from './preview-deployments.mjs';

const repository = process.env.GITHUB_REPOSITORY;
const INACTIVE = 'inactive';

const openPullNumbers = new Set(
  (await githubApiPaginated(`/repos/${repository}/pulls?state=open`)).map(
    pull => pull.number,
  ),
);

const stale = (
  await githubApiPaginated(`/repos/${repository}/deployments`)
).filter(({ environment }) => {
  const match = PREVIEW_ENVIRONMENT_PATTERN.exec(environment);
  return match && !openPullNumbers.has(Number(match[1]));
});

// Deleting keeps history bounded, so this run's cost and the readers' newest-100
// window don't fill up with closed PRs. GitHub only deletes inactive deployments,
// and an already-inactive status can be posted again.
for (const deployment of stale) {
  const deploymentPath = `/repos/${repository}/deployments/${deployment.id}`;
  await githubApi(`${deploymentPath}/statuses`, {
    method: 'POST',
    body: { state: INACTIVE },
  });
  await githubApi(deploymentPath, { method: 'DELETE' });
}

console.log(`Deleted ${stale.length} preview deployment(s) of closed PRs.`);
