import { execSync, execFileSync } from 'child_process';
import { readFileSync, existsSync, mkdirSync, rmSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { createVaultClient, VAULT_SECRET_PATH } from './vault-client';

const STAGING = 'staging';
const PRODUCTION = 'production';
const ENVIRONMENTS = [STAGING, PRODUCTION];
const VERCEL_ENV = PRODUCTION;

const VERCEL_ROOT_DIRECTORY = 'projects/nx-workspace';
const VERCEL_OUTPUT_DIR = '.vercel/output';
const BUILD_LOCK_DIR = `${VERCEL_ROOT_DIRECTORY}/dist/.vercel-deploy-lock`;

const BUILD_LOCK_TIMEOUT_MS = 20 * 60 * 1000;
const BUILD_LOCK_POLL_MS = 500;

// Every app deploying from this workspace shares one .vercel directory —
// VERCEL_DIR is a hardcoded constant in the CLI, so there is nothing to
// redirect, and both the build and the upload have to run from the repo root.
// Concurrently the last `vercel build` pull wins, so apps read each other's
// project settings: four once ran `nx build whiteboard` together and Nx
// aborted the lot with "Recursive task invocation detected". Serialising the
// build and its upload as one unit removes that rather than narrowing the
// window. mkdir is the atomic primitive: it fails if the directory exists.
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

function parseEnvKeys(filePath: string): string[] {
  if (!existsSync(filePath)) return [];
  return readFileSync(filePath, 'utf-8')
    .split('\n')
    .filter(line => line && !line.startsWith('#'))
    .map(line => line.split('=')[0].trim())
    .filter(Boolean);
}

async function main() {
  const args = process.argv.slice(2);
  const projectName = args[0];
  const environment = args[1] || STAGING;

  if (!projectName) {
    console.error(
      'Usage: npx tsx scripts/deploy-vercel.ts <project-name> [staging|production]',
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
  }

  const SUPABASE_PUBLIC_SECRETS = {
    NEXT_PUBLIC_SUPABASE_URL: 'https://jrdosjjgmsoodpjmjqxx.supabase.co',
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      'sb_publishable_RuDKhGPtVemZN8USy9j0vA_kn42h7S0',
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
    buildCommand: `nx build ${nxProject}`,
    installCommand: 'pnpm install --frozen-lockfile',
    outputDirectory,
  });

  const projectConfigs: Record<string, ProjectConfig> = {
    hearth: {
      hardcodedSecrets: {
        ...SUPABASE_PUBLIC_SECRETS,
        NEXT_PUBLIC_APP_URL: `https://${environment}-hearth.vercel.app/`,
        VB_EXPRESS_URL: `https://${environment}-vb-express.fly.dev`,
      },
      envExamplePath: 'apps/hearth/.env.local.example',
      settings: NX_VERCEL_SETTINGS('hearth', 'dist/apps/hearth/.next'),
    },
    'employee-handler-ui': {
      hardcodedSecrets: { ...EMPLOYEE_HANDLER_UI_SUPABASE_SECRETS },
      envExamplePath: 'apps/ui/employee-handler-ui/.env.example',
      settings: NX_VERCEL_SETTINGS(
        'employee-handler-ui',
        'dist/apps/ui/employee-handler-ui/.next',
      ),
    },
    findme: {
      hardcodedSecrets: { ...SUPABASE_PUBLIC_SECRETS },
      settings: NX_VERCEL_SETTINGS('findme', 'dist/apps/findme/.next'),
    },
    whiteboard: {
      hardcodedSecrets: { ...SUPABASE_PUBLIC_SECRETS },
      settings: NX_VERCEL_SETTINGS('whiteboard', 'dist/apps/whiteboard/.next'),
    },
    'vb-manager-next-mobile': {
      hardcodedSecrets: {
        ...SUPABASE_PUBLIC_SECRETS,
        VB_EXPRESS_URL: `https://${environment}-vb-express.fly.dev`,
      },
      envExamplePath: 'apps/vb-manager-next-mobile/.env.example',
      settings: NX_VERCEL_SETTINGS(
        'vb-manager-next-mobile',
        'dist/apps/vb-manager-next-mobile/.next',
      ),
    },
  };

  const config = projectConfigs[projectName];

  if (!config) {
    console.error(`Error: No configuration found for project "${projectName}"`);
    process.exit(1);
  }

  const { hardcodedSecrets, envExamplePath, settings } = config;
  const allKeys = envExamplePath ? parseEnvKeys(resolve(envExamplePath)) : [];
  const keysFromVault = allKeys.filter(k => !(k in (hardcodedSecrets ?? {})));

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

    for (const key of keysFromVault) {
      const value = vaultSecrets[key];
      if (value) {
        allSecrets[key] = value;
      } else {
        console.warn(`⚠ ${key}: not found in vault, skipping`);
      }
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

  await pruneStaleVercelEnvVars(
    vercelEnv.VERCEL_PROJECT_ID,
    vercelEnv.VERCEL_ORG_ID,
    vercelEnv.VERCEL_TOKEN,
    VERCEL_ENV,
    new Set(Object.keys(allSecrets)),
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

  // Vercel's Hobby plan builds one deployment at a time, so letting it build
  // every Next.js app serialises them. Building on the runner and uploading the
  // result sidesteps that; only the upload still goes through Vercel.
  //
  // `vercel build` has to run the build itself — handed a `.next` some other
  // command produced, it packages nothing and dies resolving `next` from a
  // fabricated `apps/<app>/noop.js`. So the project keeps its real
  // `nx build <app>` buildCommand rather than a no-op.
  //
  // Build-time vars come from this env rather than the `.vercel/.env.*.local`
  // that `vercel pull` writes: with a rootDirectory set, the CLI writes that
  // file beside the cwd but reads it from cwd/rootDirectory, so it never loads
  // and any app building a Supabase client at module scope fails with
  // "supabaseUrl is required".
  const buildEnv = { ...vercelEnv, ...allSecrets };

  // Both commands run from the repo root, which forces them to share one
  // output directory, so the lock spans the pair rather than just the build.
  // The upload has to run from the repo root: the functions it uploads
  // reference their dependencies by repo-relative path
  // (projects/nx-workspace/node_modules/...) and it resolves them against its
  // cwd, so anywhere else it fails with "Please ensure project dependencies
  // have been installed". `--output` is passed explicitly because `vercel
  // build` defaults to <cwd>/<rootDirectory>/.vercel/output while the upload
  // reads <cwd>/.vercel/output, and left alone the two never meet.
  const outputDir = resolve(repoRoot, VERCEL_OUTPUT_DIR);

  await withBuildLock(resolve(repoRoot, BUILD_LOCK_DIR), () => {
    // A previous app's output would otherwise be uploaded to this project if
    // this build failed after the upload check.
    rmSync(outputDir, { recursive: true, force: true });

    console.log(`\nBuilding ${projectName}...\n`);
    execSync(
      `npx vercel build --prod --yes --cwd "${repoRoot}" --output "${outputDir}"`,
      { stdio: 'inherit', env: buildEnv },
    );

    console.log(`\nDeploying ${projectName} to Vercel...\n`);
    execSync(`npx vercel deploy --prebuilt --prod --yes --cwd "${repoRoot}"`, {
      stdio: 'inherit',
      env: vercelEnv,
    });
  });

  console.log('\nDone!');
}

main().catch(err => {
  console.error('Deployment failed.', err);
  process.exit(1);
});
