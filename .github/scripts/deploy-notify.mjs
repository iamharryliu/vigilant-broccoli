const URL = process.env.SOCKET_SERVER_URL;
const TOKEN = process.env.SHARED_APP_TOKEN;

const DEPLOY_APP = 'local-manager-next';
const DEPLOY_RECEIVER_ID = 'deploy';
const PUBLISH_PATH = '/publish';
const TIMEOUT_MS = 10000;

const startedAtRaw = process.env.DEPLOY_STARTED_AT;
const startedAtMs = startedAtRaw ? new Date(startedAtRaw).getTime() : undefined;
const durationS =
  startedAtMs && !isNaN(startedAtMs)
    ? Math.round((Date.now() - startedAtMs) / 1000)
    : undefined;

const payload = {
  status: process.env.DEPLOY_STATUS,
  job: process.env.DEPLOY_JOB,
  commit: process.env.DEPLOY_COMMIT,
  commit_message: process.env.DEPLOY_COMMIT_MESSAGE,
  workflow: process.env.DEPLOY_WORKFLOW,
  run_url: process.env.DEPLOY_RUN_URL,
  duration_s: durationS,
  affected_projects: process.env.DEPLOY_AFFECTED_PROJECTS || undefined,
};

try {
  const res = await fetch(`${URL}${PUBLISH_PATH}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({
      app: DEPLOY_APP,
      receiverId: DEPLOY_RECEIVER_ID,
      payload,
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const ack = await res.json().catch(() => null);
  if (!res.ok || !ack?.ok) {
    throw new Error(`publish rejected (${res.status} ${ack?.code ?? ''})`);
  }
  console.log(
    `deploy-notify: ${payload.status} sent to ${ack.receivers} receiver(s)`,
  );
} catch (err) {
  console.error('deploy-notify failed:', err.message);
  process.exit(1);
}
