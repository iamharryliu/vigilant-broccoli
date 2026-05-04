import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { secretsMapping } from './secrets-mapping.config';
import { getVaultToken } from './gcp-vault-token';

const VAULT_CA_CERT_PATH = './scripts/vault-ca.crt';

interface VaultSecrets {
  [key: string]: string;
}

function parseEnvExample(filePath: string): string[] {
  if (!existsSync(filePath)) {
    console.error(`Error: .env.example not found at ${filePath}`);
    process.exit(1);
  }

  return readFileSync(filePath, 'utf-8')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))
    .map(line => line.split('=')[0].trim())
    .filter(Boolean);
}

async function fetchSecretsFromVault(vaultPath: string): Promise<VaultSecrets> {
  const vaultAddr = process.env.VAULT_ADDR || 'https://10.0.1.1:8200';
  const vaultToken = getVaultToken();

  console.log(`Connecting to Vault at ${vaultAddr}...`);

  const ca = readFileSync(VAULT_CA_CERT_PATH);
  const nodeVault = await import('node-vault');
  const vault = nodeVault.default({
    apiVersion: 'v1',
    endpoint: vaultAddr,
    token: vaultToken,
    requestOptions: { ca },
  });

  console.log(`Fetching secrets from Vault at ${vaultPath}...`);
  const result = await vault.read(vaultPath);
  return (result.data.data || result.data || result) as VaultSecrets;
}

function runFlyctl(command: string): void {
  try {
    execSync(command, { stdio: 'pipe' });
  } catch (error: unknown) {
    const execError = error as { stdout?: Buffer; stderr?: Buffer };
    if (execError.stdout) console.error(execError.stdout.toString());
    if (execError.stderr) console.error(execError.stderr.toString());
    process.exit(1);
  }
}

function getExistingSecretKeys(appName: string): string[] {
  try {
    const output = execSync(`flyctl secrets list --app ${appName} --json`, {
      stdio: 'pipe',
    }).toString();
    return (JSON.parse(output) as { name: string }[]).map(s => s.name);
  } catch {
    return [];
  }
}

async function deploySecretsToFlyio(
  appName: string,
  secrets: Record<string, string>,
  dryRun = false,
): Promise<void> {
  const incomingKeys = Object.keys(secrets).filter(k => secrets[k]);

  if (incomingKeys.length === 0) {
    console.log(`No secrets to deploy for ${appName}`);
    return;
  }

  const existingKeys = getExistingSecretKeys(appName);
  if (existingKeys.length > 0) {
    const unsetCommand = `flyctl secrets unset --app ${appName} ${existingKeys.join(' ')} --stage`;
    console.log(`\nClearing ${existingKeys.length} existing secret(s)...`);
    if (dryRun) {
      console.log(`[DRY RUN] Would execute: ${unsetCommand}`);
    } else {
      runFlyctl(unsetCommand);
    }
  }

  const secretsArg = incomingKeys
    .map(k => `${k}='${secrets[k].replace(/'/g, "'\\''")}'`)
    .join(' ');
  console.log(`\nDeploying ${incomingKeys.length} secrets to ${appName}...`);

  if (dryRun) {
    console.log(
      `[DRY RUN] Would set: ${incomingKeys.map(k => `${k}=***`).join(' ')}`,
    );
    return;
  }

  runFlyctl(`flyctl secrets set --app ${appName} ${secretsArg} --stage`);
  console.log(`Successfully staged secrets for ${appName}`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error(
      'Usage: npx tsx scripts/deploy-flyio-secrets.ts <app-name> [--dry-run]',
    );
    console.error('\nAvailable apps:');
    Object.keys(secretsMapping).forEach(app => console.error(`  - ${app}`));
    process.exit(1);
  }

  const projectName = args[0];
  const dryRun = args.includes('--dry-run');
  const config = secretsMapping[projectName];

  if (!config) {
    console.error(`Error: No configuration found for app "${projectName}"`);
    console.error('\nAvailable apps:');
    Object.keys(secretsMapping).forEach(app => console.error(`  - ${app}`));
    process.exit(1);
  }

  console.log(
    `\nDeploying secrets for ${projectName} (Fly app: ${config.flyAppName})`,
  );

  const envExamplePath = join(config.appPath, '.env.example');
  console.log(`Reading required secrets from ${envExamplePath}...`);

  const filteredEnvVars = parseEnvExample(envExamplePath).filter(
    key => !config.excludeEnvVars?.includes(key),
  );

  console.log(
    `Found ${filteredEnvVars.length} secrets to deploy: ${filteredEnvVars.join(', ')}`,
  );

  const vaultSecrets = await fetchSecretsFromVault(config.vaultPath);

  const secretsToDeploy: Record<string, string> = {};
  for (const key of filteredEnvVars) {
    const value = vaultSecrets[key];
    if (value) {
      secretsToDeploy[key] = value;
    } else {
      console.warn(`Warning: Secret "${key}" not found in Vault`);
    }
  }

  await deploySecretsToFlyio(config.flyAppName, secretsToDeploy, dryRun);

  console.log('\nDone!');
}

main().catch(error => {
  console.error('Secret deployment failed.', error);
  process.exit(1);
});
