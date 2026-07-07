import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getVaultToken } from './gcp-vault-token';

const DEFAULT_VAULT_ADDR = 'https://10.0.1.1:8200';
const VAULT_CA_CERT = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'vault-ca.crt',
);
const CF_ACCESS_CLIENT_ID_HEADER = 'CF-Access-Client-Id';
const CF_ACCESS_CLIENT_SECRET_HEADER = 'CF-Access-Client-Secret';

export const VAULT_SECRET_PATH = 'kv/data/secrets';

// CI reaches Vault at vault.harryliu.dev behind a Cloudflare Access service
// token (VAULT_ADDR + CF_ACCESS_* env). Local runs default to the WireGuard
// address with the self-signed CA.
export async function createVaultClient() {
  const vaultAddr = process.env.VAULT_ADDR || DEFAULT_VAULT_ADDR;
  const cfAccessClientId = process.env.CF_ACCESS_CLIENT_ID;
  const cfAccessClientSecret = process.env.CF_ACCESS_CLIENT_SECRET;

  const requestOptions: Record<string, unknown> =
    cfAccessClientId && cfAccessClientSecret
      ? {
          headers: {
            [CF_ACCESS_CLIENT_ID_HEADER]: cfAccessClientId,
            [CF_ACCESS_CLIENT_SECRET_HEADER]: cfAccessClientSecret,
          },
        }
      : { ca: readFileSync(VAULT_CA_CERT) };

  console.error(`Connecting to Vault at ${vaultAddr}...`);

  const nodeVault = await import('node-vault');
  return nodeVault.default({
    apiVersion: 'v1',
    endpoint: vaultAddr,
    token: getVaultToken(),
    requestOptions,
  });
}
