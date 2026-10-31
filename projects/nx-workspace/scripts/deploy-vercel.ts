import { execSync, execFileSync } from 'child_process';
import { readFileSync, existsSync, mkdirSync, rmSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { createVaultClient, VAULT_SECRET_PATH } from './vault-client';
import SUPABASE_PUBLIC from '../libs/@vigilant-broccoli/infrastructure/src/lib/supabase-public.json' with { type: 'json' };

const STAGING = 'staging';
const PRODUCTION = 'production';
const DEMO = 'demo';
const ENVIRONMENTS = [STAGING, PRODUCTION, DEMO];
const VERCEL_ENV = PRODUCTION;

const VERCEL_ROOT_DIRECTORY = 'projects/nx-workspace';
const VERCEL_DIR = '.vercel';
const VERCEL_OUTPUT_DIR = `${VERCEL_DIR}/output`;
const BUILD_LOCK_DIR = `${VERCEL_ROOT_DIRECTORY}/dist/.vercel-deploy-lock`;

// Standalone output can't be packaged from an Nx cache restore — see
// docs/app-development/ui/deployment/vercel-deploy-pattern.md
const STANDALONE_OUTPUT_PROJECTS = new Set([
  'employee-handler-ui',
  'job-hunt-next',
]);

const BUILD_LOCK_TIMEOUT_MS = 20 * 60 * 1000;
const BUILD_LOCK_POLL_MS = 500;

// All apps share one .vercel directory, so build and upload are serialised as
// a unit (see vercel-deploy-pattern.md). mkdir is the atomic primitive: it
// fails if the directory exists.
async function withBuildLock<T>(lockDir: string, fn: () => T): Promise<T> {
  mkdirSync(dirname(lockDir), { recursive: true });
  const deadline = Date.now() + BUILD_LOCK_TIMEOUT_MS;
  for (;;) {
    try {
      mkdirSync(lockDir);
      break;
    } catch {
      if (Date.now() >= deadline) {
        throw new Error(`Timed out waiting for the build lock at ${lockDir}`);
      }
      await new Promise(done => setTimeout(done, BUILD_LOCK_POLL_MS));
    }
  }
  try {
    return fn();
  } finally {
    rmSync(lockDir, { recursive: true, force: true });
  }
}

interface VaultSecrets {
  [key: string]: string;
}

async function fetchSecretsFromVault(): Promise<VaultSecrets> {
  const vault = await createVaultClient();

  console.log(`Fetching secrets from Vault at ${VAULT_SECRET_PATH}...`);
  const result = await vault.read(VAULT_SECRET_PATH);
  const raw = result.data.data || result.data || result;
  return Object.fromEntries(
    Object.entries(raw as VaultSecrets).map(([k, v]) => [
      k,
      typeof v === 'string' ? v.trim() : v,
    ]),
  ) as VaultSecrets;
}

const vercelEnv = { ...process.env };
delete vercelEnv.NODE_EXTRA_CA_CERTS;
delete vercelEnv.FORCE_COLOR;

async function ensureProjectExists(
  projectName: string,
  teamId: string,
  settings: Record<string, unknown>,
  token: string,
): Promise<void> {
  const getRes = await fetch(
    `https://api.vercel.com/v9/projects/${projectName}?teamId=${teamId}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (getRes.ok) return;

  const createRes = await fetch(
    `https://api.vercel.com/v11/projects?teamId=${teamId}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: projectName, ...settings }),
    },
  );
  if (createRes.ok) {
    console.log(`✓ Project created: ${projectName}`);
  } else {
    console.warn(
      `⚠ Failed to create project ${projectName}: ${createRes.status} ${await createRes.text()}`,
    );
  }
}

async function applyProjectSettings(
  projectId: string,
  teamId: string,
  settings: Record<string, unknown>,
  token: string,
): Promise<void> {
  const res = await fetch(
    `https://api.vercel.com/v9/projects/${projectId}?teamId=${teamId}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    },
  );
  if (!res.ok) {
    console.warn(`⚠ Failed to apply project settings: ${res.status}`);
  } else {
    console.log('✓ Project settings applied');
  }
}

// "all" also covers production-target deployments, which every staging project
// is, including its immutable URLs.
const VERCEL_AUTHENTICATION_ALL_DEPLOYMENTS = {
  ssoProtection: { deploymentType: 'all' },
};

async function enableVercelAuthentication(
  projectId: string,
  teamId: string,
  token: string,
): Promise<void> {
  const res = await fetch(
    `https://api.vercel.com/v9/projects/${projectId}?teamId=${teamId}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(VERCEL_AUTHENTICATION_ALL_DEPLOYMENTS),
    },
  );
  if (!res.ok) {
    throw new Error(
      `Failed to enable Vercel Authentication: ${res.status} ${await res.text()}`,
    );
  }
  console.log('✓ Vercel Authentication enabled for all deployments');
}

