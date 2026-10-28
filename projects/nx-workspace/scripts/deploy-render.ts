// Render counterpart of deploy-flyio-secrets.ts and `flyctl deploy --image`.
// Usage:
//   npx tsx scripts/deploy-render.ts secrets <project> [environment] [--dry-run]
//   npx tsx scripts/deploy-render.ts deploy <project> [environment] [--dry-run]
// RENDER_API_KEY comes from the environment, else Vault kv/data/secrets.
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import {
  AUTHORIZATION_HEADER,
  BEARER_PREFIX,
  CONTENT_TYPE_HEADER,
  HTTP_METHOD,
  JSON_CONTENT_TYPE,
} from '../libs/@vigilant-broccoli/common-js/src/lib/http/http.consts';
import { getEnvironmentVariable } from '../libs/@vigilant-broccoli/common-node/src/lib/utils';
import { renderServices, STAGING } from './render-services.config';
import { secretsMapping } from './secrets-mapping.config';
import { createVaultClient, VAULT_SECRET_PATH } from './vault-client';

const RENDER_API = 'https://api.render.com/v1';
const DOCKER_HUB_NAMESPACE = 'iamharryliu';
const DRY_RUN_FLAG = '--dry-run';
const SECRETS_COMMAND = 'secrets';
const DEPLOY_COMMAND = 'deploy';
const PLACEHOLDER_SERVICE_ID = /REPLACE/;

const LIVE_STATUS = 'live';
const FAILED_STATUSES = [
  'build_failed',
  'update_failed',
  'pre_deploy_failed',
  'canceled',
  'deactivated',
];
const POLL_INTERVAL_MS = 5000;
const POLL_TIMEOUT_MS = 15 * 60 * 1000;

interface VaultSecrets {
  [key: string]: string;
}

interface RenderDeploy {
  id: string;
  status: string;
}

const sleep = (ms: number) => new Promise(done => setTimeout(done, ms));

const parseEnvExample = (filePath: string): string[] => {
  if (!existsSync(filePath)) {
    throw new Error(`.env.example not found at ${filePath}`);
  }
  return readFileSync(filePath, 'utf-8')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))
    .map(line => line.split('=')[0].trim())
    .filter(Boolean);
};

const readVaultSecrets = async (vaultPath: string): Promise<VaultSecrets> => {
  const vault = await createVaultClient();
  const result = await vault.read(vaultPath);
  return (result.data.data || result.data || result) as VaultSecrets;
};

const getRenderApiKey = async (): Promise<string> => {
  const fromEnv = process.env.RENDER_API_KEY;
  if (fromEnv) return fromEnv;
  const key = (await readVaultSecrets(VAULT_SECRET_PATH)).RENDER_API_KEY;
  if (!key) {
    throw new Error('RENDER_API_KEY not found in Vault or environment.');
  }
  return key;
};

const renderRequest = async <T>(
  apiKey: string,
  method: string,
  path: string,
  body?: unknown,
): Promise<T> => {
  const res = await fetch(`${RENDER_API}${path}`, {
    method,
    headers: {
      [AUTHORIZATION_HEADER]: `${BEARER_PREFIX}${apiKey}`,
      [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(
      `Render ${method} ${path} failed: ${res.status} ${await res.text()}`,
    );
  }
  return (await res.json().catch(() => ({}))) as T;
};

const resolveServiceId = (project: string, environment: string): string => {
  const serviceId = renderServices[project]?.[environment];
  if (!serviceId) {
    throw new Error(
      `No Render service configured for ${project} (${environment}) in scripts/render-services.config.ts`,
    );
  }
  if (PLACEHOLDER_SERVICE_ID.test(serviceId)) {
    throw new Error(
      `Set the real srv-... id for ${project} (${environment}) in scripts/render-services.config.ts`,
    );
  }
  return serviceId;
};

const pushEnvVars = async (
  project: string,
  serviceId: string,
  dryRun: boolean,
): Promise<void> => {
  const config = secretsMapping[project];
  if (!config) throw new Error(`No configuration found for app "${project}"`);

  const keys = parseEnvExample(join(config.appPath, '.env.example')).filter(
    key => !config.excludeEnvVars?.includes(key),
  );
  const vaultSecrets = await readVaultSecrets(config.vaultPath);
  const envVars = keys
    .filter(key => vaultSecrets[key])
    .map(key => ({
      key,
      value: vaultSecrets[key],
    }));
  keys
    .filter(key => !vaultSecrets[key])
    .forEach(key =>
      console.warn(`Warning: Secret "${key}" not found in Vault`),
    );

  if (dryRun) {
    console.log(
      `[DRY RUN] Would PUT env vars to ${serviceId}: ${envVars.map(v => `${v.key}=***`).join(' ')}`,
    );
    return;
  }

  // PUT replaces the service's whole env var set, like the Fly flow's
  // unset-then-set, so keys removed from .env.example disappear too.
  await renderRequest(
    await getRenderApiKey(),
    HTTP_METHOD.PUT,
    `/services/${serviceId}/env-vars`,
    envVars,
  );
  console.log(`Pushed ${envVars.length} env vars to ${serviceId}`);
};

const waitForDeploy = async (
  apiKey: string,
  serviceId: string,
  deployId: string,
): Promise<void> => {
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const { status } = await renderRequest<RenderDeploy>(
      apiKey,
      HTTP_METHOD.GET,
      `/services/${serviceId}/deploys/${deployId}`,
    );
    console.log(`Deploy ${deployId}: ${status}`);
    if (status === LIVE_STATUS) return;
    if (FAILED_STATUSES.includes(status)) {
      throw new Error(`Render deploy ${deployId} ended as ${status}`);
    }
    await sleep(POLL_INTERVAL_MS);
  }
  throw new Error(`Timed out waiting for Render deploy ${deployId}`);
};

const triggerDeploy = async (
  project: string,
  serviceId: string,
  dryRun: boolean,
): Promise<void> => {
  const imageUrl = `${DOCKER_HUB_NAMESPACE}/${project}:${getEnvironmentVariable('COMMIT_SHA') || 'latest'}`;
  if (dryRun) {
    console.log(`[DRY RUN] Would deploy ${imageUrl} to ${serviceId}`);
    return;
  }

  const apiKey = await getRenderApiKey();
  const deploy = await renderRequest<RenderDeploy>(
    apiKey,
    HTTP_METHOD.POST,
    `/services/${serviceId}/deploys`,
    { imageUrl },
  );
  console.log(`Triggered deploy ${deploy.id} of ${imageUrl}`);
  await waitForDeploy(apiKey, serviceId, deploy.id);
  console.log('Deploy is live.');
};

const main = async () => {
  const args = process.argv.slice(2);
  const [command, project, environment = STAGING] = args.filter(
    arg => !arg.startsWith('--'),
  );
  const dryRun = args.includes(DRY_RUN_FLAG);

  if (![SECRETS_COMMAND, DEPLOY_COMMAND].includes(command) || !project) {
    console.error(
      'Usage: npx tsx scripts/deploy-render.ts <secrets|deploy> <project> [environment] [--dry-run]',
    );
    process.exit(1);
  }

  const serviceId = resolveServiceId(project, environment);
  if (command === SECRETS_COMMAND) {
    await pushEnvVars(project, serviceId, dryRun);
  } else {
    await triggerDeploy(project, serviceId, dryRun);
  }
};

main().catch(error => {
  console.error('Render deploy failed.', error);
  process.exit(1);
});
