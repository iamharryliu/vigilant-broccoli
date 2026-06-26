import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { getVaultToken } from './gcp-vault-token';

const VAULT_CA_CERT_PATH = './scripts/vault-ca.crt';
const VAULT_PATH = 'kv/data/secrets';
const PRODUCTION = 'production';

interface VaultSecrets {
  [key: string]: string;
}

async function fetchSecretsFromVault(): Promise<VaultSecrets> {
  const vaultAddr = process.env.VAULT_ADDR || 'https://10.0.1.1:8200';
  const vaultToken = getVaultToken();

  const ca = readFileSync(VAULT_CA_CERT_PATH);
  const nodeVault = await import('node-vault');
  const vault = nodeVault.default({
    apiVersion: 'v1',
    endpoint: vaultAddr,
    token: vaultToken,
    requestOptions: { ca },
  });

  console.log(`Fetching secrets from Vault at ${VAULT_PATH}...`);
  const result = await vault.read(VAULT_PATH);
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

  const hardcodedSecrets: Record<string, Record<string, string>> = {
    'next-demo': {
      NEXT_PUBLIC_SUPABASE_URL: 'https://jrdosjjgmsoodpjmjqxx.supabase.co',
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
        'sb_publishable_RuDKhGPtVemZN8USy9j0vA_kn42h7S0',
      NEXT_PUBLIC_APP_URL: 'https://vb-next-demo.vercel.app/',
      VB_EXPRESS_URL: 'https://vb-express.fly.dev',
    },
    'employee-handler-ui': {
      NEXT_PUBLIC_SUPABASE_URL: 'https://jrdosjjgmsoodpjmjqxx.supabase.co',
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
        'sb_publishable_RuDKhGPtVemZN8USy9j0vA_kn42h7S0',
    },
    findme: {
      NEXT_PUBLIC_SUPABASE_URL: 'https://jrdosjjgmsoodpjmjqxx.supabase.co',
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
        'sb_publishable_RuDKhGPtVemZN8USy9j0vA_kn42h7S0',
    },
  };

  const projectEnvExamples: Record<string, string> = {
    'next-demo': 'apps/next-demo/.env.local.example',
    'employee-handler-ui': 'apps/ui/employee-handler-ui/.env.example',
  };

  const hardcoded = hardcodedSecrets[projectName];
  const examplePath = projectEnvExamples[projectName];

  if (!hardcoded && !examplePath) {
    console.error(`Error: No configuration found for project "${projectName}"`);
    process.exit(1);
  }

  const allKeys = examplePath ? parseEnvKeys(resolve(examplePath)) : [];
  const keysFromVault = allKeys.filter(k => !(k in (hardcoded ?? {})));

  console.log(
    `\nDeploying secrets for ${projectName} to Vercel (${environment})...\n`,
  );

  const allSecrets: Record<string, string> = { ...hardcoded };

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
