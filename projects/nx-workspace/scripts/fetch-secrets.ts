import { spawn } from 'child_process';
import { readFileSync } from 'fs';
import 'dotenv/config';

async function fetchSecrets(
  vaultAddr: string,
  secretPath: string,
  certs?: string,
) {
  const vaultToken = process.env.VAULT_TOKEN;

  if (!vaultToken) {
    console.error('Error: VAULT_TOKEN environment variable is required');
    process.exit(1);
  }

  const nodeVault = await import('node-vault');
  const requestOptions: Record<string, unknown> = {};

  if (certs) {
    const ca = readFileSync(certs);
    requestOptions.ca = ca;
  }

  const vault = nodeVault.default({
    apiVersion: 'v1',
    endpoint: vaultAddr,
    token: vaultToken,
    requestOptions,
  });

  console.log(`Fetching secrets from Vault at ${secretPath}...`);

  const result = await vault.read(secretPath);
  const secrets = result.data.data || result.data || result;

  for (const [key, value] of Object.entries(secrets)) {
    if (typeof value === 'string') {
      process.env[key] = value;
    }
  }

  console.log(`✓ Secrets fetched successfully`);
  console.log(`✓ Total secrets: ${Object.keys(secrets).length}`);

  return secrets;
}

async function fetchSecretsAndServe() {
  const vaultAddr = 'https://10.0.1.1:8200';
  const secretPath = '/kv/data/secrets';

  await fetchSecrets(vaultAddr, secretPath);

  const args = process.argv.slice(2);
  if (args.length > 0) {
    console.log(`\nStarting: ${args.join(' ')}\n`);

    const child = spawn(args[0], args.slice(1), {
      stdio: 'inherit',
      env: { ...process.env },
      shell: true,
    });

    child.on('exit', code => {
      process.exit(code || 0);
    });
  }
}

fetchSecretsAndServe();
