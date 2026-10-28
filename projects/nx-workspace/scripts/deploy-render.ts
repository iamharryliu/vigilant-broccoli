import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import {
  AUTHORIZATION_HEADER,
  BEARER_PREFIX,
  CONTENT_TYPE_HEADER,
  HTTP_METHOD,
  JSON_CONTENT_TYPE,
} from '@vigilant-broccoli/common-js';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';
import { renderServices, STAGING } from './render-services.config';
import { secretsMapping } from './secrets-mapping.config';
import { createVaultClient, VAULT_SECRET_PATH } from './vault-client';

const RENDER_API = 'https://api.render.com/v1';
const DOCKER_HUB_NAMESPACE = 'iamharryliu';
const DRY_RUN_FLAG = '--dry-run';
const SECRETS_COMMAND = 'secrets';
const DEPLOY_COMMAND = 'deploy';
const REGISTRY_CREDENTIAL_NAME = 'vb-render-dockerhub';
const DOCKER_REGISTRY = 'DOCKER';
const WEB_SERVICE = 'web_service';
const IMAGE_RUNTIME = 'image';
const PAGE_SIZE = 100;

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

interface RenderService {
  id: string;
  name: string;
  ownerId: string;
  type: string;
}

interface RegistryCredential {
  id: string;
  name: string;
  registry: string;
  username: string;
}

interface ServiceResolution {
  service: RenderService;
  deployId?: string;
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
  const fromEnv = getEnvironmentVariable('RENDER_API_KEY');
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
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) {
    throw new Error(`Render ${method} ${path} failed: ${res.status}`);
  }
  return (await res.json().catch(() => ({}))) as T;
};

const listPages = async <T extends { cursor: string }>(
  apiKey: string,
  path: string,
): Promise<T[]> => {
  const entries: T[] = [];
  let cursor = '';
  do {
    const query = new URLSearchParams({ limit: String(PAGE_SIZE) });
    if (cursor) query.set('cursor', cursor);
    const page = await renderRequest<T[]>(
      apiKey,
      HTTP_METHOD.GET,
      `${path}${path.includes('?') ? '&' : '?'}${query}`,
    );
    entries.push(...page);
    const nextCursor = page.at(-1)?.cursor ?? '';
    if (nextCursor === cursor) break;
    cursor = page.length === PAGE_SIZE ? nextCursor : '';
  } while (cursor);
  return entries;
};

const resolveOwnerId = async (apiKey: string): Promise<string> => {
  const configured = getEnvironmentVariable('RENDER_OWNER_ID');
  if (configured) return configured;
  const owners = await listPages<{ owner: { id: string }; cursor: string }>(
    apiKey,
    '/owners',
  );
  if (owners.length !== 1) {
    throw new Error(
      'Set RENDER_OWNER_ID when the Render API key does not identify exactly one workspace.',
    );
  }
  return owners[0].owner.id;
};

const readAppEnvVars = async (project: string) => {
  const config = secretsMapping[project];
  if (!config) throw new Error(`No configuration found for app "${project}"`);
  const keys = parseEnvExample(join(config.appPath, '.env.example')).filter(
    key => !config.excludeEnvVars?.includes(key),
  );
  const vaultSecrets = await readVaultSecrets(config.vaultPath);
  if (!vaultSecrets.SHARED_APP_TOKEN) {
    throw new Error(
      'SHARED_APP_TOKEN must be configured before provisioning the public Render service.',
    );
  }
  keys
    .filter(key => !vaultSecrets[key])
    .forEach(key =>
      console.warn(`Warning: Secret "${key}" not found in Vault`),
    );
  return keys
    .filter(key => vaultSecrets[key])
    .map(key => ({
      key,
      value: vaultSecrets[key],
    }));
};

const ensureRegistryCredential = async (
  apiKey: string,
  ownerId: string,
  dryRun: boolean,
): Promise<string> => {
  // This endpoint returns bare credentials rather than the cursor wrappers
  // used by services and owners, despite accepting cursor/limit parameters.
  const query = new URLSearchParams({
    ownerId,
    name: REGISTRY_CREDENTIAL_NAME,
    limit: String(PAGE_SIZE),
  });
  const credentials = await renderRequest<RegistryCredential[]>(
    apiKey,
    HTTP_METHOD.GET,
    `/registrycredentials?${query}`,
  );
  const existing = credentials.find(
    credential => credential.name === REGISTRY_CREDENTIAL_NAME,
  );
  if (existing) {
    if (
      existing.registry !== DOCKER_REGISTRY ||
      existing.username !== DOCKER_HUB_NAMESPACE
    ) {
      throw new Error(
        `Registry credential ${REGISTRY_CREDENTIAL_NAME} does not match the expected Docker Hub account.`,
      );
    }
    return existing.id;
  }
  if (dryRun) {
    console.log(
      `[DRY RUN] Would create registry credential ${REGISTRY_CREDENTIAL_NAME}`,
    );
    return 'dry-run-registry-credential';
  }
  const token =
    getEnvironmentVariable('DOCKERHUB_TOKEN') ||
    (await readVaultSecrets(VAULT_SECRET_PATH)).DOCKERHUB_TOKEN;
  if (!token)
    throw new Error('DOCKERHUB_TOKEN not found in Vault or environment.');
  const credential = await renderRequest<RegistryCredential>(
    apiKey,
    HTTP_METHOD.POST,
    '/registrycredentials',
    {
      name: REGISTRY_CREDENTIAL_NAME,
      registry: DOCKER_REGISTRY,
      username: DOCKER_HUB_NAMESPACE,
      authToken: token,
      ownerId,
    },
  );
  console.log(`Created registry credential ${REGISTRY_CREDENTIAL_NAME}`);
  return credential.id;
};

