import {
  appFromProject,
  githubApi,
  parseDeployedSites,
  previewEnvironment,
} from './preview-deployments.mjs';

const env = name => process.env[name] ?? '';

const prNumber = Number(env('PR_NUMBER'));
const commit = env('PREVIEW_COMMIT');
const repository = env('GITHUB_REPOSITORY');
const runUrl = `${env('GITHUB_SERVER_URL') || 'https://github.com'}/${repository}/actions/runs/${env('GITHUB_RUN_ID')}`;

// Only projects wrangler reported both URLs for count as deployed.
const deployed = [...parseDeployedSites(env('PREVIEW_BRANCH'))].filter(
  ([project, { latest, build }]) => {
    if (latest && build) return true;
    console.warn(
      `Skipping ${project}: deploy.log lacks its alias or build URL`,
    );
    return false;
  },
);

if (!deployed.length) {
  console.log('No deployed previews to record.');
  process.exit(0);
}

for (const [project, { latest, build }] of deployed) {
  const app = appFromProject(project);
  const environment = previewEnvironment(prNumber, app);
  // GitHub documents no numeric payload limit; this stays a few hundred bytes.
  const payload = {
    prNumber,
    app,
    project,
    aliasUrl: latest,
    buildUrl: build,
    commit,
  };
  const deployment = await githubApi(`/repos/${repository}/deployments`, {
    method: 'POST',
    body: {
      ref: commit,
      environment,
      description: `PR #${prNumber} preview of ${app}`,
      // Without this GitHub refuses with 409 while the PR's checks are pending.
      required_contexts: [],
      auto_merge: false,
      transient_environment: true,
      production_environment: false,
      payload,
    },
  });
  await githubApi(
    `/repos/${repository}/deployments/${deployment.id}/statuses`,
    {
      method: 'POST',
      body: {
        state: 'success',
        environment_url: latest,
        log_url: runUrl,
        auto_inactive: true,
      },
    },
  );
  console.log(
    `Recorded ${environment} → ${latest} (deployment ${deployment.id})`,
  );
}