async function vercelEnvAdd(
  key: string,
  value: string,
  environment: string,
): Promise<boolean> {
  try {
    execSync(`npx vercel env rm ${key} ${environment} --yes`, {
      stdio: 'pipe',
      env: vercelEnv,
    });
  } catch {
    // variable does not exist yet
  }
  try {
    execSync(`npx vercel env add ${key} ${environment}`, {
      input: value,
      stdio: ['pipe', 'inherit', 'inherit'],
      env: vercelEnv,
    });
    console.log(`✓ ${key}`);
    return true;
  } catch (e) {
    console.error(`✗ ${key}: failed to sync`, (e as Error).message);
    return false;
  }
}

async function listVercelEnvKeys(
  projectId: string,
  teamId: string,
  token: string,
  environment: string,
): Promise<string[]> {
  const res = await fetch(
    `https://api.vercel.com/v9/projects/${projectId}/env?teamId=${teamId}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) {
    console.warn(`⚠ Failed to list existing env vars: ${res.status}`);
    return [];
  }
  const { envs } = (await res.json()) as {
    envs: { key: string; target: string[] }[];
  };
  return envs.filter(e => e.target.includes(environment)).map(e => e.key);
}

async function vercelEnvRemove(
  key: string,
  environment: string,
): Promise<boolean> {
  try {
    // execFileSync (no shell) since key comes from the Vercel API rather
    // than local trusted config — avoids building a shell command string
    // out of a value from an external response.
    execFileSync('npx', ['vercel', 'env', 'rm', key, environment, '--yes'], {
      stdio: 'pipe',
      env: vercelEnv,
    });
    console.log(`✓ removed stale ${key}`);
    return true;
  } catch (e) {
    console.error(`✗ ${key}: failed to remove`, (e as Error).message);
    return false;
  }
}

async function pruneStaleVercelEnvVars(
  projectId: string,
  teamId: string,
  token: string,
  environment: string,
  expectedKeys: Set<string>,
): Promise<void> {
  const existingKeys = await listVercelEnvKeys(
    projectId,
    teamId,
    token,
    environment,
  );
  const staleKeys = existingKeys.filter(key => !expectedKeys.has(key));
  if (!staleKeys.length) return;

  console.log(
    `\nRemoving ${staleKeys.length} stale env var(s): ${staleKeys.join(', ')}`,
  );
  await Promise.all(staleKeys.map(key => vercelEnvRemove(key, environment)));
}

interface EnvKey {
  key: string;
  optional: boolean;
}

const OPTIONAL_MARKER = '# optional';

function parseEnvKeys(filePath: string): EnvKey[] {
  if (!existsSync(filePath)) return [];
  const lines = readFileSync(filePath, 'utf-8')
    .split('\n')
    .map(line => line.trim());
  return lines.flatMap((line, i) => {
    if (!line || line.startsWith('#')) return [];
    const key = line.split('=')[0].trim();
    return key ? [{ key, optional: lines[i - 1] === OPTIONAL_MARKER }] : [];
  });
}

async function main() {
  const args = process.argv.slice(2);
  const projectName = args[0];
  const environment = args[1] || STAGING;

  if (!projectName) {
    console.error(
      'Usage: npx tsx scripts/deploy-vercel.ts <project-name> [staging|production|demo]',
    );
    process.exit(1);
  }

  if (!ENVIRONMENTS.includes(environment)) {
    console.error(
      `Unknown environment "${environment}" (expected: ${ENVIRONMENTS.join(', ')})`,
    );
    process.exit(1);
  }

  if (!vercelEnv.VERCEL_PROJECT_ID || !vercelEnv.VERCEL_ORG_ID) {
    console.error('VERCEL_PROJECT_ID and VERCEL_ORG_ID must be set.');
    process.exit(1);
  }

  interface ProjectConfig {
    hardcodedSecrets?: Record<string, string>;
    envExamplePath?: string;
    settings?: Record<string, unknown>;
    // Gates every environment behind Vercel Authentication, not just staging.
    privateApp?: boolean;
  }

  const SUPABASE_PUBLIC_SECRETS = {
    NEXT_PUBLIC_SUPABASE_URL: SUPABASE_PUBLIC.url,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: SUPABASE_PUBLIC.publishableKey,
  };

  // employee-handler-ui reads these unprefixed (see libs/supabase.ts) so its
  // Docker image isn't locked to one Supabase project at build time — same
  // values, different key names than the other apps below, which still read
  // process.env.NEXT_PUBLIC_SUPABASE_* directly in client bundles.
  const EMPLOYEE_HANDLER_UI_SUPABASE_SECRETS = {
    SUPABASE_URL: SUPABASE_PUBLIC_SECRETS.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY:
      SUPABASE_PUBLIC_SECRETS.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  };

  const NX_VERCEL_SETTINGS = (nxProject: string, outputDirectory: string) => ({
    framework: 'nextjs',
    rootDirectory: 'projects/nx-workspace',
    buildCommand: `nx build ${nxProject}${
      STANDALONE_OUTPUT_PROJECTS.has(nxProject) ? ' --skip-nx-cache' : ''
    }`,
    installCommand: 'pnpm install --frozen-lockfile',
    outputDirectory,
  });

  const projectConfigs: Record<string, ProjectConfig> = {
    hearth: {
      hardcodedSecrets: {
        ...SUPABASE_PUBLIC_SECRETS,
        NEXT_PUBLIC_APP_URL: `https://${environment}-hearth.vercel.app/`,
        VB_EXPRESS_URL: `https://${environment}-vb-express.fly.dev`,
        MEDIA_SERVICE_URL: `https://${environment}-media-service.fly.dev`,
      },
      envExamplePath: 'apps/hearth/.env.local.example',
      settings: NX_VERCEL_SETTINGS('hearth', 'dist/apps/hearth/.next'),
    },
    'employee-handler-ui': {
      hardcodedSecrets: {
        ...EMPLOYEE_HANDLER_UI_SUPABASE_SECRETS,
        ...(environment === DEMO && { DEMO_MODE: 'true' }),
      },
      envExamplePath: 'apps/ui/employee-handler-ui/.env.example',
      settings: NX_VERCEL_SETTINGS(
        'employee-handler-ui',
        'dist/apps/ui/employee-handler-ui/.next',
      ),
    },
    'job-hunt-next': {
      hardcodedSecrets: { NEXT_PUBLIC_JOB_HUNT_DEMO: 'true' },
      settings: {
        ...NX_VERCEL_SETTINGS(
          'job-hunt-next',
          'dist/apps/ui/job-hunt-next/.next',
        ),
        buildCommand:
          'nx build job-hunt-next --skip-nx-cache && node apps/ui/job-hunt-next/scripts/check-personal-data.mjs',
      },
    },
    balloono: {
      hardcodedSecrets: { ...SUPABASE_PUBLIC_SECRETS },
      settings: NX_VERCEL_SETTINGS('balloono', 'dist/apps/ui/balloono/.next'),
    },
    'gravity-guy': {
      hardcodedSecrets: {},
      settings: NX_VERCEL_SETTINGS(
        'gravity-guy',
        'dist/apps/ui/gravity-guy/.next',
      ),
    },
    'weather-next': {
      hardcodedSecrets: {},
      settings: NX_VERCEL_SETTINGS(
        'weather-next',
        'dist/apps/ui/weather-next/.next',
      ),
    },
    'mobile-manager-next': {
      hardcodedSecrets: {
        ...SUPABASE_PUBLIC_SECRETS,
        VB_EXPRESS_URL: `https://${environment}-vb-express.fly.dev`,
      },
      envExamplePath: 'apps/mobile-manager-next/.env.example',
      privateApp: true,
      settings: NX_VERCEL_SETTINGS(
        'mobile-manager-next',
        'dist/apps/mobile-manager-next/.next',
      ),
    },
  };

  if (projectName === 'job-hunt-next' && environment !== DEMO) {
    throw new Error('Job Hunt uses Vercel only for its public demo.');
  }

  const config = projectConfigs[projectName];

  if (!config) {
    console.error(`Error: No configuration found for project "${projectName}"`);
    process.exit(1);
  }

  const { hardcodedSecrets, envExamplePath, settings, privateApp } = config;
  const envKeys = envExamplePath ? parseEnvKeys(resolve(envExamplePath)) : [];
  const allKeys = envKeys.map(({ key }) => key);
  const entriesFromVault = envKeys.filter(
    ({ key }) => !(key in (hardcodedSecrets ?? {})),
  );
  const keysFromVault = entriesFromVault.map(({ key }) => key);

  console.log(
    `\nDeploying secrets for ${projectName} to Vercel (${environment})...\n`,
  );

  const allSecrets: Record<string, string> = { ...hardcodedSecrets };

  if (keysFromVault.length || !vercelEnv.VERCEL_TOKEN) {
    console.log('Fetching vault secrets...');
    const vaultSecrets = await fetchSecretsFromVault();

    if (!vercelEnv.VERCEL_TOKEN && vaultSecrets.VERCEL_TOKEN) {
      vercelEnv.VERCEL_TOKEN = vaultSecrets.VERCEL_TOKEN;
    }

    const missingRequired: string[] = [];
    for (const { key, optional } of entriesFromVault) {
      const value = vaultSecrets[key];
      if (value) {
        allSecrets[key] = value;
      } else if (optional) {
        console.warn(`⚠ ${key}: optional, not found in vault, skipping`);
      } else {
        missingRequired.push(key);
      }
    }

    if (missingRequired.length) {
      console.error(
        `✗ Required key(s) missing from vault: ${missingRequired.join(', ')}`,
      );
      process.exit(1);
    }
  }

  if (settings && vercelEnv.VERCEL_TOKEN) {
    await ensureProjectExists(
      vercelEnv.VERCEL_PROJECT_ID,
      vercelEnv.VERCEL_ORG_ID,
      settings,
      vercelEnv.VERCEL_TOKEN,
    );
    await applyProjectSettings(
      vercelEnv.VERCEL_PROJECT_ID,
      vercelEnv.VERCEL_ORG_ID,
      settings,
      vercelEnv.VERCEL_TOKEN,
    );
  }

  if (environment === STAGING || privateApp) {
    await enableVercelAuthentication(
      vercelEnv.VERCEL_PROJECT_ID,
      vercelEnv.VERCEL_ORG_ID,
      vercelEnv.VERCEL_TOKEN,
    );
  }

  await pruneStaleVercelEnvVars(
    vercelEnv.VERCEL_PROJECT_ID,
    vercelEnv.VERCEL_ORG_ID,
    vercelEnv.VERCEL_TOKEN,
    VERCEL_ENV,
    // .env.example keys stay expected even when absent from Vault, so a missing
    // optional key is neither added nor pruned from a live deployment.
    new Set([...Object.keys(allSecrets), ...allKeys]),
  );

  console.log('Deploying secrets...');
  const results = await Promise.all(
    Object.entries(allSecrets).map(([key, value]) =>
      vercelEnvAdd(key, value, VERCEL_ENV),
    ),
  );

  const failures = results.filter(r => !r).length;
  if (failures > 0) {
    throw new Error(`${failures} secret(s) failed to deploy.`);
  }

  const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

  // The cwd, --output, buildEnv and .vercel clearing below are each
  // load-bearing — see "The build runs on the runner, not on Vercel" in
  // docs/app-development/ui/deployment/vercel-deploy-pattern.md.
  const buildEnv = { ...vercelEnv, ...allSecrets };

  const outputDir = resolve(repoRoot, VERCEL_OUTPUT_DIR);

  await withBuildLock(resolve(repoRoot, BUILD_LOCK_DIR), () => {
    // The whole .vercel directory, not just output: a stale project.json link
    // silently builds the previous app's project under this one's name.
    rmSync(resolve(repoRoot, VERCEL_DIR), { recursive: true, force: true });

    console.log(`\nBuilding ${projectName}...\n`);
    execSync(
      `npx vercel build --prod --yes --cwd "${repoRoot}" --output "${outputDir}"`,
      { stdio: 'inherit', env: buildEnv },
    );

    console.log(`\nDeploying ${projectName} to Vercel...\n`);
    // tgz uploads one archive instead of every output file; per-file uploads
    // exhaust the free plan's 5000 uploads/24h ("api-upload-free") mid-run.
    execSync(
      `npx vercel deploy --prebuilt --prod --yes --archive=tgz --cwd "${repoRoot}"`,
      { stdio: 'inherit', env: vercelEnv },
    );
  });

  console.log('\nDone!');
}

main().catch(err => {
  console.error('Deployment failed.', err);
  process.exit(1);
});