const getImageUrl = (project: string) =>
  `docker.io/${DOCKER_HUB_NAMESPACE}/${project}:${getEnvironmentVariable('COMMIT_SHA') || 'latest'}`;

const ensureService = async (
  apiKey: string,
  ownerId: string,
  config: (typeof renderServices)[string][string],
  project: string,
  envVars: Array<{ key: string; value: string }>,
  dryRun: boolean,
): Promise<ServiceResolution> => {
  const query = new URLSearchParams({ ownerId, name: config.name });
  const matches = await listPages<{ service: RenderService; cursor: string }>(
    apiKey,
    `/services?${query}`,
  );
  const existing = matches.find(
    ({ service }) =>
      service.name === config.name && service.ownerId === ownerId,
  )?.service;
  if (existing) {
    if (existing.type !== WEB_SERVICE)
      throw new Error(`Render service ${config.name} is not a web service.`);
    return { service: existing };
  }
  const registryCredentialId = await ensureRegistryCredential(
    apiKey,
    ownerId,
    dryRun,
  );
  if (dryRun) {
    console.log(
      `[DRY RUN] Would create ${config.name} in ${ownerId} (${config.plan}, ${config.region}) with ${getImageUrl(project)} and ${envVars.length} environment variables`,
    );
    return {
      service: {
        id: 'dry-run-service',
        name: config.name,
        ownerId,
        type: WEB_SERVICE,
      },
    };
  }
  const created = await renderRequest<ServiceResolution>(
    apiKey,
    HTTP_METHOD.POST,
    '/services',
    {
      type: WEB_SERVICE,
      name: config.name,
      ownerId,
      autoDeployTrigger: 'off',
      image: { ownerId, imagePath: getImageUrl(project), registryCredentialId },
      envVars,
      serviceDetails: {
        runtime: IMAGE_RUNTIME,
        plan: config.plan,
        region: config.region,
        healthCheckPath: config.healthCheckPath,
        numInstances: 1,
      },
    },
  );
  console.log(`Created ${config.name}: ${created.service.id}`);
  return created;
};

const pushEnvVars = async (
  apiKey: string,
  serviceId: string,
  envVars: Array<{ key: string; value: string }>,
): Promise<void> => {
  // PUT replaces the whole set, so removed .env.example keys disappear too.
  await renderRequest(
    apiKey,
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
  apiKey: string,
  project: string,
  serviceId: string,
): Promise<void> => {
  const deploy = await renderRequest<RenderDeploy>(
    apiKey,
    HTTP_METHOD.POST,
    `/services/${serviceId}/deploys`,
    { imageUrl: getImageUrl(project) },
  );
  console.log(`Triggered deploy ${deploy.id} of ${getImageUrl(project)}`);
  await waitForDeploy(apiKey, serviceId, deploy.id);
};

const reportDryRun = (
  command: string,
  project: string,
  name: string,
  envCount: number,
) => {
  console.log(
    `[DRY RUN] Would sync ${envCount} environment variables to ${name}`,
  );
  if (command === DEPLOY_COMMAND)
    console.log(`[DRY RUN] Would deploy ${getImageUrl(project)} to ${name}`);
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

  const config = renderServices[project]?.[environment];
  if (!config) {
    throw new Error(
      `No Render service configured for ${project} (${environment}) in scripts/render-services.config.ts`,
    );
  }
  const apiKey = await getRenderApiKey();
  const ownerId = await resolveOwnerId(apiKey);
  const envVars = await readAppEnvVars(project);
  const { service, deployId } = await ensureService(
    apiKey,
    ownerId,
    config,
    project,
    envVars,
    dryRun,
  );
  if (dryRun) {
    reportDryRun(command, project, service.name, envVars.length);
    return;
  }
  if (!deployId) await pushEnvVars(apiKey, service.id, envVars);
  if (command === DEPLOY_COMMAND) {
    // Creation starts a deploy with the image and secrets above already set.
    if (deployId) await waitForDeploy(apiKey, service.id, deployId);
    else await triggerDeploy(apiKey, project, service.id);
    console.log('Deploy is live.');
  }
};

main().catch(error => {
  console.error(
    'Render deploy failed.',
    error instanceof Error ? error.message : 'Unknown error',
  );
  process.exit(1);
});
