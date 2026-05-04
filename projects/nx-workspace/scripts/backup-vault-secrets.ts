import { readFileSync } from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { getVaultToken } from './gcp-vault-token';

const VAULT_ADDR = 'https://10.0.1.1:8200';
const SECRET_PATH = 'kv/data/secrets';
const CERTS = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'vault-ca.crt',
);

backupVaultSecrets(VAULT_ADDR, SECRET_PATH, CERTS);

async function backupVaultSecrets(
  vaultAddr: string,
  secretPath: string,
  certs?: string,
) {
  const vaultToken = getVaultToken();

  const nodeVault = await import('node-vault');
  const requestOptions: Record<string, unknown> = {};

  if (certs) {
    requestOptions.httpsAgent = new https.Agent({
      ca: readFileSync(certs),
    });
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
