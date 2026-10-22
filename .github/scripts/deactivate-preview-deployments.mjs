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

let deactivated = 0;
for (const deployment of stale) {
  const [latestStatus] = await githubApi(
    `/repos/${repository}/deployments/${deployment.id}/statuses?per_page=1`,
  );
  if (latestStatus?.state === INACTIVE) continue;
  await githubApi(
    `/repos/${repository}/deployments/${deployment.id}/statuses`,
    { method: 'POST', body: { state: INACTIVE } },
  );
  deactivated++;
}

console.log(
  `Marked ${deactivated} preview deployment(s) of closed PRs inactive (${stale.length} checked).`,
);
