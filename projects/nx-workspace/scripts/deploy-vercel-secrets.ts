import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import 'dotenv/config';

const VAULT_CA_CERT_PATH = './scripts/vault-ca.crt';
const VAULT_PATH = 'kv/data/secrets';

interface VaultSecrets {
  [key: string]: string;
}

async function fetchSecretsFromVault(): Promise<VaultSecrets> {
  const vaultAddr = process.env.VAULT_ADDR || 'https://10.0.1.1:8200';
  const vaultToken = process.env.VAULT_TOKEN;

  if (!vaultToken) {
    console.error('Error: VAULT_TOKEN environment variable is required');
    process.exit(1);
  }

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
  return (result.data.data || result.data || result) as VaultSecrets;
}

function vercelEnvAdd(key: string, value: string, environment: string) {
  try {
    execSync(`vercel env add ${key} ${environment} <<< '${value}'`, {
      stdio: 'pipe',
      shell: '/bin/bash',
    });
    console.log(`✓ ${key}`);
  } catch {
    // Already exists — remove and re-add
    try {
      execSync(`vercel env rm ${key} ${environment} --yes`, { stdio: 'pipe' });
      execSync(`vercel env add ${key} ${environment} <<< '${value}'`, {
        stdio: 'pipe',
        shell: '/bin/bash',
      });
      console.log(`✓ ${key} (updated)`);
    } catch (err: unknown) {
      const e = err as { stderr?: Buffer };
      console.error(`✗ ${key}: ${e.stderr?.toString() ?? String(err)}`);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const projectName = args[0];
  const environment = args[1] || 'production';

  if (!projectName) {
    console.error(
      'Usage: npx tsx scripts/deploy-vercel-secrets.ts <project-name> [environment]',
    );
    process.exit(1);
  }

  // Hardcoded public/non-sensitive vars per project
  const hardcodedSecrets: Record<string, Record<string, string>> = {
    'next-demo': {
      NEXT_PUBLIC_SUPABASE_URL: 'https://jrdosjjgmsoodpjmjqxx.supabase.co',
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
        'sb_publishable_RuDKhGPtVemZN8USy9j0vA_kn42h7S0',
      NEXT_PUBLIC_APP_URL: 'https://vb-next-demo.vercel.app/',
    },
  };

  // Vault-sourced keys per project
  const vaultKeys: Record<string, string[]> = {
    'next-demo': [
      'CLOUDFLARE_ACCOUNT_ID',
      'CLOUDFLARE_R2_ACCESS_KEY_ID',
      'CLOUDFLARE_R2_SECRET_ACCESS_KEY',
      'OPENAI_API_KEY',
    ],
  };

  const hardcoded = hardcodedSecrets[projectName];
  const keysFromVault = vaultKeys[projectName];

  if (!hardcoded && !keysFromVault) {
    console.error(`Error: No configuration found for project "${projectName}"`);
    process.exit(1);
  }

  console.log(
    `\nDeploying secrets for ${projectName} to Vercel (${environment})...\n`,
  );

  if (hardcoded) {
    console.log('Deploying hardcoded secrets...');
    for (const [key, value] of Object.entries(hardcoded)) {
      vercelEnvAdd(key, value, environment);
    }
  }

  if (keysFromVault?.length) {
    console.log('\nFetching vault secrets...');
    const vaultSecrets = await fetchSecretsFromVault();

    console.log('Deploying vault secrets...');
    for (const key of keysFromVault) {
      const value = vaultSecrets[key];
      if (value) {
        vercelEnvAdd(key, value, environment);
      } else {
        console.warn(`⚠ ${key}: not found in vault, skipping`);
      }
    }
  }

  console.log('\nDone!');
}

main().catch(err => {
  console.error('Secret deployment failed.', err);
  process.exit(1);
});
