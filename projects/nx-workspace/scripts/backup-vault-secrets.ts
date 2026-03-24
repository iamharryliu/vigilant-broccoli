import { readFileSync } from 'fs';
import 'dotenv/config';

const VAULT_ADDR = 'https://10.0.1.1:8200';
const SECRET_PATH = '/kv/data/secrets';

backupVaultSecrets(VAULT_ADDR, SECRET_PATH);

async function backupVaultSecrets(
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
    requestOptions.ca = readFileSync(certs, 'utf-8');
  }

  const vault = nodeVault.default({
    apiVersion: 'v1',
    endpoint: vaultAddr,
    token: vaultToken,
    requestOptions,
  });

  console.error(`Fetching secrets from Vault at ${secretPath}...`);

  const result = await vault.read(secretPath);
  const secrets = result.data.data || result.data || result;

  console.error(`✓ Total secrets fetched: ${Object.keys(secrets).length}`);
  process.stdout.write(JSON.stringify(secrets, null, 2));
}
