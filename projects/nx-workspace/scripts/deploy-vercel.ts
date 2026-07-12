import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { createVaultClient, VAULT_SECRET_PATH } from './vault-client';

const PRODUCTION = 'production';

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
  const environment = args[1] || PRODUCTION;

  if (!projectName) {
    console.error(
      'Usage: npx tsx scripts/deploy-vercel.ts <project-name> [environment]',
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
        NEXT_PUBLIC_APP_URL: 'https://staging-vb-hearth.vercel.app/',
        VB_EXPRESS_URL: 'https://staging-vb-express.fly.dev',
      },
      envExamplePath: 'apps/hearth/.env.local.example',
      settings: NX_VERCEL_SETTINGS('hearth', 'dist/apps/hearth/.next'),
    },
    'employee-handler-ui': {
      hardcodedSecrets: { ...SUPABASE_PUBLIC_SECRETS },
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

  console.log('Deploying secrets...');
  const results = await Promise.all(
    Object.entries(allSecrets).map(([key, value]) =>
      vercelEnvAdd(key, value, environment),
    ),
  );

  const failures = results.filter(r => !r).length;
  if (failures > 0) {
    throw new Error(`${failures} secret(s) failed to deploy.`);
  }

  const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
  const deployArgs = [
    'deploy',
    environment === PRODUCTION && '--prod',
    '--yes',
    `"${repoRoot}"`,
  ]
    .filter(Boolean)
    .join(' ');
  console.log(`\nTriggering Vercel deployment for ${projectName}...\n`);
  execSync(`npx vercel ${deployArgs}`, {
    stdio: 'inherit',
    env: vercelEnv,
  });

  console.log('\nDone!');
}

main().catch(err => {
  console.error('Deployment failed.', err);
  process.exit(1);
});
