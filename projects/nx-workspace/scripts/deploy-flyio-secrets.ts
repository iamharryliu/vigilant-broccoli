import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { secretsMapping } from './secrets-mapping.config';

const VAULT_CA_CERT_PATH = './scripts/vault-ca.crt';

interface VaultSecrets {
  [key: string]: string;
}

function parseEnvExample(filePath: string): string[] {
  if (!existsSync(filePath)) {
    console.error(`Error: .env.example not found at ${filePath}`);
    process.exit(1);
  }

  const content = readFileSync(filePath, 'utf-8');
  const envVars: string[] = [];

  content.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key] = trimmedLine.split('=');
      if (key) {
        envVars.push(key.trim());
      }
    }
  });

  return envVars;
}

async function fetchSecretsFromVault(vaultPath: string): Promise<VaultSecrets> {
  const vaultAddr = process.env.VAULT_ADDR || 'https://127.0.0.1:8200';
  const vaultToken = process.env.VAULT_TOKEN;

  if (!vaultToken) {
    console.error('Error: VAULT_TOKEN environment variable is required');
    process.exit(1);
  }

  console.log(`Connecting to Vault at ${vaultAddr}...`);

  const ca = readFileSync(VAULT_CA_CERT_PATH);

  const nodeVault = await import('node-vault');
  const vault = nodeVault.default({
    apiVersion: 'v1',
    endpoint: vaultAddr,
    token: vaultToken,
    requestOptions: {
      ca,
    },
  });

  console.log(`Fetching secrets from Vault at ${vaultPath}...`);
  const result = await vault.read(vaultPath);

  const secrets = result.data.data || result.data || result;

  return secrets as VaultSecrets;
}

async function deploySecretsToFlyio(
  appName: string,
  secrets: Record<string, string>,
  dryRun = false
): Promise<void> {
  const secretPairs: string[] = [];

  for (const [key, value] of Object.entries(secrets)) {
    if (value) {
      secretPairs.push(`${key}=${value}`);
    }
  }

  if (secretPairs.length === 0) {
    console.log(`No secrets to deploy for ${appName}`);
    return;
  }

  const secretsArg = secretPairs.join(' ');
  const command = `flyctl secrets set --app ${appName} ${secretsArg} --stage`;

  console.log(`\nDeploying ${secretPairs.length} secrets to ${appName}...`);

  if (dryRun) {
    console.log(`[DRY RUN] Would execute: ${command.replace(/=([^\s]+)/g, '=***')}`);
    console.log(`[DRY RUN] Secrets: ${Object.keys(secrets).join(', ')}`);
    return;
  }

  execSync(command, { stdio: 'inherit' });
  console.log(`Successfully staged secrets for ${appName}`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: npx tsx scripts/deploy-flyio-secrets.ts <app-name> [--dry-run]');
    console.error('\nAvailable apps:');
    Object.keys(secretsMapping).forEach(app => {
      console.error(`  - ${app}`);
    });
    process.exit(1);
  }

  const projectName = args[0];
  const dryRun = args.includes('--dry-run');

  const config = secretsMapping[projectName];

  if (!config) {
    console.error(`Error: No configuration found for app "${projectName}"`);
    console.error('\nAvailable apps:');
    Object.keys(secretsMapping).forEach(app => {
      console.error(`  - ${app}`);
    });
    process.exit(1);
  }

  console.log(`\nDeploying secrets for ${projectName} (Fly app: ${config.flyAppName})`);

  const envExamplePath = join(config.appPath, '.env.example');
  console.log(`Reading required secrets from ${envExamplePath}...`);

  const requiredEnvVars = parseEnvExample(envExamplePath);

  const filteredEnvVars = requiredEnvVars.filter(
    envVar => !config.excludeEnvVars?.includes(envVar)
  );

  console.log(`Found ${filteredEnvVars.length} secrets to deploy: ${filteredEnvVars.join(', ')}`);

  const vaultSecrets = await fetchSecretsFromVault(config.vaultPath);

  const secretsToDeploy: Record<string, string> = {};

  for (const envVarName of filteredEnvVars) {
    const value = vaultSecrets[envVarName];

    if (value) {
      secretsToDeploy[envVarName] = value;
    } else {
      console.warn(`Warning: Secret "${envVarName}" not found in Vault`);
    }
  }

  await deploySecretsToFlyio(config.flyAppName, secretsToDeploy, dryRun);

  console.log('\nDone!');
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
